/**
 * projectiles.js - Mermi Sistemi
 * Kulelerin attığı ok ve top mermilerini yönetir.
 * Çarpışma tespiti ve hasar uygulaması bu dosyada yapılır.
 */

class Mermi {
    /**
     * Mermi oluşturur
     * @param {number} x - Başlangıç x konumu
     * @param {number} y - Başlangıç y konumu
     * @param {Dusman} hedef - Hedef düşman
     * @param {number} hasar - Verilecek hasar miktarı
     * @param {string} tur - Mermi türü ('ok' veya 'top')
     * @param {number} patlamaYaricapi - Patlama yarıçapı (sadece top için)
     */
    constructor(x, y, hedef, hasar, tur, patlamaYaricapi) {
        this.x = x;
        this.y = y;
        this.hedef = hedef;
        this.hasar = hasar;
        this.tur = tur;
        this.patlamaYaricapi = patlamaYaricapi;
        this.aktifMi = true;
        
        // Mermi hızı (piksel/saniye)
        this.hiz = tur === 'ok' ? 350 : 200;
        
        // Mermi boyutu
        this.boyut = tur === 'ok' ? 3 : 5;
        
        // Yörünge açısı
        this.aci = aciHesapla(x, y, hedef.x, hedef.y);
        
        // İz efekti için önceki konumlar
        this.iz = [];
        this.izMaxUzunluk = tur === 'ok' ? 5 : 3;
    }

    /**
     * Mermiyi günceller - hareket ve çarpışma kontrolü
     * @returns {object|null} Patlama bilgisi veya null
     */
    guncelle(deltaZaman, dusmanlar, parcaciklar) {
        if (!this.aktifMi) return null;

        // İz kaydı
        this.iz.push({ x: this.x, y: this.y });
        if (this.iz.length > this.izMaxUzunluk) {
            this.iz.shift();
        }

        // Hedef hâlâ yaşıyorsa hedefi takip et
        if (this.hedef && this.hedef.pikseldeMi) {
            this.aci = aciHesapla(this.x, this.y, this.hedef.x, this.hedef.y);
        }

        // Hareket ettir
        this.x += Math.cos(this.aci) * this.hiz * deltaZaman;
        this.y += Math.sin(this.aci) * this.hiz * deltaZaman;

        // Hedefle çarpışma kontrolü
        if (this.hedef && this.hedef.pikseldeMi) {
            const mesafe = mesafeHesapla(this.x, this.y, this.hedef.x, this.hedef.y);
            
            if (mesafe < this.hedef.boyut + this.boyut) {
                this.aktifMi = false;

                if (this.tur === 'top' && this.patlamaYaricapi > 0) {
                    // Top mermisi - alan hasarı
                    return this._patla(dusmanlar, parcaciklar);
                } else {
                    // Ok mermisi - tek hedef hasarı
                    const oldu = this.hedef.hasarAl(this.hasar);
                    sesYoneticisi.hasarSesi();
                    
                    // Çarpma parçacıkları
                    this._carpmaEfekti(parcaciklar);
                    
                    return oldu ? { olduMu: true, dusman: this.hedef } : null;
                }
            }
        }

        // Ekran dışına çıktıysa deaktif et
        if (this.x < -50 || this.x > CANVAS_GENISLIK + 50 ||
            this.y < -50 || this.y > CANVAS_YUKSEKLIK + 50) {
            this.aktifMi = false;
        }

        // Hedef öldüyse de deaktif et
        if (this.hedef && !this.hedef.pikseldeMi) {
            this.aktifMi = false;
        }

        return null;
    }

    /**
     * Top mermisi patlaması - alan hasarı
     */
    _patla(dusmanlar, parcaciklar) {
        const oluler = [];
        
        // Patlama alanındaki tüm düşmanlara hasar ver
        for (const dusman of dusmanlar) {
            if (!dusman.pikseldeMi) continue;
            
            const mesafe = mesafeHesapla(this.x, this.y, dusman.x, dusman.y);
            if (mesafe <= this.patlamaYaricapi) {
                // Mesafeye göre hasar azalması
                const hasarCarpani = 1 - (mesafe / this.patlamaYaricapi) * 0.5;
                const oldu = dusman.hasarAl(Math.floor(this.hasar * hasarCarpani));
                if (oldu) {
                    oluler.push(dusman);
                }
            }
        }

        // Patlama parçacıkları
        if (parcaciklar) {
            for (let i = 0; i < 15; i++) {
                parcaciklar.push(new Parcacik(
                    this.x, this.y,
                    rastgeleOndalik(-80, 80),
                    rastgeleOndalik(-80, 80),
                    rastgeleOndalik(0.3, 0.6),
                    rastgeleTamSayi(3, 7),
                    RENKLER.MERMI_PATLAMA
                ));
            }
            // Duman parçacıkları
            for (let i = 0; i < 8; i++) {
                parcaciklar.push(new Parcacik(
                    this.x + rastgeleOndalik(-10, 10),
                    this.y + rastgeleOndalik(-10, 10),
                    rastgeleOndalik(-30, 30),
                    rastgeleOndalik(-40, -10),
                    rastgeleOndalik(0.5, 1.0),
                    rastgeleTamSayi(5, 10),
                    'rgba(100,100,100,0.6)'
                ));
            }
        }

        return { olduMu: oluler.length > 0, oluler: oluler };
    }

    /**
     * Çarpma anında parçacık efekti oluşturur
     */
    _carpmaEfekti(parcaciklar) {
        if (!parcaciklar) return;
        
        for (let i = 0; i < 5; i++) {
            parcaciklar.push(new Parcacik(
                this.x, this.y,
                rastgeleOndalik(-40, 40),
                rastgeleOndalik(-40, 40),
                rastgeleOndalik(0.2, 0.4),
                rastgeleTamSayi(2, 4),
                RENKLER.MERMI_OK
            ));
        }
    }

    /**
     * Mermiyi canvas üzerine çizer
     */
    ciz(ctx) {
        if (!this.aktifMi) return;

        // İz çiz
        for (let i = 0; i < this.iz.length; i++) {
            const opaklık = (i / this.iz.length) * 0.4;
            ctx.fillStyle = this.tur === 'ok' ? 
                `rgba(255, 213, 79, ${opaklık})` : 
                `rgba(69, 90, 100, ${opaklık})`;
            ctx.beginPath();
            ctx.arc(this.iz[i].x, this.iz[i].y, this.boyut * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.aci);

        if (this.tur === 'ok') {
            // Ok çizimi
            ctx.fillStyle = RENKLER.MERMI_OK;
            ctx.beginPath();
            ctx.moveTo(8, 0);
            ctx.lineTo(-4, -2.5);
            ctx.lineTo(-4, 2.5);
            ctx.closePath();
            ctx.fill();
            
            // Ok gövdesi
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(-8, -1, 10, 2);
            
            // Ok tüyleri
            ctx.fillStyle = '#ECEFF1';
            ctx.beginPath();
            ctx.moveTo(-8, 0);
            ctx.lineTo(-12, -3);
            ctx.lineTo(-10, 0);
            ctx.lineTo(-12, 3);
            ctx.closePath();
            ctx.fill();
        } else {
            // Top mermisi çizimi
            ctx.fillStyle = RENKLER.MERMI_TOP;
            ctx.beginPath();
            ctx.arc(0, 0, this.boyut, 0, Math.PI * 2);
            ctx.fill();
            
            // Parlama efekti
            ctx.fillStyle = 'rgba(255, 200, 100, 0.5)';
            ctx.beginPath();
            ctx.arc(-1, -1, this.boyut * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
