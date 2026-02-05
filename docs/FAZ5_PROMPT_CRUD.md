# Faz 5: Prompt CRUD Entegrasyonu

Bu dokümanda Faz 5'te oluşturulan dosyalar, ne işe yaradıkları ve nasıl kullanılacakları açıklanmaktadır.

---

## Oluşturulan Dosyalar

### 1. `app/lib/api/prompts.ts`

#### Ne İşe Yarar?
Prompt CRUD (Create, Read, Update, Delete) işlemlerini yöneten API fonksiyonları.

#### Fonksiyonlar

```typescript
// Filtreleme ve pagination ile prompt listesi getir
getPrompts(filters: PromptFilters): Promise<PaginatedResponse<PromptWithDetails>>

// Tek bir prompt getir (ID ile)
getPromptById(id: string): Promise<PromptWithDetails | null>

// Yeni prompt oluştur
createPrompt(prompt: PromptInsert): Promise<Prompt>

// Prompt güncelle
updatePrompt(id: string, updates: PromptUpdate): Promise<Prompt>

// Prompt sil
deletePrompt(id: string): Promise<void>

// Görüntülenme sayısını artır
incrementViewCount(id: string): Promise<void>

// Kopyalanma sayısını artır
incrementCopyCount(id: string): Promise<void>

// Kullanıcının promptlarını getir
getUserPrompts(userId: string, includePrivate?: boolean): Promise<PromptWithDetails[]>
```

#### PromptFilters Interface

```typescript
interface PromptFilters {
  search?: string;           // Başlık/açıklama/metin araması
  categories?: string[];     // Kategori filtreleri
  platforms?: string[];      // AI platform filtreleri
  modality?: string;         // Input tipi filtresi
  sortBy?: "newest" | "oldest" | "most_viewed" | "most_copied" | "highest_rated";
  userId?: string;           // Belirli kullanıcının promptları
  isPublic?: boolean;        // Public/Private filtresi
  page?: number;             // Sayfa numarası
  limit?: number;            // Sayfa başına sonuç
}
```

#### Kullanım Örneği

```typescript
import { getPrompts, createPrompt } from "~/lib/api";

// Filtrelenmiş promptları getir
const result = await getPrompts({
  search: "email",
  categories: ["Writing/Content"],
  sortBy: "newest",
  page: 1,
  limit: 12,
});

// Yeni prompt oluştur
const newPrompt = await createPrompt({
  user_id: user.id,
  title: "My Prompt",
  prompt_text: "Prompt content...",
  categories: ["Programming"],
  ai_platforms: ["ChatGPT"],
});
```

---

### 2. `app/lib/api/ratings.ts`

#### Ne İşe Yarar?
Prompt puanlama sistemi için API fonksiyonları.

#### Fonksiyonlar

```typescript
// Kullanıcının verdiği puanı getir
getUserRating(userId: string, promptId: string): Promise<Rating | null>

// Prompt'a puan ver (oluştur veya güncelle)
ratePrompt(userId: string, promptId: string, score: number): Promise<Rating>

// Puanı sil
deleteRating(userId: string, promptId: string): Promise<void>

// Prompt'un puan istatistiklerini getir (view üzerinden)
getPromptRatingStats(promptId: string): Promise<{ count: number; average: number }>
```

#### Kullanım Örneği

```typescript
import { ratePrompt, getUserRating } from "~/lib/api";

// Mevcut puanı kontrol et
const existingRating = await getUserRating(user.id, promptId);

// Puan ver (1-5 arası)
const rating = await ratePrompt(user.id, promptId, 5);
```

---

### 3. `app/lib/api/saved.ts`

#### Ne İşe Yarar?
Prompt kaydetme (bookmark) sistemi için API fonksiyonları.

#### Fonksiyonlar

```typescript
// Prompt kaydedilmiş mi kontrol et
isPromptSaved(userId: string, promptId: string): Promise<boolean>

// Prompt'u kaydet
savePrompt(userId: string, promptId: string): Promise<SavedPrompt>

// Kaydı kaldır
unsavePrompt(userId: string, promptId: string): Promise<void>

// Kaydetme durumunu toggle et
toggleSavePrompt(userId: string, promptId: string): Promise<boolean>

// Kullanıcının kaydedilmiş promptlarını getir
getSavedPrompts(userId: string): Promise<PromptWithDetails[]>

// Prompt'un kaç kez kaydedildiğini getir
getPromptSaveCount(promptId: string): Promise<number>
```

#### Kullanım Örneği

```typescript
import { toggleSavePrompt, getSavedPrompts } from "~/lib/api";

// Kaydetme durumunu değiştir
const isSaved = await toggleSavePrompt(user.id, promptId);
// isSaved: true = kaydedildi, false = kaldırıldı

// Kaydedilmiş promptları getir
const savedPrompts = await getSavedPrompts(user.id);
```

---

### 4. `app/lib/api/index.ts`

Tüm API fonksiyonlarını tek yerden export eder.

```typescript
export * from "./prompts";
export * from "./ratings";
export * from "./saved";
```

---

## Güncellenen Sayfalar

### 1. `app/routes/home.tsx` (Ana Sayfa)

