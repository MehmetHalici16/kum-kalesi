/**
 * resources.js - Kaynak Yönetim Sistemi
 * Oyundaki altın, taş ve yiyecek kaynaklarını yönetir.
 */

class KaynakYoneticisi {
    constructor() {
        // Başlangıç kaynakları
        this.altin = BASLANGIC_ALTIN;
        this.tas = BASLANGIC_TAS;
        this.yiyecek = BASLANGIC_YIYECEK;
        this.skor = 0;
    }

    /**
     * Belirtilen miktarda kaynak eklenir
     */
    kaynakEkle(tur, miktar) {
        switch (tur) {
            case 'altin':
                this.altin += miktar;
                break;
            case 'tas':
                this.tas += miktar;
                break;
            case 'yiyecek':
                this.yiyecek += miktar;
                break;
        }
    }

    /**
     * Belirtilen miktarda kaynak harcanır
     * @returns {boolean} Yeterli kaynak varsa true döner
     */
    kaynakHarca(altinMaliyet, tasMaliyet, yiyecekMaliyet) {
        if (this.altin >= altinMaliyet && 
            this.tas >= tasMaliyet && 
            this.yiyecek >= yiyecekMaliyet) {
            this.altin -= altinMaliyet;
            this.tas -= tasMaliyet;
            this.yiyecek -= yiyecekMaliyet;
            return true;
        }
        return false;
    }

    /**
     * Yeterli kaynak olup olmadığını kontrol eder
     */
    yeterliMi(altinMaliyet, tasMaliyet, yiyecekMaliyet) {
        return this.altin >= altinMaliyet && 
               this.tas >= tasMaliyet && 
               this.yiyecek >= yiyecekMaliyet;
    }

    /**
     * Skor ekler
     */
    skorEkle(miktar) {
        this.skor += miktar;
    }

    /**
     * Kaynakları sıfırlar (yeni oyun için)
     */
    sifirla() {
        this.altin = BASLANGIC_ALTIN;
        this.tas = BASLANGIC_TAS;
        this.yiyecek = BASLANGIC_YIYECEK;
        this.skor = 0;
    }
}
