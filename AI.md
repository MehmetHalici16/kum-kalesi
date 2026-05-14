# Yapay Zeka Kullanım Bilgisi

Bu projede bazı teknik sorular için yapay zeka aracından yararlanılmıştır.

## Kullanılan Araç
- **Google Gemini** - Teknik soru-cevap

## Kullanım Biçimi
Proje geliştirme sürecinde belirli teknik konularda bilgi almak ve hata çözmek amacıyla yapay zekaya sorular yöneltilmiştir. Kodların yazımı ve oyun tasarımı tarafımca yapılmıştır.

## Promptlar ve Cevaplar

### Prompt 1
**Soru:** "Canvas API'de requestAnimationFrame ile oyun döngüsü nasıl kurulur? Delta zaman hesaplaması nasıl yapılır?"

**Cevap:** `requestAnimationFrame` callback fonksiyonuna bir timestamp parametresi gelir. Bir önceki kare ile arasındaki farkı alarak delta zamanı hesaplayabilirsin. Böylece oyun farklı FPS'lerde aynı hızda çalışır. Örnek:
```js
let sonKare = 0;
function oyunDongusu(zaman) {
    const dt = (zaman - sonKare) / 1000;
    sonKare = zaman;
    // güncelle ve çiz
    requestAnimationFrame(oyunDongusu);
}
```

### Prompt 2
**Soru:** "Web Audio API ile programatik olarak ses efekti nasıl üretilir? Kütüphane kullanmadan basit bir patlama sesi yapmak istiyorum."

**Cevap:** `AudioContext` oluşturup `OscillatorNode` ve `GainNode` kullanarak farklı dalga tipleriyle (sine, square, sawtooth) ses üretebilirsin. Patlama sesi için düşük frekanslı sawtooth dalga + beyaz gürültü (noise buffer) birleştirilir. `gain.exponentialRampToValueAtTime` ile sesin azalması sağlanır.

### Prompt 3
**Soru:** "Canvas'ta grid tabanlı harita sistemi için fare tıklamasını grid koordinatlarına nasıl çevirebilirim?"

**Cevap:** Canvas üzerindeki fare pozisyonunu `getBoundingClientRect()` ile alıp, hücre boyutuna bölerek grid koordinatını bulabilirsin:
```js
const rect = canvas.getBoundingClientRect();
const fareX = e.clientX - rect.left;
const sutun = Math.floor(fareX / hucreBoyutu);
```

### Prompt 4
**Soru:** "Tower defense oyununda düşmanların kaleye doğru yürümesi için basit bir hareket sistemi nasıl yazılır? A* pathfinding çok karmaşık geldi."

**Cevap:** Basit yaklaşım olarak `Math.atan2` ile düşmandan kaleye doğru açı hesaplayıp, `cos` ve `sin` ile x/y hızı belirleyebilirsin. Düşman bir binaya denk gelirse o binaya saldırmasını sağlarsın. Tam pathfinding yerine bu "direct movement + obstacle attack" yöntemi game jam oyunlarında sıkça kullanılır.

### Prompt 5
**Soru:** "Canvas'ta parçacık efektleri (particle effects) nasıl yapılır? Patlama ve toz efekti eklemek istiyorum."

**Cevap:** Her parçacık için x, y, hızX, hızY, ömür ve boyut tut. Her karede konumu hıza göre güncelle, ömrü azalt, opaklığı ömür oranına bağla. Yerçekimi için hızY'ye her karede sabit bir değer ekle. Patlama için rastgele yönlerde 10-15 parçacık oluştur.

### Prompt 6
**Soru:** "itch.io game jam'lerde son 5 yılda ilk %10'a girmiş ilginç oyunlar var mı? Tower defense benzeri bir şey arıyorum."

**Cevap:** Brackeys Game Jam 2024.2'de birinci olan "Dune Keepers" önerildi. Gündüz inşa / gece savunma döngüsü mekaniği var. Unity ile yapılmış, 2D Canvas'a uyarlanabilir. GMTK 2024 ve Ludum Dare 54-55'ten de bazı öneriler verildi.

### Prompt 7
**Soru:** "Canvas üzerinde yuvarlatılmış köşeli dikdörtgen (rounded rectangle) nasıl çizilir?"

**Cevap:** `quadraticCurveTo` ile köşelerde kavis oluşturabilirsin. `beginPath` ile başlayıp her köşede `lineTo` + `quadraticCurveTo` kombinasyonuyla çizilir.

## Not
Yapay zeka aracı yalnızca belirli teknik konularda danışma amacıyla kullanılmıştır. Oyun tasarımı, kod mimarisi, bina/düşman dengeleme ve tüm kodlama süreci tarafımca gerçekleştirilmiştir.
