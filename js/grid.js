/**
 * grid.js - Grid (Izgara) Sistemi
 * Oyun haritasını grid tabanlı olarak yönetir.
 * Her hücre bir bina veya engel içerebilir.
 */

// Hücre türleri
const HUCRE_TURU = {
    BOS: 'bos',
    BINA: 'bina',
    KALE: 'kale',
    ENGEL: 'engel' // Doğal engeller (kayalar vb.)
};

class Hucre {
    /**
     * Tek bir grid hücresini temsil eder
     * @param {number} sutun - Sütun numarası
     * @param {number} satir - Satır numarası
     */
    constructor(sutun, satir) {
        this.sutun = sutun;
        this.satir = satir;
        this.tur = HUCRE_TURU.BOS;
        this.bina = null; // Bina nesnesi referansı

        // Piksel koordinatları
        this.x = sutun * HUCRE_BOYUTU;
        this.y = satir * HUCRE_BOYUTU;
    }

    /**
     * Hücrenin merkez koordinatlarını döndürür
     */
    merkez() {
        return {
            x: this.x + HUCRE_BOYUTU / 2,
            y: this.y + HUCRE_BOYUTU / 2
        };
    }

    /**
     * Hücreye bina yerleştirilebilir mi kontrol eder
     */
    yerlestirilebilirMi() {
        return this.tur === HUCRE_TURU.BOS;
    }

    /**
     * Hücreyi temizler (bina kaldırma)
     */
    temizle() {
        this.tur = HUCRE_TURU.BOS;
        this.bina = null;
    }
}

class Grid {
    constructor() {
        // 2D hücre dizisi oluştur
        this.hucreler = [];
        for (let satir = 0; satir < GRID_SATIR; satir++) {
            this.hucreler[satir] = [];
            for (let sutun = 0; sutun < GRID_SUTUN; sutun++) {
                this.hucreler[satir][sutun] = new Hucre(sutun, satir);
            }
        }

        // Kale hücrelerini işaretle
        this._kaleYerlestir();
        
        // Doğal engeller ekle (dekoratif kayalar)
        this._engellerOlustur();
    }

    /**
     * Kaleyi grid merkezine yerleştirir
     */
    _kaleYerlestir() {
        for (let s = 0; s < KALE_YUKSEKLIK; s++) {
            for (let k = 0; k < KALE_GENISLIK; k++) {
                const hucre = this.hucreler[KALE_SATIR + s][KALE_SUTUN + k];
                hucre.tur = HUCRE_TURU.KALE;
            }
        }
    }

    /**
     * Haritaya rastgele engeller (kayalar) ekler
     */
    _engellerOlustur() {
        const engelSayisi = rastgeleTamSayi(6, 10);
        let eklenen = 0;

        while (eklenen < engelSayisi) {
            const sutun = rastgeleTamSayi(0, GRID_SUTUN - 1);
            const satir = rastgeleTamSayi(0, GRID_SATIR - 1);
            const hucre = this.hucreler[satir][sutun];

            // Kale veya zaten dolu hücrelere engel koymayalım
            // Ayrıca kalenin hemen çevresine de engel koymayalım
            if (hucre.tur === HUCRE_TURU.BOS && !this._kaleYakinindaMi(sutun, satir)) {
                hucre.tur = HUCRE_TURU.ENGEL;
                eklenen++;
            }
        }
    }

    /**
     * Bir hücrenin kaleye yakın olup olmadığını kontrol eder
     */
    _kaleYakinindaMi(sutun, satir) {
        return sutun >= KALE_SUTUN - 2 && sutun <= KALE_SUTUN + KALE_GENISLIK + 1 &&
               satir >= KALE_SATIR - 2 && satir <= KALE_SATIR + KALE_YUKSEKLIK + 1;
    }

    /**
     * Belirtilen konumdaki hücreyi döndürür
     */
    hucreAl(sutun, satir) {
        if (gridIcindeMi(sutun, satir)) {
            return this.hucreler[satir][sutun];
        }
        return null;
    }

    /**
     * Belirtilen konuma bina yerleştirir
     * @returns {boolean} Başarılı ise true
     */
    binaYerlestir(sutun, satir, bina) {
        const hucre = this.hucreAl(sutun, satir);
        if (hucre && hucre.yerlestirilebilirMi()) {
            hucre.tur = HUCRE_TURU.BINA;
            hucre.bina = bina;
            bina.sutun = sutun;
            bina.satir = satir;
            bina.x = hucre.x;
            bina.y = hucre.y;
            return true;
        }
        return false;
    }

    /**
     * Belirtilen konumdaki binayı kaldırır
     * @returns {object|null} Kaldırılan bina
     */
    binaKaldir(sutun, satir) {
        const hucre = this.hucreAl(sutun, satir);
        if (hucre && hucre.tur === HUCRE_TURU.BINA) {
            const bina = hucre.bina;
            hucre.temizle();
            return bina;
        }
        return null;
    }

