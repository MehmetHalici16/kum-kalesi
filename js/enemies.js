// enemies.js - Düşman ve dalga sistemi
// Düşman türleri ve özellikleri
const DUSMAN_TURU = {
    NORMAL: 'normal',
    HIZLI: 'hizli',
    TANK: 'tank',
    UCAK: 'ucak'  // Duvarları atlayabilir
};
const DUSMAN_VERILERI = {
    [DUSMAN_TURU.NORMAL]: {
        isim: 'İstilacı',
        maxCan: 50,
        hiz: 40,            // Piksel/saniye
        hasar: 10,           // Binaya verdiği hasar
        saldiriHizi: 1.0,    // Saniyede saldırı
        boyut: 14,           // Yarıçap
        odul: 5,             // Öldürme ödülü (altın)
        skorOdul: 10,
        renk: RENKLER.DUSMAN_NORMAL
    },
    [DUSMAN_TURU.HIZLI]: {
        isim: 'Koşucu',
        maxCan: 30,
        hiz: 75,
        hasar: 8,
        saldiriHizi: 1.5,
        boyut: 10,
        odul: 8,
        skorOdul: 15,
        renk: RENKLER.DUSMAN_HIZLI
    },
    [DUSMAN_TURU.TANK]: {
        isim: 'Yıkıcı',
        maxCan: 150,
        hiz: 25,
        hasar: 25,
        saldiriHizi: 0.6,
        boyut: 18,
        odul: 15,
        skorOdul: 25,
        renk: RENKLER.DUSMAN_TANK
    },
    [DUSMAN_TURU.UCAK]: {
        isim: 'Uçan',
        maxCan: 35,
        hiz: 55,
        hasar: 12,
        saldiriHizi: 0.8,
        boyut: 12,
        odul: 12,
        skorOdul: 20,
        renk: RENKLER.DUSMAN_UCAK,
        ucanMi: true
    }
};
// Dusman sinifi
class Dusman {
    constructor(tur, x, y) {
        const veri = DUSMAN_VERILERI[tur];
        this.tur = tur;
        this.x = x;
        this.y = y;
        this.maxCan = veri.maxCan;
        this.can = veri.maxCan;
        this.hiz = veri.hiz;
        this.hasar = veri.hasar;
        this.saldiriHizi = veri.saldiriHizi;
        this.boyut = veri.boyut;
        this.odul = veri.odul;
        this.skorOdul = veri.skorOdul;
        this.renk = veri.renk;
        this.ucanMi = veri.ucanMi || false;
        this.pikseldeMi = true;  // Yaşıyor mu
        this.sonSaldiriZamani = 0;
        this.hedefBina = null;
        this.saldiriyorMu = false;
        // Hedef konum (kale merkezi)
        this.hedefX = (KALE_SUTUN + KALE_GENISLIK / 2) * HUCRE_BOYUTU;
        this.hedefY = (KALE_SATIR + KALE_YUKSEKLIK / 2) * HUCRE_BOYUTU;
        // Animasyon değişkenleri
        this.animasyonZamani = Math.random() * Math.PI * 2;
        this.hasarAnimasyon = 0;
    }
    // hasar al, olduyse true don
    hasarAl(miktar) {
        this.can -= miktar;
        this.hasarAnimasyon = 0.3;
        if (this.can <= 0) {
            this.can = 0;
            this.pikseldeMi = false;
            return true;
        }
        return false;
    }
    // hareket ve saldiri
    guncelle(deltaZaman, grid, kaleCan) {
        if (!this.pikseldeMi) return;
        // Animasyon zamanlayıcısı
        this.animasyonZamani += deltaZaman * 5;
        // Hasar animasyonu
        if (this.hasarAnimasyon > 0) {
            this.hasarAnimasyon -= deltaZaman;
        }
        // Saldırı zamanlayıcısı
        this.sonSaldiriZamani += deltaZaman;
        // Eğer saldırıyorsa, binaya hasar ver
        if (this.saldiriyorMu && this.hedefBina) {
            if (this.sonSaldiriZamani >= 1 / this.saldiriHizi) {
                this.sonSaldiriZamani = 0;
                const yikildi = this.hedefBina.hasarAl(this.hasar);
                sesYoneticisi.binaHasarSesi();
                if (yikildi) {
                    this.saldiriyorMu = false;
                    this.hedefBina = null;
                }
            }
            return; // Saldırırken hareket etme
        }
        // Hedefe doğru hareket et
        const aci = aciHesapla(this.x, this.y, this.hedefX, this.hedefY);
        const hareketX = Math.cos(aci) * this.hiz * deltaZaman;
        const hareketY = Math.sin(aci) * this.hiz * deltaZaman;
        const yeniX = this.x + hareketX;
        const yeniY = this.y + hareketY;
        // Sonraki konumdaki grid hücresini kontrol et
        const gridPos = pikseledenGride(yeniX, yeniY);
        if (gridIcindeMi(gridPos.sutun, gridPos.satir)) {
            const hucre = grid.hucreAl(gridPos.sutun, gridPos.satir);
            // Kaleye ulaştı mı?
            if (hucre && hucre.tur === HUCRE_TURU.KALE) {
                // Kaleye saldır (true döndürerek game.js'ye bildir)
                this.kaleHasar = this.hasar;
                this.pikseldeMi = false;
                return;
            }
            // Bina engeli var mı? (uçanlar duvarları atlar)
            if (hucre && hucre.tur === HUCRE_TURU.BINA && !this.ucanMi) {
                // Binaya saldır
                this.saldiriyorMu = true;
                this.hedefBina = hucre.bina;
                this.sonSaldiriZamani = 0;
                return;
            }
        }
        // Hareket ettir
        this.x = yeniX;
        this.y = yeniY;
        // Hedefe çok yakınsa kaleye hasar ver
        if (mesafeHesapla(this.x, this.y, this.hedefX, this.hedefY) < 20) {
            this.kaleHasar = this.hasar;
            this.pikseldeMi = false;
        }
    }
    // ciz
    ciz(ctx) {
        if (!this.pikseldeMi) return;
        ctx.save();
        // Hasar animasyonu
        if (this.hasarAnimasyon > 0) {
            ctx.globalAlpha = 0.6 + Math.random() * 0.3;
        }
        // Gölge
        ctx.fillStyle = RENKLER.GOLGE;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + this.boyut * 0.8, this.boyut * 0.7, this.boyut * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Uçan düşman yukarıda çizilir
        const yOffset = this.ucanMi ? -10 + Math.sin(this.animasyonZamani) * 3 : 0;
        // Ana gövde
        ctx.fillStyle = this.renk;
        ctx.beginPath();
        ctx.arc(this.x, this.y + yOffset, this.boyut, 0, Math.PI * 2);
        ctx.fill();
        // Dış çerçeve
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Gözler
        const gozOffset = this.boyut * 0.3;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x - gozOffset, this.y + yOffset - 2, 3, 0, Math.PI * 2);
        ctx.arc(this.x + gozOffset, this.y + yOffset - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        // Gözbebekleri - hedefe bak
        const bakisAci = aciHesapla(this.x, this.y, this.hedefX, this.hedefY);
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.x - gozOffset + Math.cos(bakisAci) * 1.5, 
                this.y + yOffset - 2 + Math.sin(bakisAci) * 1.5, 1.5, 0, Math.PI * 2);
        ctx.arc(this.x + gozOffset + Math.cos(bakisAci) * 1.5, 
                this.y + yOffset - 2 + Math.sin(bakisAci) * 1.5, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Tank türü için zırh çizgileri
        if (this.tur === DUSMAN_TURU.TANK) {
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y + yOffset, this.boyut - 3, -0.5, 0.5);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.x, this.y + yOffset, this.boyut - 3, 2.1, 3.1);
            ctx.stroke();
        }
        // Uçan düşman kanatları
        if (this.ucanMi) {
            const kanatAcisi = Math.sin(this.animasyonZamani * 2) * 0.4;
            ctx.fillStyle = this.renk;
            // Sol kanat
            ctx.beginPath();
            ctx.moveTo(this.x - this.boyut, this.y + yOffset);
            ctx.lineTo(this.x - this.boyut - 8, this.y + yOffset - 6 + kanatAcisi * 10);
            ctx.lineTo(this.x - this.boyut + 4, this.y + yOffset + 4);
            ctx.closePath();
            ctx.fill();
            // Sağ kanat
            ctx.beginPath();
            ctx.moveTo(this.x + this.boyut, this.y + yOffset);
            ctx.lineTo(this.x + this.boyut + 8, this.y + yOffset - 6 + kanatAcisi * 10);
            ctx.lineTo(this.x + this.boyut - 4, this.y + yOffset + 4);
            ctx.closePath();
            ctx.fill();
        }
        // Yürüme animasyonu (normal ve hızlı düşmanlar)
        if (!this.ucanMi && !this.saldiriyorMu) {
            const bacakHareket = Math.sin(this.animasyonZamani * 2) * 4;
            ctx.fillStyle = this.renk;
            ctx.fillRect(this.x - 5, this.y + this.boyut - 2, 4, 6 + bacakHareket);
            ctx.fillRect(this.x + 1, this.y + this.boyut - 2, 4, 6 - bacakHareket);
        }
        ctx.restore();
        // Can çubuğu (hasar almışsa)
        if (this.can < this.maxCan) {
            const cubukGenislik = this.boyut * 2;
            const cubukY = this.y - this.boyut - 8 + (this.ucanMi ? -10 : 0);
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(this.x - cubukGenislik / 2, cubukY, cubukGenislik, 3);
            const canOrani = this.can / this.maxCan;
            ctx.fillStyle = canOrani > 0.5 ? '#4CAF50' : canOrani > 0.25 ? '#FF9800' : '#F44336';
            ctx.fillRect(this.x - cubukGenislik / 2, cubukY, cubukGenislik * canOrani, 3);
        }
    }
}
// ==================== DALGA YÖNETİCİSİ ====================
class DalgaYoneticisi {
    constructor() {
        this.dalgaNumarasi = 0;
        this.dalgaDusmanlari = []; // Bu dalganın üretilecek düşmanları
        this.uretilenSayi = 0;
        this.uretimAraligi = 1.5; // Saniye
        this.sonUretimZamani = 0;
        this.dalgaBittiMi = false;
    }
    // yeni dalga olustur
    yeniDalga() {
        this.dalgaNumarasi++;
        this.uretilenSayi = 0;
        this.sonUretimZamani = 0;
        this.dalgaBittiMi = false;
        // Dalga numarasına göre düşman kompozisyonunu belirle
        this.dalgaDusmanlari = this._dalgaIcerigi();
        // İleri dalgalarda daha hızlı üretim
        this.uretimAraligi = Math.max(0.5, 1.5 - this.dalgaNumarasi * 0.05);
    }
    // dalga icerigi - zorluk artisi
    _dalgaIcerigi() {
        const dusmanlar = [];
        const dalga = this.dalgaNumarasi;
        // Temel düşman sayısı (dalga ile artar)
        const normalSayi = 3 + Math.floor(dalga * 1.5);
        for (let i = 0; i < normalSayi; i++) {
            dusmanlar.push(DUSMAN_TURU.NORMAL);
        }
        // 2. dalgadan itibaren hızlı düşmanlar
        if (dalga >= 2) {
            const hizliSayi = Math.floor(dalga * 0.8);
            for (let i = 0; i < hizliSayi; i++) {
                dusmanlar.push(DUSMAN_TURU.HIZLI);
            }
        }
        // 4. dalgadan itibaren tank düşmanlar
        if (dalga >= 4) {
            const tankSayi = Math.floor((dalga - 3) * 0.5);
            for (let i = 0; i < tankSayi; i++) {
                dusmanlar.push(DUSMAN_TURU.TANK);
            }
        }
        // 6. dalgadan itibaren uçan düşmanlar
        if (dalga >= 6) {
            const ucanSayi = Math.floor((dalga - 5) * 0.6);
            for (let i = 0; i < ucanSayi; i++) {
                dusmanlar.push(DUSMAN_TURU.UCAK);
            }
        }
        // Düşman can ve hasarını dalga ile ölçekle
        return dusmanlar;
    }
    // zamana gore dusman uret
    guncelle(deltaZaman) {
        if (this.dalgaBittiMi) return null;
        this.sonUretimZamani += deltaZaman;
        if (this.sonUretimZamani >= this.uretimAraligi && this.uretilenSayi < this.dalgaDusmanlari.length) {
            this.sonUretimZamani = 0;
            const tur = this.dalgaDusmanlari[this.uretilenSayi];
            this.uretilenSayi++;
            // Rastgele kenardan spawn et
            const spawn = this._spawnKonumu();
            const dusman = new Dusman(tur, spawn.x, spawn.y);
            // Dalga numarasına göre can ölçekleme
            const canCarpani = 1 + (this.dalgaNumarasi - 1) * 0.15;
            dusman.maxCan = Math.floor(dusman.maxCan * canCarpani);
            dusman.can = dusman.maxCan;
            // Tüm düşmanlar üretildiyse dalga bitti
            if (this.uretilenSayi >= this.dalgaDusmanlari.length) {
                this.dalgaBittiMi = true;
            }
            return dusman;
        }
        return null;
    }
    // kenarlardan rastgele spawn
    _spawnKonumu() {
        const kenar = rastgeleTamSayi(0, 3); // 0: üst, 1: sağ, 2: alt, 3: sol
        let x, y;
        switch (kenar) {
            case 0: // Üst kenar
                x = rastgeleTamSayi(20, GRID_SUTUN * HUCRE_BOYUTU - 20);
                y = -20;
                break;
            case 1: // Sağ kenar
                x = GRID_SUTUN * HUCRE_BOYUTU + 20;
                y = rastgeleTamSayi(20, GRID_SATIR * HUCRE_BOYUTU - 20);
                break;
            case 2: // Alt kenar
                x = rastgeleTamSayi(20, GRID_SUTUN * HUCRE_BOYUTU - 20);
                y = GRID_SATIR * HUCRE_BOYUTU + 20;
                break;
            case 3: // Sol kenar
                x = -20;
                y = rastgeleTamSayi(20, GRID_SATIR * HUCRE_BOYUTU - 20);
                break;
        }
        return { x, y };
    }
    toplamDusmanSayisi() {
        return this.dalgaDusmanlari.length;
    }
    kalanDusmanSayisi() {
        return this.dalgaDusmanlari.length - this.uretilenSayi;
    }
    sifirla() {
        this.dalgaNumarasi = 0;
        this.dalgaDusmanlari = [];
        this.uretilenSayi = 0;
        this.dalgaBittiMi = false;
    }
}
