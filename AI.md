# AI.md - Yapay Zeka Araçları Kullanım Dökümantasyonu

Bu projede yapay zeka araçlarından yararlanılmıştır. Aşağıda kullanılan araçlar, yöneltilenler sorular ve alınan cevapların özeti bulunmaktadır.

## Kullanılan Araç
- **Google Gemini (Antigravity)** - Kod geliştirme asistanı

## Kullanım Biçimi
Yapay zeka aracı aşağıdaki amaçlarla kullanılmıştır:
1. Oyun mimarisi ve dosya yapısının planlanması
2. itch.io game jam araştırması ve uygun oyun seçimi
3. Canvas API ile temel çizim fonksiyonlarının oluşturulması
4. Oyun mekaniği tasarımı (gündüz/gece döngüsü, dalga sistemi)
5. Web Audio API ile ses üretimi

## Promptlar ve Cevaplar

### Prompt 1
**Soru:** "bu projeyi yapmak istiyorum" (proje dokümanı paylaşıldı)

**Cevap:** Proje gereksinimleri analiz edildi. Puanlama kriterleri çıkarıldı. itch.io game jam araştırması yapılarak 3 aday oyun belirlendi:
- Dune Keepers (Tower Defense)
- Little Slime Blows Up (Fizik-tabanlı platform)
- Burn With Me (Kart strateji)

### Prompt 2
**Soru:** "kriterleri güzelce karşılayabileceğimiz zengin bir proje yapsak daha iyi olur. dolayısıyla oyunu seçerken buna dikkat edelim"

**Cevap:** Seçenek 1 (Dune Keepers - Tower Defense) önerildi. Tüm puanlama kriterlerini en güçlü karşılayan, sahne zenginliği ve mekanik karmaşıklığı en yüksek olan seçenek olarak belirlendi.

### Prompt 3
**Soru:** "tamamdır seçenek 1'i seçiyoruz"

**Cevap:** Proje implementasyonu başlatıldı. Dosya yapısı oluşturuldu ve tüm JS modülleri kodlandı:
- utils.js: Oyun sabitleri ve yardımcı fonksiyonlar
- audio.js: Web Audio API ile ses sistemi
- resources.js: Kaynak yönetimi
- grid.js: Grid harita sistemi
- buildings.js: Bina sınıfları
- enemies.js: Düşman ve dalga sistemi
- projectiles.js: Mermi sistemi
- particles.js: Parçacık efektleri
- ui.js: Arayüz yönetimi
- game.js: Ana oyun döngüsü

## Not
Yapay zeka aracı rehberlik ve kod üretimi için kullanılmıştır. Tüm kodlar incelenmiş, anlaşılmış ve projeye uyarlanmıştır.
