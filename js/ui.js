/**
 * ui.js - Kullanıcı Arayüzü Çizim Sistemi
 * Oyundaki tüm UI elemanlarını canvas üzerine çizer:
 * - Kaynak göstergeleri
 * - Bina seçim paneli
 * - Gece/gündüz bilgisi
 * - Menü ve oyun sonu ekranları
 * - Kale can çubuğu
 */

class ArayuzYoneticisi {
    constructor() {
        this.secilenBinaTuru = null;
        this.panelBinalari = Object.values(BINA_TURU);
        this.bildirimler = []; // Ekranda gösterilecek bildirimler
        this.fareUzerindeBina = null; // Fare hangi bina butonunun üzerinde
    }

    /**
     * Üst bilgi çubuğunu çizer - kaynaklar, dalga bilgisi, gece/gün
     */
    ustPanelCiz(ctx, kaynaklar, gece, dalgaNo, kaleCan, kaleMaxCan, gunSayaci) {
        // Panel arkaplanı
        ctx.fillStyle = RENKLER.UI_ARKAPLAN;
        ctx.fillRect(0, GRID_SATIR * HUCRE_BOYUTU, CANVAS_GENISLIK, UI_YUKSEKLIK);

        // Üst çizgi
        ctx.strokeStyle = RENKLER.UI_KENAR;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, GRID_SATIR * HUCRE_BOYUTU);
        ctx.lineTo(CANVAS_GENISLIK, GRID_SATIR * HUCRE_BOYUTU);
        ctx.stroke();

        const panelY = GRID_SATIR * HUCRE_BOYUTU;

        // ===== SOL: Kaynaklar =====
        ctx.font = 'bold 14px Arial';
        let solX = 15;

        // Altın
        ctx.fillStyle = RENKLER.UI_ALTIN;
        ctx.fillText('⚜ Altın:', solX, panelY + 22);
        ctx.fillStyle = RENKLER.UI_YAZI;
        ctx.fillText(kaynaklar.altin.toString(), solX + 65, panelY + 22);

        // Taş
        ctx.fillStyle = RENKLER.UI_TAS;
        ctx.fillText('◆ Taş:', solX, panelY + 42);
        ctx.fillStyle = RENKLER.UI_YAZI;
        ctx.fillText(kaynaklar.tas.toString(), solX + 55, panelY + 42);

        // Yiyecek
        ctx.fillStyle = RENKLER.UI_YIYECEK;
        ctx.fillText('❋ Yiyecek:', solX, panelY + 62);
        ctx.fillStyle = RENKLER.UI_YAZI;
        ctx.fillText(kaynaklar.yiyecek.toString(), solX + 80, panelY + 62);

        // ===== ORTA: Bina Seçim Butonları =====
        const butonGenislik = 65;
        const butonYukseklik = 55;
        const butonBaslangicX = 170;
        const butonY = panelY + 10;