#### Yapılan Değişiklikler
- Mock data kaldırıldı, gerçek Supabase verisi kullanılıyor
- Filtreleme ve pagination Supabase ile çalışıyor
- Kaydetme işlevi gerçek API'ye bağlandı
- Loading skeleton eklendi
- Boş sonuç durumu eklendi

#### Özellikler
- URL query parametreleri ile filtreleme (`?category=Programming&platform=ChatGPT`)
- Arama (`?q=email`)
- Sıralama (`?sort=newest`)
- Pagination (`?page=2`)

---

### 2. `app/routes/prompts.$id.tsx` (Prompt Detay)

#### Yapılan Değişiklikler
- Mock data kaldırıldı, Supabase'den veri çekiliyor
- Görüntülenme sayısı otomatik artıyor
- Kopyalama sayısı artıyor
- Kaydetme işlevi çalışıyor
- Puanlama sistemi çalışıyor
- Sadece prompt sahibi edit butonunu görüyor
- Loading skeleton eklendi

---

### 3. `app/routes/prompts.new.tsx` (Yeni Prompt)

#### Yapılan Değişiklikler
- Giriş yapmamış kullanıcılar login'e yönlendiriliyor
- Form validation eklendi
- Gerçek Supabase'e kayıt yapılıyor
- Başarılı kayıt sonrası detay sayfasına yönlendirme
- Loading state eklendi

---

### 4. `app/routes/prompts.$id.edit.tsx` (Prompt Düzenleme)

#### Yapılan Değişiklikler
- Mevcut prompt verisi yükleniyor
- Sadece prompt sahibi düzenleyebiliyor
- Güncelleme Supabase'e kaydediliyor
- Silme işlevi çalışıyor (onay dialog'u ile)
- Loading state'ler eklendi

---

## Veri Akışı Diyagramı

```
┌─────────────────────────────────────────────────────────────┐
│                     Ana Sayfa (home.tsx)                     │
├─────────────────────────────────────────────────────────────┤
│  URL Params ─────► getPrompts() ─────► PromptList           │
│  (filters)              │                   │               │
│                         ▼                   ▼               │
│              Supabase Query            Render Cards          │
│                         │                   │               │
│                         ▼                   ▼               │
│              PaginatedResponse         onSave/onClick       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Detay Sayfası (prompts.$id.tsx)            │
├─────────────────────────────────────────────────────────────┤
│  params.id ─────► getPromptById() ─────► Render Detail      │
│                         │                    │              │
│                         ▼                    ▼              │
│              PromptWithDetails          Actions:            │
│                                         - Copy (incrementCopyCount)
│                                         - Save (toggleSavePrompt)
│                                         - Rate (ratePrompt)
│                                         - Edit (if owner)
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 Düzenleme (prompts.$id.edit.tsx)            │
├─────────────────────────────────────────────────────────────┤
│  Form Data ─────► updatePrompt() ─────► Redirect            │
│              or   deletePrompt()                            │
└─────────────────────────────────────────────────────────────┘
```

---

## RLS (Row Level Security) Davranışları

| İşlem | Public Prompt | Private Prompt | Kendi Prompt'u |
|-------|---------------|----------------|----------------|
| Görüntüleme | ✅ | ❌ | ✅ |
| Kopyalama | ✅ | ❌ | ✅ |
| Kaydetme | ✅ | ❌ | ✅ |
| Puanlama | ✅ | ❌ | ✅ |
| Düzenleme | ❌ | ❌ | ✅ |
| Silme | ❌ | ❌ | ✅ |

---

## API Hata Yönetimi

Tüm API fonksiyonları hata durumunda exception fırlatır:

```typescript
try {
  const prompt = await getPromptById(id);
} catch (error) {
  // Hata yönetimi
  toast({
    title: "Error",
    description: "Failed to load prompt.",
    variant: "destructive",
  });
}
```

---

## Test Senaryoları

### 1. Prompt Listeleme
- Ana sayfada promptlar görünmeli
- Filtreleme çalışmalı (kategori, platform, arama)
- Pagination çalışmalı
- Sıralama çalışmalı

### 2. Prompt Detay
- Prompt detayları görünmeli
- Kopyalama çalışmalı
- Kaydetme çalışmalı (giriş yapılmışsa)
- Puanlama çalışmalı (giriş yapılmışsa)
- Edit butonu sadece sahibe görünmeli

### 3. Prompt Oluşturma
- Giriş yapmadan erişim → Login'e yönlendirme
- Boş form submit → Validation hatası
- Geçerli form submit → Kayıt ve yönlendirme

### 4. Prompt Düzenleme
- Başkasının prompt'u → Access denied
- Güncelleme → Değişiklikler kaydedilmeli
- Silme → Onay sonrası silme

### 5. Kaydetme & Puanlama
- Giriş yapmadan kaydetme → Login'e yönlendirme
- Kaydet → savedPrompts'a eklenmeli
- Tekrar kaydet → Kaldırılmalı
- Puan ver → Rating kaydedilmeli
- Tekrar puan ver → Güncellenmeli

---

## Sonraki Adımlar (Faz 6)

- Profil sayfası
- Kullanıcının promptları listesi
- Kaydedilen promptlar listesi
- Avatar yükleme (Supabase Storage)
