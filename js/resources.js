// resources.js - Kaynak yonetimi (altin, tas, yiyecek)

class KaynakYoneticisi {
    constructor() {
        // Başlangıç kaynakları
        this.altin = BASLANGIC_ALTIN;
        this.tas = BASLANGIC_TAS;
        this.yiyecek = BASLANGIC_YIYECEK;
        this.skor = 0;
    }


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

    // kaynak harcama - yeterli yoksa false doner
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


    yeterliMi(altinMaliyet, tasMaliyet, yiyecekMaliyet) {
        return this.altin >= altinMaliyet && 
               this.tas >= tasMaliyet && 
               this.yiyecek >= yiyecekMaliyet;
    }


    skorEkle(miktar) {
        this.skor += miktar;
    }


    sifirla() {
        this.altin = BASLANGIC_ALTIN;
        this.tas = BASLANGIC_TAS;
        this.yiyecek = BASLANGIC_YIYECEK;
        this.skor = 0;
    }
}
