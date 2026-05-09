/**
 * game.js - Ana Oyun Döngüsü
 * Tüm oyun sistemlerini koordine eder ve canvas üzerine çizer.
 */

class Oyun {
    constructor() {
        // Canvas ayarları
        this.canvas = document.getElementById('oyunCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CANVAS_GENISLIK;
        this.canvas.height = CANVAS_YUKSEKLIK;

        // Oyun sistemleri
        this.grid = new Grid();
        this.kaynaklar = new KaynakYoneticisi();
        this.dalgaYoneticisi = new DalgaYoneticisi();
        this.arayuz = new ArayuzYoneticisi();
        this.parcacikYoneticisi = new ParcacikYoneticisi();

        // Oyun durumu
        this.durum = OYUN_DURUMU.MENU;
        this.kaleCan = KALE_MAX_CAN;
        this.gunSayaci = GUNDUZ_SURESI;
        this.gecisZamani = 0;
        this.gecisSuresi = 1.5;

        // Oyun nesneleri
        this.dusmanlar = [];
        this.mermiler = [];

        // Zamanlama
        this.sonKare = 0;
        this.toplamZaman = 0;

        // Fare durumu
        this.fareX = null;
        this.fareY = null;

        // Olay dinleyicileri
        this._olaylariDinle();

        // Oyun döngüsünü başlat
        requestAnimationFrame((z) => this._oyunDongusu(z));
    }

    /** Olay dinleyicilerini ayarlar */
    _olaylariDinle() {
        // Fare hareketleri
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const olcekX = this.canvas.width / rect.width;
            const olcekY = this.canvas.height / rect.height;
            this.fareX = (e.clientX - rect.left) * olcekX;
            this.fareY = (e.clientY - rect.top) * olcekY;
            if (this.durum === OYUN_DURUMU.GUNDUZ) {
                this.arayuz.panelFareKontrol(this.fareX, this.fareY);
            }
        });

