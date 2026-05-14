// buildings.js - Bina sistemi

// Bina türleri
const BINA_TURU = {
    DUVAR: 'duvar',
    OKCU_KULESI: 'okcu_kulesi',
    TOP_KULESI: 'top_kulesi',
    EV: 'ev',
    CIFTLIK: 'ciftlik',
    MADEN: 'maden'
};

// Bina verileri - maliyet, can, üretim bilgileri
const BINA_VERILERI = {
    [BINA_TURU.DUVAR]: {
        isim: 'Taş Duvar',
        aciklama: 'Düşmanları engeller',
        altinMaliyet: 5,
        tasMaliyet: 15,
        yiyecekMaliyet: 0,
        maxCan: 150,
        savunmaMi: true,
        kisayol: '1'
    },
    [BINA_TURU.OKCU_KULESI]: {
        isim: 'Okçu Kulesi',
        aciklama: 'Yakın düşmanlara ok atar',
        altinMaliyet: 30,
        tasMaliyet: 10,
        yiyecekMaliyet: 0,
        maxCan: 80,
        menzil: 150,          // Piksel cinsinden menzil
        hasar: 15,
        atesHizi: 1.0,        // Saniyede atış
        savunmaMi: true,
        kisayol: '2'
    },
    [BINA_TURU.TOP_KULESI]: {
        isim: 'Top Kulesi',
        aciklama: 'Geniş alanda hasar verir',
        altinMaliyet: 60,
        tasMaliyet: 25,
        yiyecekMaliyet: 0,
        maxCan: 100,
        menzil: 180,
        hasar: 35,
        patlamaYaricapi: 50,
        atesHizi: 0.5,
        savunmaMi: true,
        kisayol: '3'
    },
    [BINA_TURU.EV]: {
        isim: 'Ev',
        aciklama: 'Her gece +15 altın üretir',
        altinMaliyet: 25,
        tasMaliyet: 10,
        yiyecekMaliyet: 5,
        maxCan: 60,
        uretim: { tur: 'altin', miktar: 15 },
        savunmaMi: false,
        kisayol: '4'
    },
    [BINA_TURU.CIFTLIK]: {
        isim: 'Çiftlik',
        aciklama: 'Her gece +10 yiyecek üretir',
        altinMaliyet: 20,
        tasMaliyet: 5,
        yiyecekMaliyet: 0,
        maxCan: 40,
        uretim: { tur: 'yiyecek', miktar: 10 },
        savunmaMi: false,
        kisayol: '5'
    },
    [BINA_TURU.MADEN]: {
        isim: 'Maden',
        aciklama: 'Her gece +12 taş üretir',
        altinMaliyet: 20,
        tasMaliyet: 0,
        yiyecekMaliyet: 5,
        maxCan: 50,
        uretim: { tur: 'tas', miktar: 12 },
        savunmaMi: false,
        kisayol: '6'
    }
};

// Bina sınıfı
class Bina {
    constructor(tur) {
        this.tur = tur;
        const veri = BINA_VERILERI[tur];
        
        this.isim = veri.isim;
        this.maxCan = veri.maxCan;
        this.can = veri.maxCan;
        this.savunmaMi = veri.savunmaMi;
        
        // Konum (grid.binaYerlestir tarafından set edilir)
        this.sutun = 0;
        this.satir = 0;
        this.x = 0;
        this.y = 0;

        // Kule özellikleri
        if (veri.menzil) {
            this.menzil = veri.menzil;
            this.hasar = veri.hasar;
            this.atesHizi = veri.atesHizi;
            this.sonAtesZamani = 0;
            this.hedef = null;
            this.donus = 0; // Kule dönüş açısı (radyan)
        }

        // Patlama yarıçapı (top kulesi)
        if (veri.patlamaYaricapi) {
            this.patlamaYaricapi = veri.patlamaYaricapi;
        }

        // Üretim özellikleri
        if (veri.uretim) {
            this.uretim = veri.uretim;
        }

        // Animasyon değişkenleri
        this.hasarAnimasyon = 0;
        this.yerlesimAnimasyon = 1.0; // Yerleşim animasyonu (1'den 0'a)
    }

    /**
     * Binaya hasar ver
     */
    hasarAl(miktar) {
        this.can -= miktar;
        this.hasarAnimasyon = 1.0; // Hasar animasyonunu başlat
        
        if (this.can <= 0) {
            this.can = 0;
            return true; // Bina yıkıldı
        }
        return false;
    }

    // her karede guncellenir
    guncelle(deltaZaman, dusmanlar, mermiler) {
        // Animasyonları güncelle
        if (this.hasarAnimasyon > 0) {
            this.hasarAnimasyon -= deltaZaman * 3;
        }
        if (this.yerlesimAnimasyon > 0) {
            this.yerlesimAnimasyon -= deltaZaman * 2;
        }

        // Kule ise hedef ara ve ateş et
        if (this.menzil && dusmanlar && dusmanlar.length > 0) {
            this._hedefAraVeAtes(deltaZaman, dusmanlar, mermiler);
        }
    }

