/**
 * particles.js - Parçacık Efekt Sistemi
 * Patlama, hasar, inşa gibi olaylar için görsel parçacık efektleri üretir.
 * Oyun sahnesinin görsel zenginliğini artırır.
 */

class Parcacik {
    /**
     * Tek bir parçacık oluşturur
     * @param {number} x - Başlangıç x konumu
     * @param {number} y - Başlangıç y konumu
     * @param {number} hizX - Yatay hız (piksel/saniye)
     * @param {number} hizY - Dikey hız (piksel/saniye)
     * @param {number} omur - Yaşam süresi (saniye)
     * @param {number} boyut - Parçacık boyutu (piksel)
     * @param {string} renk - Parçacık rengi
     */
    constructor(x, y, hizX, hizY, omur, boyut, renk) {
        this.x = x;
        this.y = y;
        this.hizX = hizX;
        this.hizY = hizY;
        this.omur = omur;
        this.maxOmur = omur;
        this.boyut = boyut;
        this.renk = renk;
        this.aktifMi = true;
        this.yerCekimi = 60; // Piksel/saniye^2 aşağı ivme
    }

    /**
     * Parçacığı günceller
     */
    guncelle(deltaZaman) {
        if (!this.aktifMi) return;

        // Konum güncelle
        this.x += this.hizX * deltaZaman;
        this.y += this.hizY * deltaZaman;

        // Yerçekimi uygula
        this.hizY += this.yerCekimi * deltaZaman;

        // Ömür azalt
        this.omur -= deltaZaman;
        if (this.omur <= 0) {
            this.aktifMi = false;
        }
    }

    /**
     * Parçacığı çizer
     */
    ciz(ctx) {
        if (!this.aktifMi) return;

        const opaklık = this.omur / this.maxOmur;
        ctx.globalAlpha = opaklık;
        ctx.fillStyle = this.renk;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.boyut * opaklık, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

/**
 * Parçacık yöneticisi - toplu işlemler için yardımcı sınıf
 */
class ParcacikYoneticisi {
    constructor() {
        this.parcaciklar = [];
    }

    /**
     * Yeni parçacık ekler
     */
    ekle(parcacik) {
        this.parcaciklar.push(parcacik);
    }

    /**
     * İnşa efekti - bina yerleştirildiğinde toz parçacıkları
     */
    insaEfekti(x, y) {
        for (let i = 0; i < 10; i++) {
            this.parcaciklar.push(new Parcacik(
                x + HUCRE_BOYUTU / 2 + rastgeleOndalik(-15, 15),
                y + HUCRE_BOYUTU + rastgeleOndalik(-5, 0),
                rastgeleOndalik(-30, 30),
                rastgeleOndalik(-50, -20),
                rastgeleOndalik(0.3, 0.6),
                rastgeleTamSayi(2, 5),
                RENKLER.KUM_COK_KOYU
            ));
        }
    }

    /**
     * Bina yıkım efekti
     */
    yikimEfekti(x, y) {
        for (let i = 0; i < 20; i++) {
            this.parcaciklar.push(new Parcacik(
                x + HUCRE_BOYUTU / 2 + rastgeleOndalik(-15, 15),
                y + HUCRE_BOYUTU / 2 + rastgeleOndalik(-15, 15),
                rastgeleOndalik(-60, 60),
                rastgeleOndalik(-80, -20),
                rastgeleOndalik(0.4, 0.8),
                rastgeleTamSayi(3, 7),
                RENKLER.DUVAR_KOYU
            ));
        }
        // Duman
        for (let i = 0; i < 8; i++) {
            this.parcaciklar.push(new Parcacik(
                x + HUCRE_BOYUTU / 2 + rastgeleOndalik(-10, 10),
                y + HUCRE_BOYUTU / 2,
                rastgeleOndalik(-20, 20),
                rastgeleOndalik(-40, -10),
                rastgeleOndalik(0.6, 1.2),
                rastgeleTamSayi(6, 12),
                'rgba(80,80,80,0.5)'
            ));
        }
    }

    /**
     * Düşman ölüm efekti
     */
    olumEfekti(x, y, renk) {
        for (let i = 0; i < 12; i++) {
            this.parcaciklar.push(new Parcacik(
                x, y,
                rastgeleOndalik(-60, 60),
                rastgeleOndalik(-70, -10),
                rastgeleOndalik(0.3, 0.7),
                rastgeleTamSayi(2, 6),
                renk
            ));
        }
    }

    /**
     * Kaynak toplama efekti (yıldız parıltısı)
     */
    kaynakEfekti(x, y, renk) {
        for (let i = 0; i < 6; i++) {
            const aci = (Math.PI * 2 / 6) * i;
            this.parcaciklar.push(new Parcacik(
                x, y,
                Math.cos(aci) * 30,
                Math.sin(aci) * 30,
                rastgeleOndalik(0.3, 0.5),
                rastgeleTamSayi(2, 4),
                renk
            ));
        }
    }

    /**
     * Tüm parçacıkları günceller ve ölü parçacıkları temizler
     */
    guncelle(deltaZaman) {
        for (let i = this.parcaciklar.length - 1; i >= 0; i--) {
            this.parcaciklar[i].guncelle(deltaZaman);
            if (!this.parcaciklar[i].aktifMi) {
                this.parcaciklar.splice(i, 1);
            }
        }
    }

    /**
     * Tüm parçacıkları çizer
     */
    ciz(ctx) {
        for (const parcacik of this.parcaciklar) {
            parcacik.ciz(ctx);
        }
    }

    /**
     * Tüm parçacıkları temizler
     */
    temizle() {
        this.parcaciklar = [];
    }
}
