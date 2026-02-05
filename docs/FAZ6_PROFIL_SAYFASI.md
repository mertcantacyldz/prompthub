# Faz 6: Profil Sayfası Entegrasyonu

Bu fazda profil sayfaları, avatar yükleme ve settings sayfası Supabase ile entegre edildi.

## Oluşturulan/Güncellenen Dosyalar

### 1. Profile API (`app/lib/api/profile.ts`)

Profil işlemleri için API fonksiyonları:

```typescript
// Kullanıcı profili getir (ID ile)
getProfileById(userId: string): Promise<Profile | null>

// Kullanıcı profili getir (username ile)
getProfileByUsername(username: string): Promise<Profile | null>

// Profil güncelle
updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile>

// Username müsait mi kontrol et
isUsernameAvailable(username: string, currentUserId?: string): Promise<boolean>

// Avatar yükle
uploadAvatar(userId: string, file: File): Promise<string>

// Avatar sil
deleteAvatar(userId: string): Promise<void>

// Kullanıcı istatistikleri
getUserStats(userId: string): Promise<{
  promptCount: number;
  totalViews: number;
  totalCopies: number;
  savedCount: number;
}>
```

### 2. Profil Sayfası (`app/routes/profile._index.tsx`)

Giriş yapmış kullanıcının kendi profil sayfası:

**Özellikler:**
- Kullanıcı bilgileri (avatar, username, display name, bio)
- İstatistikler (prompt sayısı, kaydedilen, toplam görüntülenme, toplam kopya)
- Sekmeler: "My Prompts" ve "Saved"
- Private prompt'lar dahil tüm kullanıcı prompt'ları
- Edit Profile ve Settings butonları

**Kullanım:**
- URL: `/profile`
- Giriş yapılmamışsa `/auth/login`'e yönlendirir

### 3. Public Profil Sayfası (`app/routes/profile.$username.tsx`)

Herhangi bir kullanıcının herkese açık profil sayfası:

**Özellikler:**
- Kullanıcı bilgileri
- İstatistikler (prompt sayısı, toplam rating, ortalama puan)
- Sadece public prompt'lar gösterilir

**Kullanım:**
- URL: `/profile/:username`
- Örnek: `/profile/johndoe`

### 4. Settings Sayfası (`app/routes/settings.tsx`)

Kullanıcı ayarları sayfası:

**Profile Bölümü:**
- Avatar yükleme/silme (max 2MB, JPG/PNG/GIF)
- Username değiştirme (3-30 karakter, a-z, 0-9, _)
- Display name değiştirme
- Bio değiştirme

**Appearance Bölümü:**
- Tema seçimi (Light/Dark/System)

**Account Bölümü:**
- Email gösterimi

**Danger Zone:**
- Hesap silme (henüz aktif değil)

## Supabase Storage Kurulumu

Avatar yükleme için Supabase Storage'da bucket oluşturmanız gerekiyor:

### 1. Dashboard'dan Bucket Oluşturma

1. Supabase Dashboard > Storage
2. "New bucket" tıkla
3. Bucket adı: `avatars`
4. Public bucket: **Evet** (işaretle)
5. Create bucket

### 2. Storage Policies (SQL Editor'da çalıştır)

```sql
-- Herkes avatar dosyalarını görebilir
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Kullanıcılar kendi avatarlarını yükleyebilir
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Kullanıcılar kendi avatarlarını güncelleyebilir
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Kullanıcılar kendi avatarlarını silebilir
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Kullanım Örnekleri

### Profil Güncelleme

```typescript
import { updateProfile } from "~/lib/api";

// Profil bilgilerini güncelle
await updateProfile(userId, {
  username: "newusername",
  display_name: "John Doe",
  bio: "AI prompt enthusiast"
});
```

### Avatar Yükleme

```typescript
import { uploadAvatar } from "~/lib/api";

// Dosya input'undan gelen file
const file = event.target.files[0];

// Avatar yükle (otomatik olarak profildeki avatar_url güncellenir)
const avatarUrl = await uploadAvatar(userId, file);
```

### Username Kontrolü

```typescript
import { isUsernameAvailable } from "~/lib/api";

// Mevcut kullanıcıyı hariç tutarak kontrol
const available = await isUsernameAvailable("newusername", currentUserId);

if (!available) {
  showError("Bu username zaten alınmış");
}
```

### Kullanıcı İstatistikleri

```typescript
import { getUserStats } from "~/lib/api";

const stats = await getUserStats(userId);
// stats = { promptCount: 5, totalViews: 120, totalCopies: 45, savedCount: 12 }
```

## Bileşen Yapısı

### Profile Sayfası Flow
```
/profile
  ├── Auth Check → Redirect to /auth/login if not logged in
  ├── Fetch Data
  │   ├── getUserPrompts(userId, true) // Include private
  │   ├── getSavedPrompts(userId)
  │   └── getUserStats(userId)
  └── Render
      ├── Profile Header (Avatar, Name, Bio)
      ├── Stats Cards (4 boxes)
      └── Tabs
          ├── My Prompts → PromptCard list
          └── Saved → PromptCard list
```

### Settings Sayfası Flow
```
/settings
  ├── Auth Check → Redirect if not logged in
  ├── Load Profile Data → Form fields
  └── Render
      ├── Profile Card
      │   ├── Avatar Upload/Delete
      │   ├── Username Input (with validation)
      │   ├── Display Name Input
      │   ├── Bio Textarea
      │   └── Save Button
      ├── Appearance Card
      │   └── Theme Selector (Light/Dark/System)
      ├── Account Card
      │   └── Email Display
      └── Danger Zone Card
          └── Delete Account Button
```

## Validasyon Kuralları

### Username
- Minimum: 3 karakter
- Maksimum: 30 karakter
- Sadece: a-z, A-Z, 0-9, _
- Benzersiz olmalı
- Otomatik lowercase'e çevrilir

### Avatar
- Maksimum boyut: 2MB
- Desteklenen formatlar: JPG, PNG, GIF
- Yükleme sırasında eski avatar silinir

## Hata Yönetimi

Tüm API çağrıları try-catch ile sarılmıştır ve hatalar toast notification ile gösterilir:

```typescript
try {
  await updateProfile(userId, updates);
  toast({ title: "Success", description: "Profile updated" });
} catch (error) {
  toast({
    title: "Error",
    description: "Failed to update profile",
    variant: "destructive"
  });
}
```

## Sonraki Adımlar (Faz 7)

- [ ] 404 sayfası
- [ ] Error boundaries
- [ ] Mobile responsiveness kontrolü
- [ ] Accessibility kontrolü
- [ ] SEO optimizasyonu
