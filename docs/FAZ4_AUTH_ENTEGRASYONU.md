# Faz 4: Authentication Entegrasyonu

Bu dokümanda Faz 4'te oluşturulan dosyalar, ne işe yaradıkları ve nasıl kullanılacakları açıklanmaktadır.

---

## Oluşturulan/Güncellenen Dosyalar

### 1. `app/context/auth-context.tsx`

#### Ne İşe Yarar?
AuthContext, uygulamanın her yerinden kullanıcı oturum bilgilerine erişim sağlayan bir React Context'tir. Supabase Auth ile entegre çalışır.

#### İçindekiler

```typescript
interface AuthContextType {
  user: User | null;           // Supabase Auth user objesi
  profile: Profile | null;     // profiles tablosundaki kullanıcı bilgileri
  session: Session | null;     // Aktif oturum
  isLoading: boolean;          // Auth durumu yüklenirken true
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithGithub: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
```

#### Kullanım

```tsx
import { useAuth } from "~/context";

function MyComponent() {
  const { user, profile, isLoading, signOut } = useAuth();

  if (isLoading) return <p>Loading...</p>;

  if (!user) return <p>Please log in</p>;

  return (
    <div>
      <p>Welcome, {profile?.username}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

---

### 2. `app/routes/auth.login.tsx`

#### Ne İşe Yarar?
Kullanıcıların email/şifre veya OAuth (Google, GitHub) ile giriş yapabilecekleri login sayfası.

#### Özellikler
- Email/şifre ile giriş
- Google OAuth ile giriş
- GitHub OAuth ile giriş
- Loading durumları
- Toast bildirimleri
- Form validation

#### Kullanım
Sayfa `/auth/login` URL'inde otomatik olarak render edilir.

---

### 3. `app/routes/auth.register.tsx`

#### Ne İşe Yarar?
Yeni kullanıcıların hesap oluşturabilecekleri kayıt sayfası.

#### Özellikler
- Email/şifre ile kayıt
- Username seçimi (benzersizlik kontrolü)
- Google/GitHub OAuth ile kayıt
- Form validation:
  - Username: min 3 karakter, sadece harf/rakam/underscore
  - Password: min 6 karakter
  - Password confirmation
- Toast bildirimleri

#### Kullanım
Sayfa `/auth/register` URL'inde otomatik olarak render edilir.

---

### 4. `app/routes/auth.callback.tsx`

#### Ne İşe Yarar?
OAuth (Google, GitHub) ile giriş yapıldığında Supabase'in yönlendirdiği callback sayfası. Token'ları işler ve kullanıcıyı ana sayfaya yönlendirir.

#### Akış
1. Kullanıcı Google/GitHub ile giriş yapar
2. Provider, kullanıcıyı `/auth/callback` URL'ine yönlendirir
3. Supabase token'ları hash fragment'tan okur
4. Session oluşturulur
5. Kullanıcı ana sayfaya yönlendirilir

#### Kullanım
Bu sayfa otomatik olarak çalışır, manuel kullanım gerektirmez.

---

### 5. `app/components/layout/Header.tsx` (Güncellendi)

#### Yapılan Değişiklikler
- `useAuth` hook'u entegre edildi
- Props yerine context'ten user bilgisi alınıyor
- Logout butonu artık `signOut` fonksiyonunu çağırıyor
- Toast bildirimi eklendi

#### Önceki Kullanım
```tsx
<Header user={user} />
```

#### Yeni Kullanım
```tsx
<Header />  // Props gerektirmez, AuthContext'ten alır
```

---

### 6. `app/root.tsx` (Güncellendi)

#### Yapılan Değişiklikler
- `AuthProvider` eklendi
- Tüm uygulama AuthContext ile sarmalandı

#### Provider Sıralaması
```tsx
<ThemeProvider>
  <AuthProvider>
    <TooltipProvider>
      {/* App content */}
    </TooltipProvider>
  </AuthProvider>
</ThemeProvider>
```

---

## Supabase Dashboard Ayarları

### Authentication > URL Configuration

OAuth'un düzgün çalışması için Supabase Dashboard'da şu ayarların yapılması gerekir:

1. **Site URL**: `http://localhost:5173` (development)
2. **Redirect URLs**:
   - `http://localhost:5173/auth/callback`

### Authentication > Providers

1. **Email**: Varsayılan olarak aktif
2. **Google** (opsiyonel):
   - Google Cloud Console'dan OAuth credentials oluştur
   - Client ID ve Client Secret'ı Supabase'e ekle
3. **GitHub** (opsiyonel):
   - GitHub Developer Settings'den OAuth App oluştur
   - Client ID ve Client Secret'ı Supabase'e ekle

---

## Auth Flow Diyagramı

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Login      │     │   Supabase   │     │   Profile    │
│   Page       │────▶│   Auth       │────▶│   Loaded     │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │    Email/Pass      │                    │
       │    or OAuth        │                    │
       │                    ▼                    │
       │             ┌──────────────┐            │
       │             │   Session    │            │
       │             │   Created    │            │
       │             └──────────────┘            │
       │                    │                    │
       │                    ▼                    │
       │             ┌──────────────┐            │
       │             │   Fetch      │────────────┘
       │             │   Profile    │
       │             └──────────────┘
       │                    │
       ▼                    ▼
┌──────────────────────────────────────────────┐
│              AuthContext Updated              │
│  • user: Supabase User                       │
│  • profile: Database Profile                 │
│  • session: Active Session                   │
└──────────────────────────────────────────────┘
```

---

## Önemli Notlar

### 1. Profile Oluşturma
Yeni kullanıcı kaydolduğunda, `profiles` tablosunda otomatik olarak bir kayıt oluşturulur (database trigger ile). Username daha sonra güncellenir.

### 2. OAuth ile Giriş
OAuth ile giriş yapan kullanıcılar için username otomatik olarak email'in @ öncesi kısmından oluşturulur.

### 3. Session Persistence
Supabase session'ları localStorage'da saklar. Sayfa yenilendiğinde oturum korunur.

### 4. Protected Routes
Henüz oluşturulmadı. Faz 5'te `ProtectedRoute` component'i eklenecek.

---

## Test Senaryoları

1. **Email ile Kayıt**
   - `/auth/register` sayfasına git
   - Form'u doldur ve "Create Account" tıkla
   - Email doğrulama mesajı görüntülenmeli

2. **Email ile Giriş**
   - `/auth/login` sayfasına git
   - Email ve şifre gir
   - Ana sayfaya yönlendirilmeli
   - Header'da avatar görünmeli

3. **OAuth ile Giriş**
   - "Continue with Google/GitHub" tıkla
   - Provider'da oturum aç
   - `/auth/callback` üzerinden ana sayfaya dön
   - Header'da avatar görünmeli

4. **Logout**
   - Header'daki avatar'a tıkla
   - "Log out" seç
   - Login/Sign up butonları görünmeli

---

## Sonraki Adımlar (Faz 5)

- ProtectedRoute component
- Prompt CRUD işlemleri
- User profil sayfası güncelleme