        for (let i = 0; i < this.panelBinalari.length; i++) {
            const binaTuru = this.panelBinalari[i];
            const binaVeri = BINA_VERILERI[binaTuru];
            const butonX = butonBaslangicX + i * (butonGenislik + 8);

            // Buton arkaplanı
            const secili = this.secilenBinaTuru === binaTuru;
            const fareUzerinde = this.fareUzerindeBina === binaTuru;
            
            if (secili) {
                ctx.fillStyle = RENKLER.UI_SECILI;
                ctx.strokeStyle = RENKLER.UI_ALTIN;
            } else if (fareUzerinde) {
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            } else {
                ctx.fillStyle = 'rgba(255,255,255,0.05)';
                ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            }

            // Yuvarlatılmış köşeli buton
            this._yuvarlatilmisDikdortgen(ctx, butonX, butonY, butonGenislik, butonYukseklik, 6);
            ctx.fill();
            ctx.lineWidth = secili ? 2 : 1;
            this._yuvarlatilmisDikdortgen(ctx, butonX, butonY, butonGenislik, butonYukseklik, 6);
            ctx.stroke();

            // Bina ikonu (küçük önizleme)
            ctx.save();
            ctx.translate(butonX + butonGenislik / 2 - 15, butonY + 3);
            ctx.scale(0.75, 0.75);
            BINA_CIZIMLERI[binaTuru](ctx, 0, 0);
            ctx.restore();

            // Kısayol tuşu
            ctx.fillStyle = 'rgba(255,215,0,0.7)';
            ctx.font = 'bold 10px Arial';
            ctx.fillText(binaVeri.kisayol, butonX + 4, butonY + 12);

            // Maliyet göstergeleri
            ctx.font = '9px Arial';
            let maliyetY = butonY + butonYukseklik - 5;
            
            // Yeterli kaynak yoksa kırmızı göster
            const yeterli = kaynaklar.yeterliMi(binaVeri.altinMaliyet, binaVeri.tasMaliyet, binaVeri.yiyecekMaliyet);
            ctx.fillStyle = yeterli ? 'rgba(255,255,255,0.7)' : 'rgba(255,80,80,0.7)';
            
            let maliyetStr = '';
            if (binaVeri.altinMaliyet > 0) maliyetStr += binaVeri.altinMaliyet + '💰 ';
            if (binaVeri.tasMaliyet > 0) maliyetStr += binaVeri.tasMaliyet + '🪨 ';
            if (binaVeri.yiyecekMaliyet > 0) maliyetStr += binaVeri.yiyecekMaliyet + '🌾';
            ctx.fillText(maliyetStr, butonX + 3, maliyetY);
        }

        // ===== SAĞ: Durum Bilgisi =====
        const sagX = CANVAS_GENISLIK - 200;

        // Gece/Gündüz ve dalga bilgisi
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = gece ? '#FF7043' : '#FDD835';
        ctx.fillText(gece ? '🌙 GECE' : '☀ GÜNDÜZ', sagX, panelY + 22);

        ctx.font = '13px Arial';
        ctx.fillStyle = RENKLER.UI_YAZI;
        ctx.fillText('Dalga: ' + dalgaNo, sagX, panelY + 42);

        // Skor
        ctx.fillStyle = RENKLER.UI_ALTIN;
        ctx.fillText('Skor: ' + kaynaklar.skor, sagX, panelY + 60);

        // Gündüz sayacı veya gece başlat butonu
        if (!gece && gunSayaci > 0) {
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('⏱ ' + Math.ceil(gunSayaci) + 's', sagX + 110, panelY + 22);

            // "Geceyi Başlat" butonu
            this._geceButonuCiz(ctx, sagX + 100, panelY + 35, 90, 28);
        }