    // en yakin dusmani bul, ates et
    _hedefAraVeAtes(deltaZaman, dusmanlar, mermiler) {
        const merkezX = this.x + HUCRE_BOYUTU / 2;
        const merkezY = this.y + HUCRE_BOYUTU / 2;

        // En yakın düşmanı bul
        let enYakinDusman = null;
        let enYakinMesafe = this.menzil;

        for (const dusman of dusmanlar) {
            if (!dusman.pikseldeMi) continue;
            const mesafe = mesafeHesapla(merkezX, merkezY, dusman.x, dusman.y);
            if (mesafe <= this.menzil && mesafe < enYakinMesafe) {
                enYakinMesafe = mesafe;
                enYakinDusman = dusman;
            }
        }

        this.hedef = enYakinDusman;

        // Hedef varsa kuleyi hedefe döndür
        if (this.hedef) {
            this.donus = aciHesapla(merkezX, merkezY, this.hedef.x, this.hedef.y);
        }

        // Ateş zamanı geldiyse ve hedef varsa ateş et
        this.sonAtesZamani += deltaZaman;
        if (this.hedef && this.sonAtesZamani >= 1 / this.atesHizi) {
            this.sonAtesZamani = 0;
            
            // Mermi oluştur
            const mermi = new Mermi(
                merkezX, merkezY,
                this.hedef,
                this.hasar,
                this.tur === BINA_TURU.TOP_KULESI ? 'top' : 'ok',
                this.patlamaYaricapi || 0
            );
            mermiler.push(mermi);

            // Ses efekti
            if (this.tur === BINA_TURU.TOP_KULESI) {
                sesYoneticisi.topSesi();
            } else {
                sesYoneticisi.okSesi();
            }
        }
    }

    // canvas uzerine ciz
    ciz(ctx) {
        // Yerleşim animasyonu - hafif bounce efekti
        let olcek = 1;
        if (this.yerlesimAnimasyon > 0) {
            olcek = 1 + Math.sin(this.yerlesimAnimasyon * Math.PI) * 0.15;
        }

        ctx.save();
        
        // Hasar animasyonu - kırmızı yanıp sönme
        if (this.hasarAnimasyon > 0) {
            ctx.globalAlpha = 0.7 + Math.sin(this.hasarAnimasyon * 10) * 0.3;
        }

        // Ölçekleme için dönüşüm
        if (olcek !== 1) {
            const merkezX = this.x + HUCRE_BOYUTU / 2;
            const merkezY = this.y + HUCRE_BOYUTU / 2;
            ctx.translate(merkezX, merkezY);
            ctx.scale(olcek, olcek);
            ctx.translate(-merkezX, -merkezY);
        }

        // Bina türüne göre çiz
        BINA_CIZIMLERI[this.tur](ctx, this.x, this.y);

        // Kule menzil göstergesi (hedef varsa)
        if (this.hedef && this.menzil) {
            ctx.strokeStyle = 'rgba(255, 100, 100, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x + HUCRE_BOYUTU / 2, this.y + HUCRE_BOYUTU / 2, this.menzil, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();

        // Can çubuğu (hasar almışsa göster)
        if (this.can < this.maxCan) {
            this._canCubugu(ctx);
        }
    }

    // can cubugu goster
    _canCubugu(ctx) {
        const cubukGenislik = HUCRE_BOYUTU - 8;
        const cubukYukseklik = 4;
        const cubukX = this.x + 4;
        const cubukY = this.y - 6;
        const canOrani = this.can / this.maxCan;

        // Arkaplan
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(cubukX, cubukY, cubukGenislik, cubukYukseklik);

        // Can miktarı - yeşilden kırmızıya renk geçişi
        const renk = canOrani > 0.6 ? '#4CAF50' : canOrani > 0.3 ? '#FF9800' : '#F44336';
        ctx.fillStyle = renk;
        ctx.fillRect(cubukX, cubukY, cubukGenislik * canOrani, cubukYukseklik);
    }
}

// ==================== BİNA ÇİZİMLERİ ====================


const BINA_CIZIMLERI = {
    // TAS DUVAR
    [BINA_TURU.DUVAR]: function(ctx, x, y) {
        // Ana duvar gövdesi
        ctx.fillStyle = RENKLER.DUVAR;
        ctx.fillRect(x + 2, y + 6, 36, 28);
        
        // Taş dokusu - yatay çizgiler
        ctx.fillStyle = RENKLER.DUVAR_KOYU;
        ctx.fillRect(x + 2, y + 14, 36, 2);
        ctx.fillRect(x + 2, y + 24, 36, 2);
        
        // Dikey derzler
        ctx.fillRect(x + 12, y + 6, 2, 8);
        ctx.fillRect(x + 26, y + 6, 2, 8);
        ctx.fillRect(x + 19, y + 16, 2, 8);
        ctx.fillRect(x + 10, y + 26, 2, 8);
        ctx.fillRect(x + 28, y + 26, 2, 8);
        
        // Üst mazgallar
        ctx.fillStyle = RENKLER.DUVAR;
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(x + 4 + i * 9, y + 2, 6, 6);
        }
    },