        // Fare tıklama
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const olcekX = this.canvas.width / rect.width;
            const olcekY = this.canvas.height / rect.height;
            const tX = (e.clientX - rect.left) * olcekX;
            const tY = (e.clientY - rect.top) * olcekY;
            this._tiklamaIsleme(tX, tY);
        });

        // Sağ tıklama - bina seçimini iptal et
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (this.arayuz.secilenBinaTuru) {
                this.arayuz.secilenBinaTuru = null;
                sesYoneticisi.butonSesi();
            }
        });

        // Klavye
        document.addEventListener('keydown', (e) => {
            this._tusIsleme(e.key);
        });
    }

    /** Tıklama işleme */
    _tiklamaIsleme(tX, tY) {
        sesYoneticisi.baslat(); // İlk etkileşimde Audio Context başlat

        if (this.durum === OYUN_DURUMU.MENU) {
            if (this.arayuz.baslaButonuKontrol(tX, tY)) {
                this._oyunuBaslat();
            }
            return;
        }

        if (this.durum === OYUN_DURUMU.OYUN_BITTI) {
            if (this.arayuz.tekrarButonuKontrol(tX, tY)) {
                this._oyunuBaslat();
            }
            return;
        }

        if (this.durum === OYUN_DURUMU.GUNDUZ) {
            // Panel bina seçimi
            const panelBina = this.arayuz.panelFareKontrol(tX, tY);
            if (panelBina) {
                this.arayuz.secilenBinaTuru = (this.arayuz.secilenBinaTuru === panelBina) ? null : panelBina;
                sesYoneticisi.butonSesi();
                return;
            }

            // "Geceyi Başlat" butonu
            if (this.arayuz.geceButonuKontrol(tX, tY)) {
                this._geceyeGec();
                return;
            }

            // Grid üzerine bina yerleştirme
            if (this.arayuz.secilenBinaTuru && tY < GRID_SATIR * HUCRE_BOYUTU) {
                this._binaYerlestir(tX, tY);
            }
        }
    }

    /** Klavye tuş işleme */
    _tusIsleme(tus) {
        if (this.durum === OYUN_DURUMU.GUNDUZ) {
            // 1-6 tuşları bina seçimi
            const binaListesi = Object.values(BINA_TURU);
            const index = parseInt(tus) - 1;
            if (index >= 0 && index < binaListesi.length) {
                const yeniTur = binaListesi[index];
                this.arayuz.secilenBinaTuru = (this.arayuz.secilenBinaTuru === yeniTur) ? null : yeniTur;
                sesYoneticisi.butonSesi();
            }

            // Escape - iptal
            if (tus === 'Escape') {
                this.arayuz.secilenBinaTuru = null;
            }

            // Space - geceyi başlat
            if (tus === ' ') {
                this._geceyeGec();
            }
        }

        // M - müzik aç/kapa
        if (tus === 'm' || tus === 'M') {
            sesYoneticisi.muzikAcKapa();
        }

        // S - ses aç/kapa
        if (tus === 's' || tus === 'S') {
            sesYoneticisi.sesAcKapa();
        }
    }

    /** Oyunu başlatır/sıfırlar */
    _oyunuBaslat() {
        this.grid = new Grid();
        this.kaynaklar.sifirla();
        this.dalgaYoneticisi.sifirla();
        this.parcacikYoneticisi.temizle();
        this.dusmanlar = [];
        this.mermiler = [];
        this.kaleCan = KALE_MAX_CAN;
        this.gunSayaci = GUNDUZ_SURESI;
        this.durum = OYUN_DURUMU.GUNDUZ;
        this.arayuz.secilenBinaTuru = null;
        sesYoneticisi.baslat();
        sesYoneticisi.gunduzMuzigi();
        sesYoneticisi.gunduzBaslangiçSesi();
    }

    /** Bina yerleştirme */
    _binaYerlestir(tX, tY) {
        const gridPos = pikseledenGride(tX, tY);
        if (!gridIcindeMi(gridPos.sutun, gridPos.satir)) return;

        const binaTuru = this.arayuz.secilenBinaTuru;
        const veri = BINA_VERILERI[binaTuru];

        // Kaynak kontrolü
        if (!this.kaynaklar.yeterliMi(veri.altinMaliyet, veri.tasMaliyet, veri.yiyecekMaliyet)) {
            this.arayuz.bildirimEkle('Yetersiz kaynak!', tX, tY, '#F44336');
            return;
        }

        // Hücre uygunluk kontrolü
        const hucre = this.grid.hucreAl(gridPos.sutun, gridPos.satir);
        if (!hucre || !hucre.yerlestirilebilirMi()) {
            this.arayuz.bildirimEkle('Buraya inşa edilemez!', tX, tY, '#F44336');
            return;
        }

        // Binayı oluştur ve yerleştir
        const yeniBina = new Bina(binaTuru);
        if (this.grid.binaYerlestir(gridPos.sutun, gridPos.satir, yeniBina)) {
            this.kaynaklar.kaynakHarca(veri.altinMaliyet, veri.tasMaliyet, veri.yiyecekMaliyet);
            sesYoneticisi.insaSesi();
            this.parcacikYoneticisi.insaEfekti(hucre.x, hucre.y);
            this.arayuz.bildirimEkle(veri.isim + ' inşa edildi', tX, tY - 20, '#4CAF50');
        }
    }

    /** Gece geçişi başlatır */
    _geceyeGec() {
        this.durum = OYUN_DURUMU.GECE_GECIS;
        this.gecisZamani = 0;
        sesYoneticisi.geceBaslangiçSesi();
    }

    /** Gündüz geçişi başlatır */
    _gunduzeGec() {
        this.durum = OYUN_DURUMU.GUNDUZ_GECIS;
        this.gecisZamani = 0;
        sesYoneticisi.gunduzBaslangiçSesi();
    }

    /** Üretim binalarından kaynak toplar */
    _kaynaklariTopla() {
        const binalar = this.grid.tumBinalariAl();
        for (const bina of binalar) {
            if (bina.uretim) {
                this.kaynaklar.kaynakEkle(bina.uretim.tur, bina.uretim.miktar);
                const merkez = hucreMerkezi(bina.sutun, bina.satir);
                const renkMap = { altin: RENKLER.UI_ALTIN, tas: RENKLER.UI_TAS, yiyecek: RENKLER.UI_YIYECEK };
                this.parcacikYoneticisi.kaynakEfekti(merkez.x, merkez.y, renkMap[bina.uretim.tur]);
                this.arayuz.bildirimEkle('+' + bina.uretim.miktar, merkez.x, merkez.y, renkMap[bina.uretim.tur]);
            }
        }
        sesYoneticisi.kaynakSesi();
    }

    // ==================== ANA OYUN DÖNGÜSÜ ====================

    _oyunDongusu(zamanDamgasi) {
        // Delta zaman hesapla (saniye cinsinden)
        const deltaZaman = Math.min((zamanDamgasi - this.sonKare) / 1000, 0.05);
        this.sonKare = zamanDamgasi;
        this.toplamZaman += deltaZaman;

        // Güncelle
        this._guncelle(deltaZaman);

        // Çiz
        this._ciz();

        // Sonraki kare
        requestAnimationFrame((z) => this._oyunDongusu(z));
    }

    /** Oyun mantığını günceller */
    _guncelle(dt) {
        if (this.durum === OYUN_DURUMU.MENU || this.durum === OYUN_DURUMU.OYUN_BITTI) return;

        // Geçiş animasyonları
        if (this.durum === OYUN_DURUMU.GECE_GECIS) {
            this.gecisZamani += dt;
            if (this.gecisZamani >= this.gecisSuresi) {
                this.durum = OYUN_DURUMU.GECE;
                this.dalgaYoneticisi.yeniDalga();
                sesYoneticisi.dalgaBaslangiçSesi();
                sesYoneticisi.geceMuzigi();
            }
            return;
        }

        if (this.durum === OYUN_DURUMU.GUNDUZ_GECIS) {
            this.gecisZamani += dt;
            if (this.gecisZamani >= this.gecisSuresi) {
                this.durum = OYUN_DURUMU.GUNDUZ;
                this.gunSayaci = GUNDUZ_SURESI;
                this._kaynaklariTopla();
                this.kaynaklar.skorEkle(50); // Hayatta kalma bonusu
                sesYoneticisi.gunduzMuzigi();
            }
            return;
        }

        // Parçacıkları güncelle
        this.parcacikYoneticisi.guncelle(dt);

        // GÜNDÜZ güncelleme
        if (this.durum === OYUN_DURUMU.GUNDUZ) {
            this.gunSayaci -= dt;
            if (this.gunSayaci <= 0) {
                this._geceyeGec();
            }
            return;
        }

        // GECE güncelleme
        if (this.durum === OYUN_DURUMU.GECE) {
            // Düşman üretimi
            const yeniDusman = this.dalgaYoneticisi.guncelle(dt);
            if (yeniDusman) {
                this.dusmanlar.push(yeniDusman);
            }

            // Binaları güncelle (kuleler ateş eder)
            const binalar = this.grid.tumBinalariAl();
            for (const bina of binalar) {
                bina.guncelle(dt, this.dusmanlar, this.mermiler);
            }

            // Düşmanları güncelle
            for (let i = this.dusmanlar.length - 1; i >= 0; i--) {
                const dusman = this.dusmanlar[i];
                dusman.guncelle(dt, this.grid, this.kaleCan);

                // Kaleye hasar
                if (dusman.kaleHasar) {
                    this.kaleCan -= dusman.kaleHasar;
                    this.arayuz.bildirimEkle('-' + dusman.kaleHasar + ' Kale!',
                        (KALE_SUTUN + 1) * HUCRE_BOYUTU, (KALE_SATIR + 1) * HUCRE_BOYUTU, '#F44336');
                    sesYoneticisi.binaHasarSesi();
                }

                // Ölen düşmanları temizle
                if (!dusman.pikseldeMi) {
                    if (!dusman.kaleHasar) { // Kale hasarı değilse öldürülmüştür
                        this.kaynaklar.kaynakEkle('altin', dusman.odul);
                        this.kaynaklar.skorEkle(dusman.skorOdul);
                        this.parcacikYoneticisi.olumEfekti(dusman.x, dusman.y, dusman.renk);
                        this.arayuz.bildirimEkle('+' + dusman.odul + ' 💰', dusman.x, dusman.y, RENKLER.UI_ALTIN);
                        sesYoneticisi.dusmanOlumSesi();
                    }
                    this.dusmanlar.splice(i, 1);
                }
            }

            // Yıkılan binaları kontrol et
            for (let s = 0; s < GRID_SATIR; s++) {
                for (let k = 0; k < GRID_SUTUN; k++) {
                    const hucre = this.grid.hucreAl(k, s);
                    if (hucre && hucre.bina && hucre.bina.can <= 0) {
                        this.parcacikYoneticisi.yikimEfekti(hucre.x, hucre.y);
                        sesYoneticisi.binaYikildiSesi();
                        this.arayuz.bildirimEkle(hucre.bina.isim + ' yıkıldı!', hucre.x + 20, hucre.y, '#FF5722');
                        // Saldırı yapan düşmanları serbest bırak
                        for (const d of this.dusmanlar) {
                            if (d.hedefBina === hucre.bina) {
                                d.saldiriyorMu = false;
                                d.hedefBina = null;
                            }
                        }
                        this.grid.binaKaldir(k, s);
                    }
                }
            }

            // Mermileri güncelle
            for (let i = this.mermiler.length - 1; i >= 0; i--) {
                const sonuc = this.mermiler[i].guncelle(dt, this.dusmanlar, this.parcacikYoneticisi.parcaciklar);
                if (!this.mermiler[i].aktifMi) {
                    this.mermiler.splice(i, 1);
                }
            }

            // Parçacıkları güncelle
            this.parcacikYoneticisi.guncelle(dt);

            // Kale yıkıldı mı?
            if (this.kaleCan <= 0) {
                this.kaleCan = 0;
                this.durum = OYUN_DURUMU.OYUN_BITTI;
                sesYoneticisi.oyunBittiSesi();
                sesYoneticisi._muzikDurdur();
                return;
            }

            // Tüm düşmanlar öldü ve dalga bitti mi?
            if (this.dalgaYoneticisi.dalgaBittiMi && this.dusmanlar.length === 0) {
                this._gunduzeGec();
            }
        }
    }

    /** Oyunu çizer */
    _ciz() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, CANVAS_GENISLIK, CANVAS_YUKSEKLIK);

        // Gökyüzü arkaplanı
        this._gokyuzuCiz(ctx);

        // Grid ve zemin
        const seciliBina = (this.durum === OYUN_DURUMU.GUNDUZ) ? this.arayuz.secilenBinaTuru : null;
        this.grid.ciz(ctx, this.fareX, this.fareY, seciliBina, this.kaynaklar);

        // Kale çiz
        this._kaleCiz(ctx);

        // Binaları çiz
        const binalar = this.grid.tumBinalariAl();
        for (const bina of binalar) {
            bina.ciz(ctx);
        }

        // Düşmanları çiz
        for (const dusman of this.dusmanlar) {
            dusman.ciz(ctx);
        }

        // Mermileri çiz
        for (const mermi of this.mermiler) {
            mermi.ciz(ctx);
        }

        // Parçacıkları çiz
        this.parcacikYoneticisi.ciz(ctx);

        // UI paneli
        const geceMi = this.durum === OYUN_DURUMU.GECE || this.durum === OYUN_DURUMU.GECE_GECIS;
        this.arayuz.ustPanelCiz(ctx, this.kaynaklar, geceMi,
            this.dalgaYoneticisi.dalgaNumarasi, this.kaleCan, KALE_MAX_CAN, this.gunSayaci);

        // Bildirimleri çiz
        this.arayuz.bildirimleriGuncelle(ctx, (this.sonKare > 0) ? 0.016 : 0);

        // Tooltip
        if (this.durum === OYUN_DURUMU.GUNDUZ && this.fareX) {
            this.arayuz.tooltipCiz(ctx, this.fareX, this.fareY);
        }

        // Geçiş animasyonları
        if (this.durum === OYUN_DURUMU.GECE_GECIS) {
            this.arayuz.gecisCiz(ctx, this.gecisZamani / this.gecisSuresi, true);
        } else if (this.durum === OYUN_DURUMU.GUNDUZ_GECIS) {
            this.arayuz.gecisCiz(ctx, this.gecisZamani / this.gecisSuresi, false);
        }

        // Menü veya oyun bitti ekranı
        if (this.durum === OYUN_DURUMU.MENU) {
            this.arayuz.menuCiz(ctx, this.toplamZaman);
        } else if (this.durum === OYUN_DURUMU.OYUN_BITTI) {
            this.arayuz.oyunBittiCiz(ctx, this.kaynaklar, this.dalgaYoneticisi.dalgaNumarasi, this.toplamZaman);
        }
    }

    /** Gökyüzü gradyanı çizer */
    _gokyuzuCiz(ctx) {
        const geceMi = this.durum === OYUN_DURUMU.GECE || this.durum === OYUN_DURUMU.GECE_GECIS;
        const ust = geceMi ? RENKLER.GECE_UST : RENKLER.GUNDUZ_UST;
        const alt = geceMi ? RENKLER.GECE_ALT : RENKLER.GUNDUZ_ALT;

        const gradyan = ctx.createLinearGradient(0, 0, 0, GRID_SATIR * HUCRE_BOYUTU);
        gradyan.addColorStop(0, ust);
        gradyan.addColorStop(1, alt);
        ctx.fillStyle = gradyan;
        ctx.fillRect(0, 0, CANVAS_GENISLIK, GRID_SATIR * HUCRE_BOYUTU);

        // Gece yıldızları
        if (geceMi) {
            ctx.fillStyle = '#FFF';
            for (let i = 0; i < 30; i++) {
                const yX = (i * 137 + 50) % CANVAS_GENISLIK;
                const yY = (i * 97 + 20) % (GRID_SATIR * HUCRE_BOYUTU * 0.4);
                const boyut = 1 + (i % 3);
                const parlaklik = 0.3 + Math.sin(this.toplamZaman * 2 + i) * 0.3;
                ctx.globalAlpha = parlaklik;
                ctx.fillRect(yX, yY, boyut, boyut);
            }
            ctx.globalAlpha = 1;
        }
    }

    /** Kaleyi çizer */
    _kaleCiz(ctx) {
        const kaleX = KALE_SUTUN * HUCRE_BOYUTU;
        const kaleY = KALE_SATIR * HUCRE_BOYUTU;
        const kaleG = KALE_GENISLIK * HUCRE_BOYUTU;
        const kaleU = KALE_YUKSEKLIK * HUCRE_BOYUTU;

        // Kale gövdesi
        ctx.fillStyle = RENKLER.KALE;
        ctx.fillRect(kaleX + 4, kaleY + 12, kaleG - 8, kaleU - 12);

        // Üst mazgallar
        ctx.fillStyle = RENKLER.KALE_KOYU;
        ctx.fillRect(kaleX + 2, kaleY + 6, kaleG - 4, 10);
        ctx.fillStyle = RENKLER.KALE;
        for (let i = 0; i < 7; i++) {
            ctx.fillRect(kaleX + 6 + i * 11, kaleY + 1, 7, 8);
        }

        // Kapı
        ctx.fillStyle = '#3E2723';
        ctx.fillRect(kaleX + kaleG / 2 - 8, kaleY + kaleU - 24, 16, 24);
        ctx.fillStyle = RENKLER.KALE_KOYU;
        ctx.fillRect(kaleX + kaleG / 2 - 6, kaleY + kaleU - 22, 12, 2);

        // Bayrak
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(kaleX + kaleG / 2 - 1, kaleY - 16, 2, 22);
        ctx.fillStyle = RENKLER.KALE_BAYRAK;
        const bayrakDalgalanma = Math.sin(this.toplamZaman * 3) * 2;
        ctx.beginPath();
        ctx.moveTo(kaleX + kaleG / 2 + 1, kaleY - 16);
        ctx.lineTo(kaleX + kaleG / 2 + 16 + bayrakDalgalanma, kaleY - 12);
        ctx.lineTo(kaleX + kaleG / 2 + 1, kaleY - 6);
        ctx.closePath();
        ctx.fill();

        // Pencereler
        ctx.fillStyle = '#FFF9C4';
        ctx.fillRect(kaleX + 14, kaleY + 22, 6, 6);
        ctx.fillRect(kaleX + kaleG - 20, kaleY + 22, 6, 6);
        ctx.fillRect(kaleX + 14, kaleY + 38, 6, 6);
        ctx.fillRect(kaleX + kaleG - 20, kaleY + 38, 6, 6);
    }
}

// Sayfa yüklendiğinde oyunu başlat
window.addEventListener('load', () => {
    new Oyun();
});