    /**
     * Tüm binaları içeren diziyi döndürür
     */
    tumBinalariAl() {
        const binalar = [];
        for (let satir = 0; satir < GRID_SATIR; satir++) {
            for (let sutun = 0; sutun < GRID_SUTUN; sutun++) {
                if (this.hucreler[satir][sutun].bina) {
                    binalar.push(this.hucreler[satir][sutun].bina);
                }
            }
        }
        return binalar;
    }

    /**
     * Grid'i sıfırlar (yeni oyun için)
     */
    sifirla() {
        for (let satir = 0; satir < GRID_SATIR; satir++) {
            for (let sutun = 0; sutun < GRID_SUTUN; sutun++) {
                this.hucreler[satir][sutun].temizle();
            }
        }
        this._kaleYerlestir();
        this._engellerOlustur();
    }

    /**
     * Grid çizgilerini ve hücreleri canvas üzerine çizer
     */
    ciz(ctx, fareX, fareY, seciliBinaTuru, kaynaklar) {
        // Zemin çiz - çöl kum dokusu
        for (let satir = 0; satir < GRID_SATIR; satir++) {
            for (let sutun = 0; sutun < GRID_SUTUN; sutun++) {
                const hucre = this.hucreler[satir][sutun];
                
                // Hücre arkaplan rengi - hafif varyasyon ile doğal görünüm
                const parlaklik = ((sutun + satir) % 2 === 0) ? 0 : 1;
                ctx.fillStyle = parlaklik ? RENKLER.KUM_ACIK : RENKLER.KUM_KOYU;
                ctx.fillRect(hucre.x, hucre.y, HUCRE_BOYUTU, HUCRE_BOYUTU);
                
                // Engelleri çiz (kayalar)
                if (hucre.tur === HUCRE_TURU.ENGEL) {
                    this._engelCiz(ctx, hucre.x, hucre.y);
                }
            }
        }

        // Grid çizgileri
        ctx.strokeStyle = RENKLER.GRID_CIZGI;
        ctx.lineWidth = 0.5;
        for (let satir = 0; satir <= GRID_SATIR; satir++) {
            ctx.beginPath();
            ctx.moveTo(0, satir * HUCRE_BOYUTU);
            ctx.lineTo(GRID_SUTUN * HUCRE_BOYUTU, satir * HUCRE_BOYUTU);
            ctx.stroke();
        }
        for (let sutun = 0; sutun <= GRID_SUTUN; sutun++) {
            ctx.beginPath();
            ctx.moveTo(sutun * HUCRE_BOYUTU, 0);
            ctx.lineTo(sutun * HUCRE_BOYUTU, GRID_SATIR * HUCRE_BOYUTU);
            ctx.stroke();
        }

        // Fare altındaki hücreyi vurgula (bina yerleştirme modu)
        if (seciliBinaTuru && fareX !== null && fareY !== null) {
            const gridPos = pikseledenGride(fareX, fareY);
            if (gridIcindeMi(gridPos.sutun, gridPos.satir)) {
                const hucre = this.hucreAl(gridPos.sutun, gridPos.satir);
                const binaVerisi = BINA_VERILERI[seciliBinaTuru];
                
                // Yeterli kaynak ve boş hücre varsa yeşil, yoksa kırmızı vurgula
                const yerlestirilebilir = hucre.yerlestirilebilirMi() && 
                    kaynaklar.yeterliMi(binaVerisi.altinMaliyet, binaVerisi.tasMaliyet, binaVerisi.yiyecekMaliyet);
                
                ctx.fillStyle = yerlestirilebilir ? RENKLER.GRID_VURGU : RENKLER.GRID_GECERSIZ;
                ctx.fillRect(gridPos.sutun * HUCRE_BOYUTU, gridPos.satir * HUCRE_BOYUTU, 
                           HUCRE_BOYUTU, HUCRE_BOYUTU);

                // Bina önizleme gölgesi
                if (yerlestirilebilir) {
                    ctx.globalAlpha = 0.5;
                    BINA_CIZIMLERI[seciliBinaTuru](ctx, gridPos.sutun * HUCRE_BOYUTU, gridPos.satir * HUCRE_BOYUTU);
                    ctx.globalAlpha = 1.0;
                }
            }
        }
    }

    /**
     * Engel (kaya) çizer
     */
    _engelCiz(ctx, x, y) {
        ctx.fillStyle = '#8D7B68';
        // Ana kaya şekli
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 32);
        ctx.lineTo(x + 5, y + 20);
        ctx.lineTo(x + 12, y + 10);
        ctx.lineTo(x + 25, y + 8);
        ctx.lineTo(x + 34, y + 15);
        ctx.lineTo(x + 35, y + 28);
        ctx.lineTo(x + 28, y + 34);
        ctx.closePath();
        ctx.fill();
        
        // Kaya gölgesi
        ctx.fillStyle = '#6D5D4E';
        ctx.beginPath();
        ctx.moveTo(x + 12, y + 10);
        ctx.lineTo(x + 20, y + 18);
        ctx.lineTo(x + 28, y + 34);
        ctx.lineTo(x + 8, y + 32);
        ctx.lineTo(x + 5, y + 20);
        ctx.closePath();
        ctx.fill();
    }
}