    // OKCU KULESI
    [BINA_TURU.OKCU_KULESI]: function(ctx, x, y) {
        // Kule tabanı
        ctx.fillStyle = RENKLER.KULE_AHSAP_KOYU;
        ctx.fillRect(x + 6, y + 16, 28, 20);
        
        // Kule gövdesi
        ctx.fillStyle = RENKLER.KULE_AHSAP;
        ctx.fillRect(x + 8, y + 10, 24, 22);
        
        // Sivri çatı
        ctx.fillStyle = '#C62828';
        ctx.beginPath();
        ctx.moveTo(x + 5, y + 12);
        ctx.lineTo(x + 20, y + 0);
        ctx.lineTo(x + 35, y + 12);
        ctx.closePath();
        ctx.fill();
        
        // Pencere (ok deliği)
        ctx.fillStyle = '#263238';
        ctx.fillRect(x + 17, y + 18, 6, 10);
        ctx.fillRect(x + 15, y + 22, 10, 3);
    },

    // TOP KULESI
    [BINA_TURU.TOP_KULESI]: function(ctx, x, y) {
        // Geniş kule tabanı
        ctx.fillStyle = RENKLER.KULE_TOP_KOYU;
        ctx.fillRect(x + 4, y + 14, 32, 22);
        
        // Kule gövdesi
        ctx.fillStyle = RENKLER.KULE_TOP;
        ctx.fillRect(x + 6, y + 8, 28, 24);
        
        // Üst platform
        ctx.fillStyle = RENKLER.KULE_TOP_KOYU;
        ctx.fillRect(x + 2, y + 6, 36, 6);
        
        // Mazgallar
        ctx.fillStyle = RENKLER.KULE_TOP;
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(x + 5 + i * 12, y + 2, 7, 6);
        }
        
        // Top namlusu
        ctx.fillStyle = '#263238';
        ctx.fillRect(x + 17, y + 16, 6, 12);
        ctx.fillRect(x + 15, y + 26, 10, 4);
    },

    // EV
    [BINA_TURU.EV]: function(ctx, x, y) {
        // Ev gövdesi
        ctx.fillStyle = RENKLER.EV;
        ctx.fillRect(x + 6, y + 16, 28, 20);
        
        // Çatı
        ctx.fillStyle = RENKLER.EV_CATI;
        ctx.beginPath();
        ctx.moveTo(x + 3, y + 18);
        ctx.lineTo(x + 20, y + 4);
        ctx.lineTo(x + 37, y + 18);
        ctx.closePath();
        ctx.fill();
        
        // Kapı
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(x + 16, y + 26, 8, 10);
        
        // Pencere
        ctx.fillStyle = '#FFF9C4';
        ctx.fillRect(x + 10, y + 20, 5, 5);
        ctx.fillRect(x + 26, y + 20, 5, 5);
    },

    // CIFTLIK
    [BINA_TURU.CIFTLIK]: function(ctx, x, y) {
        // Toprak
        ctx.fillStyle = '#795548';
        ctx.fillRect(x + 2, y + 20, 36, 16);
        
        // Ekin sıraları
        ctx.fillStyle = RENKLER.CIFTLIK_YESIL;
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(x + 5 + i * 9, y + 12, 4, 22);
        }
        
        // Ekin tepeleri
        ctx.fillStyle = RENKLER.CIFTLIK_KOYU;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(x + 7 + i * 9, y + 12, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Çit
        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 2, y + 8, 36, 28);
    },

    // MADEN
    [BINA_TURU.MADEN]: function(ctx, x, y) {
        // Maden girişi (karanlık alan)
        ctx.fillStyle = '#37474F';
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 34);
        ctx.lineTo(x + 14, y + 16);
        ctx.lineTo(x + 26, y + 16);
        ctx.lineTo(x + 32, y + 34);
        ctx.closePath();
        ctx.fill();
        
        // Maden çerçevesi
        ctx.fillStyle = RENKLER.MADEN;
        ctx.fillRect(x + 10, y + 14, 20, 4);
        ctx.fillRect(x + 8, y + 14, 4, 22);
        ctx.fillRect(x + 28, y + 14, 4, 22);
        
        // Kazma ikonu
        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 8);
        ctx.lineTo(x + 24, y + 14);
        ctx.stroke();
        
        // Kazma başı
        ctx.fillStyle = RENKLER.MADEN_KOYU;
        ctx.beginPath();
        ctx.moveTo(x + 14, y + 6);
        ctx.lineTo(x + 18, y + 10);
        ctx.lineTo(x + 14, y + 12);
        ctx.closePath();
        ctx.fill();
        
        // Taş parçaları
        ctx.fillStyle = '#90A4AE';
        ctx.fillRect(x + 14, y + 28, 5, 4);
        ctx.fillRect(x + 22, y + 30, 4, 3);
    }
};
