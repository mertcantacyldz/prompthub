# Kimlik Doğrulama Sistemi (Authentication)

Bu döküman, Promptopia projesindeki kimlik doğrulama mimarisini, `AuthProvider` bileşenini ve `auth-context.tsx` dosyasının rollerini açıklar.

## 1. AuthProvider Nedir?

`AuthProvider`, React'in **Context API** özelliğini kullanarak uygulamanın her yerinden erişilebilen bir "kimlik doğrulama merkezi" oluşturur. Uygulamanın en üst seviyesinde (`root.tsx`) bulunur ve tüm alt bileşenlere kullanıcı bilgilerini sağlar.

## 2. Neden Kullanıyoruz?

*   **Merkezi Yönetim:** Giriş/çıkış işlemlerini tek bir yerden kontrol etmek, kod tekrarını önler.
*   **Prop Drilling Önleme:** Kullanıcı bilgisini Header, Sidebar veya herhangi bir buton bileşenine tek tek "el ile" aktarmak yerine, ihtiyacı olan bileşenin `useAuth()` hook'u ile veriye anında ulaşmasını sağlar.
*   **Güvenlik:** Kullanıcının oturum durumunu Supabase ile sürekli senkronize tutarak, yetkisiz erişimleri (örneğin giriş yapmadan profil sayfasına gitme) engellememize yardımcı olur.

## 3. Nasıl Çalışıyor?

Mimari, sunucu (SSR) ve istemci (Client) tarafının uyumu üzerine kuruludur:

### A. Sunucu Tarafı (Initial State)
Sayfa ilk açıldığında `root.tsx` loader'ı Supabase'den kullanıcıyı çeker ve bunu `initialUser` olarak `AuthProvider`'a gönderir. Bu, sayfanın "boş" görünmesini engeller (Hydration).

### B. İstemci Tarafı (Reactivity)
`AuthProvider`, Supabase'in `onAuthStateChange` dinleyicisini kullanarak şu durumları takip eder:
*   **Giriş (SIGNED_IN):** Kullanıcı state'ini günceller ve verileri yeniler.
*   **Çıkış (SIGNED_OUT):** State'i temizler ve kullanıcıyı ana sayfaya yönlendirir.
*   **Token Yenileme:** Oturumun sürekli açık kalmasını sağlar.

## 4. Kritik Yapılar ve Fonksiyonlar

### `useRevalidator` (Veri Tazeleme)
En profesyonel yaklaşımlardan biri olan bu araç, kimlik durumu değiştiğinde (örneğin login olunduğunda) sayfadaki tüm `loader`'ların otomatik olarak tekrar çalışmasını sağlar. Bu sayede manuel sayfa yenileme (`F5`) gereksiz hale gelir.

### `Sync Effect` (Senkronizasyon)
`initialUser` ve `initialProfile` gibi props'lar değiştiğinde, iç state'i bu verilere göre güncelleyen bir `useEffect` mekanizmasıdır. Bu, SPA (Single Page Application) navigasyonunda verilerin güncel kalmasını sağlar.

### Sağlanan Fonksiyonlar:
*   `signInWithEmail`: E-posta ve şifre ile giriş.
*   `signInWithGoogle/Github`: Sosyal medya ile giriş.
*   `signOut`: Oturumu güvenli bir şekilde kapatma.
*   `refreshProfile`: Profil bilgilerini manuel olarak güncelleme.

## 5. Kullanım Örneği

Herhangi bir bileşende kullanıcı adına ulaşmak için:

```tsx
const { user, profile, signOut } = useAuth();

if (user) {
  return <p>Hoş geldin, {profile?.username}</p>;
}
```

---
*Bu mimari, uygulamanın hem hızlı çalışmasını hem de geliştirici dostu olmasını sağlar.*