        // Kale can çubuğu (üstte)
        this._kaleCanCubuguCiz(ctx, kaleCan, kaleMaxCan);
    }

    /**
     * "Geceyi Başlat" butonunu çizer
     */
    _geceButonuCiz(ctx, x, y, g, u) {
        ctx.fillStyle = 'rgba(244, 67, 54, 0.6)';
        this._yuvarlatilmisDikdortgen(ctx, x, y, g, u, 4);
        ctx.fill();
        ctx.strokeStyle = 'rgba(244, 67, 54, 0.9)';
        ctx.lineWidth = 1;
        this._yuvarlatilmisDikdortgen(ctx, x, y, g, u, 4);
        ctx.stroke();

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Geceyi Başlat', x + g / 2, y + u / 2 + 4);
        ctx.textAlign = 'left';
    }

    /**
     * Kale can çubuğunu üst ortada çizer
     */
    _kaleCanCubuguCiz(ctx, kaleCan, kaleMaxCan) {
        const cubukGenislik = 200;
        const cubukYukseklik = 14;
        const cubukX = (CANVAS_GENISLIK - cubukGenislik) / 2;
        const cubukY = 8;
        const canOrani = kaleCan / kaleMaxCan;

        // Arkaplan
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this._yuvarlatilmisDikdortgen(ctx, cubukX - 2, cubukY - 2, cubukGenislik + 4, cubukYukseklik + 4, 4);
        ctx.fill();

        // Can çubuğu
        const renk = canOrani > 0.6 ? '#4CAF50' : canOrani > 0.3 ? '#FF9800' : '#F44336';
        ctx.fillStyle = renk;
        if (canOrani > 0) {
            this._yuvarlatilmisDikdortgen(ctx, cubukX, cubukY, cubukGenislik * canOrani, cubukYukseklik, 3);
            ctx.fill();
        }

        // Metin
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏰 Kale: ' + kaleCan + ' / ' + kaleMaxCan, CANVAS_GENISLIK / 2, cubukY + cubukYukseklik - 2);
        ctx.textAlign = 'left';
    }

    /**
     * Tooltip (bina bilgi kutusu) çizer
     */
    tooltipCiz(ctx, fareX, fareY) {
        if (!this.fareUzerindeBina) return;

        const veri = BINA_VERILERI[this.fareUzerindeBina];
        const genislik = 180;
        const yukseklik = 65;
        let tipX = fareX + 10;
        let tipY = fareY - yukseklik - 10;

        // Ekran sınırları kontrolü
        if (tipX + genislik > CANVAS_GENISLIK) tipX = fareX - genislik - 10;
        if (tipY < 0) tipY = fareY + 20;

        // Tooltip arkaplanı
        ctx.fillStyle = 'rgba(10, 15, 30, 0.92)';
        this._yuvarlatilmisDikdortgen(ctx, tipX, tipY, genislik, yukseklik, 6);
        ctx.fill();
        ctx.strokeStyle = RENKLER.UI_KENAR;
        ctx.lineWidth = 1;
        this._yuvarlatilmisDikdortgen(ctx, tipX, tipY, genislik, yukseklik, 6);
        ctx.stroke();

        // İçerik
        ctx.fillStyle = RENKLER.UI_ALTIN;
        ctx.font = 'bold 12px Arial';
        ctx.fillText(veri.isim, tipX + 8, tipY + 18);

        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '11px Arial';
        ctx.fillText(veri.aciklama, tipX + 8, tipY + 34);
        ctx.fillText('❤ Can: ' + veri.maxCan, tipX + 8, tipY + 50);

        if (veri.menzil) {
            ctx.fillText('🎯 Menzil: ' + veri.menzil + ' | Hasar: ' + veri.hasar, tipX + 8, tipY + 50);
        }
    }

    /**
     * Başlangıç menüsünü çizer
     */
    menuCiz(ctx, zaman) {
        // Karanlık arkaplan
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_GENISLIK, CANVAS_YUKSEKLIK);

        // Başlık
        const titresim = Math.sin(zaman * 2) * 3;
        ctx.fillStyle = RENKLER.UI_ALTIN;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚔ KUM KALESİ ⚔', CANVAS_GENISLIK / 2, 180 + titresim);

        // Alt başlık
        ctx.fillStyle = '#ECEFF1';
        ctx.font = '18px Arial';
        ctx.fillText('Çöl Savunma Oyunu', CANVAS_GENISLIK / 2, 220);

        // Açıklama
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '14px Arial';
        ctx.fillText('Gündüz binalarını inşa et, gece düşmanlardan kalenizi koruyun!', CANVAS_GENISLIK / 2, 270);

        // Başla butonu
        const butonX = CANVAS_GENISLIK / 2 - 100;
        const butonY = 320;
        const butonG = 200;
        const butonU = 50;

        const parlama = 0.6 + Math.sin(zaman * 3) * 0.15;
        ctx.fillStyle = `rgba(76, 175, 80, ${parlama})`;
        this._yuvarlatilmisDikdortgen(ctx, butonX, butonY, butonG, butonU, 10);
        ctx.fill();
        ctx.strokeStyle = '#81C784';
        ctx.lineWidth = 2;
        this._yuvarlatilmisDikdortgen(ctx, butonX, butonY, butonG, butonU, 10);
        ctx.stroke();

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('OYUNA BAŞLA', CANVAS_GENISLIK / 2, butonY + 32);

        // Kontroller bilgisi
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '12px Arial';
        ctx.fillText('🖱 Fare: Bina yerleştir  |  1-6: Bina seç  |  Sağ tık: İptal  |  Boşluk: Geceyi başlat', 
                     CANVAS_GENISLIK / 2, 420);
        ctx.fillText('M: Müzik aç/kapa  |  S: Ses aç/kapa', CANVAS_GENISLIK / 2, 445);

        // Dune Keepers ilham notu
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '11px Arial';
        ctx.fillText('Dune Keepers (Brackeys Game Jam 2024) ilhamıyla', CANVAS_GENISLIK / 2, 520);

        ctx.textAlign = 'left';
    }

    /**
     * Oyun bitti ekranını çizer
     */
    oyunBittiCiz(ctx, kaynaklar, dalgaNo, zaman) {
        // Karanlık arkaplan
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, CANVAS_GENISLIK, CANVAS_YUKSEKLIK);

        ctx.textAlign = 'center';

        // Başlık
        ctx.fillStyle = '#F44336';
        ctx.font = 'bold 42px Arial';
        ctx.fillText('💀 OYUN BİTTİ 💀', CANVAS_GENISLIK / 2, 180);

        // İstatistikler
        ctx.fillStyle = '#ECEFF1';
        ctx.font = '20px Arial';
        ctx.fillText('Hayatta Kalınan Gece: ' + (dalgaNo - 1), CANVAS_GENISLIK / 2, 240);

        ctx.fillStyle = RENKLER.UI_ALTIN;
        ctx.font = 'bold 28px Arial';
        ctx.fillText('Toplam Skor: ' + kaynaklar.skor, CANVAS_GENISLIK / 2, 290);

        // Tekrar oyna butonu
        const butonX = CANVAS_GENISLIK / 2 - 100;
        const butonY = 340;
        const butonG = 200;
        const butonU = 50;

        const parlama = 0.6 + Math.sin(zaman * 3) * 0.15;
        ctx.fillStyle = `rgba(33, 150, 243, ${parlama})`;
        this._yuvarlatilmisDikdortgen(ctx, butonX, butonY, butonG, butonU, 10);
        ctx.fill();
        ctx.strokeStyle = '#64B5F6';
        ctx.lineWidth = 2;
        this._yuvarlatilmisDikdortgen(ctx, butonX, butonY, butonG, butonU, 10);
        ctx.stroke();

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('TEKRAR OYNA', CANVAS_GENISLIK / 2, butonY + 32);

        ctx.textAlign = 'left';
    }

    /**
     * Gece/gündüz geçiş animasyonunu çizer
     */
    gecisCiz(ctx, oran, geceye) {
        const opaklık = Math.sin(oran * Math.PI) * 0.6;
        ctx.fillStyle = geceye ? 
            `rgba(10, 14, 39, ${opaklık})` : 
            `rgba(255, 220, 100, ${opaklık})`;
        ctx.fillRect(0, 0, CANVAS_GENISLIK, CANVAS_YUKSEKLIK);

        // Geçiş metni
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 32px Arial';
        ctx.globalAlpha = Math.sin(oran * Math.PI);
        ctx.fillText(geceye ? '🌙 Gece Başlıyor...' : '☀ Gün Doğuyor...', 
                     CANVAS_GENISLIK / 2, CANVAS_YUKSEKLIK / 2 - 30);
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
    }

    /**
     * Ekran bildirimlerini çizer ve günceller
     */
    bildirimleriGuncelle(ctx, deltaZaman) {
        for (let i = this.bildirimler.length - 1; i >= 0; i--) {
            const bildirim = this.bildirimler[i];
            bildirim.omur -= deltaZaman;
            bildirim.y -= deltaZaman * 30;

            if (bildirim.omur <= 0) {
                this.bildirimler.splice(i, 1);
                continue;
            }

            ctx.globalAlpha = bildirim.omur / bildirim.maxOmur;
            ctx.fillStyle = bildirim.renk;
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(bildirim.metin, bildirim.x, bildirim.y);
            ctx.textAlign = 'left';
            ctx.globalAlpha = 1;
        }
    }

    /**
     * Yeni bildirim ekler (hasar sayısı, kaynak kazanımı vs.)
     */
    bildirimEkle(metin, x, y, renk = '#FFF') {
        this.bildirimler.push({
            metin: metin,
            x: x,
            y: y,
            renk: renk,
            omur: 1.2,
            maxOmur: 1.2
        });
    }

    /**
     * Fare konumuna göre panel bina buton tespiti
     */
    panelFareKontrol(fareX, fareY) {
        const panelY = GRID_SATIR * HUCRE_BOYUTU;
        const butonGenislik = 65;
        const butonYukseklik = 55;
        const butonBaslangicX = 170;
        const butonY = panelY + 10;

        this.fareUzerindeBina = null;

        for (let i = 0; i < this.panelBinalari.length; i++) {
            const butonX = butonBaslangicX + i * (butonGenislik + 8);
            if (noktaDikdortgenIcinde(fareX, fareY, butonX, butonY, butonGenislik, butonYukseklik)) {
                this.fareUzerindeBina = this.panelBinalari[i];
                return this.panelBinalari[i];
            }
        }

        return null;
    }

    /**
     * "Geceyi Başlat" butonuna tıklanıp tıklanmadığını kontrol eder
     */
    geceButonuKontrol(fareX, fareY) {
        const sagX = CANVAS_GENISLIK - 200;
        const panelY = GRID_SATIR * HUCRE_BOYUTU;
        return noktaDikdortgenIcinde(fareX, fareY, sagX + 100, panelY + 35, 90, 28);
    }

    /**
     * Menü "Başla" butonuna tıklanıp tıklanmadığını kontrol eder
     */
    baslaButonuKontrol(fareX, fareY) {
        return noktaDikdortgenIcinde(fareX, fareY, 
            CANVAS_GENISLIK / 2 - 100, 320, 200, 50);
    }

    /**
     * "Tekrar Oyna" butonuna tıklanıp tıklanmadığını kontrol eder
     */
    tekrarButonuKontrol(fareX, fareY) {
        return noktaDikdortgenIcinde(fareX, fareY, 
            CANVAS_GENISLIK / 2 - 100, 340, 200, 50);
    }

    /**
     * Yuvarlatılmış dikdörtgen çizer (path oluşturur, fill/stroke yapılmalı)
     */
    _yuvarlatilmisDikdortgen(ctx, x, y, genislik, yukseklik, yaricap) {
        ctx.beginPath();
        ctx.moveTo(x + yaricap, y);
        ctx.lineTo(x + genislik - yaricap, y);
        ctx.quadraticCurveTo(x + genislik, y, x + genislik, y + yaricap);
        ctx.lineTo(x + genislik, y + yukseklik - yaricap);
        ctx.quadraticCurveTo(x + genislik, y + yukseklik, x + genislik - yaricap, y + yukseklik);
        ctx.lineTo(x + yaricap, y + yukseklik);
        ctx.quadraticCurveTo(x, y + yukseklik, x, y + yukseklik - yaricap);
        ctx.lineTo(x, y + yaricap);
        ctx.quadraticCurveTo(x, y, x + yaricap, y);
        ctx.closePath();
    }
}
