// audio.js - Web Audio API ile ses sistemi
class SesYoneticisi {
    constructor() {
        // Web Audio API bağlamı - kullanıcı etkileşiminden sonra başlatılır
        this.audioCtx = null;
        this.aktifMi = true;
        this.muzikAktifMi = true;
        this.muzikSeviyesi = 0.3;
        this.efektSeviyesi = 0.5;
        // Müzik düğümleri
        this.muzikKazanc = null; // GainNode - ses seviyesi kontrolü
        this.efektKazanc = null;
        // Gündüz/gece müzik durumu
        this.mevcutMuzik = null;
        this.muzikZamanlayici = null;
    }
    // Audio context başlat - ilk tiklama sonrasi cagirilmali
    baslat() {
        if (this.audioCtx) return;
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            // Ana ses seviyesi kontrolü için gain düğümleri oluştur
            this.muzikKazanc = this.audioCtx.createGain();
            this.muzikKazanc.gain.value = this.muzikSeviyesi;
            this.muzikKazanc.connect(this.audioCtx.destination);
            this.efektKazanc = this.audioCtx.createGain();
            this.efektKazanc.gain.value = this.efektSeviyesi;
            this.efektKazanc.connect(this.audioCtx.destination);
        } catch (hata) {
            console.warn('Ses sistemi başlatılamadı:', hata);
            this.aktifMi = false;
        }
    }
    // basit ton calma
    _tonCal(frekans, sure, dalga = 'sine', seviye = 0.3) {
        if (!this.aktifMi || !this.audioCtx) return;
        const osilatör = this.audioCtx.createOscillator();
        const kazanc = this.audioCtx.createGain();
        osilatör.type = dalga;
        osilatör.frequency.value = frekans;
        kazanc.gain.setValueAtTime(seviye * this.efektSeviyesi, this.audioCtx.currentTime);
        // Ses sonunda yumuşak bir şekilde azalır
        kazanc.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + sure);
        osilatör.connect(kazanc);
        kazanc.connect(this.efektKazanc);
        osilatör.start(this.audioCtx.currentTime);
        osilatör.stop(this.audioCtx.currentTime + sure);
    }
    // gurultu sesi - patlama icin
    _gurultuCal(sure, seviye = 0.2) {
        if (!this.aktifMi || !this.audioCtx) return;
        const tamponBoyutu = this.audioCtx.sampleRate * sure;
        const tampon = this.audioCtx.createBuffer(1, tamponBoyutu, this.audioCtx.sampleRate);
        const veri = tampon.getChannelData(0);
        // Rastgele gürültü verisi oluştur
        for (let i = 0; i < tamponBoyutu; i++) {
            veri[i] = Math.random() * 2 - 1;
        }
        const kaynak = this.audioCtx.createBufferSource();
        kaynak.buffer = tampon;
        const kazanc = this.audioCtx.createGain();
        kazanc.gain.setValueAtTime(seviye * this.efektSeviyesi, this.audioCtx.currentTime);
        kazanc.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + sure);
        kaynak.connect(kazanc);
        kazanc.connect(this.efektKazanc);
        kaynak.start();
    }
    // SES EFEKTLERİ 
    // bina insa sesi
    insaSesi() {
        this._tonCal(200, 0.1, 'square', 0.2);
        setTimeout(() => this._tonCal(300, 0.15, 'square', 0.15), 50);
        this._gurultuCal(0.1, 0.1);
    }
    // ok atisi
    okSesi() {
        this._tonCal(800, 0.08, 'sawtooth', 0.15);
        this._tonCal(1200, 0.05, 'sine', 0.1);
    }
    // top atisi
    topSesi() {
        this._tonCal(80, 0.3, 'sawtooth', 0.3);
        this._gurultuCal(0.2, 0.2);
    }
    hasarSesi() {
        this._tonCal(400, 0.08, 'square', 0.1);
    }
    dusmanOlumSesi() {
        this._tonCal(600, 0.1, 'square', 0.2);
        setTimeout(() => this._tonCal(400, 0.1, 'square', 0.15), 60);
        setTimeout(() => this._tonCal(200, 0.2, 'square', 0.1), 120);
    }
    binaHasarSesi() {
        this._tonCal(150, 0.15, 'sawtooth', 0.2);
        this._gurultuCal(0.1, 0.1);
    }
    binaYikildiSesi() {
        this._tonCal(100, 0.3, 'sawtooth', 0.3);
        this._gurultuCal(0.3, 0.2);
        setTimeout(() => this._tonCal(60, 0.4, 'sawtooth', 0.2), 100);
    }
    // dalga baslangic alarmı
    dalgaBaslangiçSesi() {
        this._tonCal(440, 0.2, 'square', 0.25);
        setTimeout(() => this._tonCal(550, 0.2, 'square', 0.25), 200);
        setTimeout(() => this._tonCal(660, 0.3, 'square', 0.3), 400);
    }
    geceBaslangiçSesi() {
        this._tonCal(330, 0.3, 'triangle', 0.2);
        setTimeout(() => this._tonCal(220, 0.4, 'triangle', 0.25), 200);
        setTimeout(() => this._tonCal(165, 0.5, 'triangle', 0.2), 400);
    }
    gunduzBaslangiçSesi() {
        this._tonCal(330, 0.2, 'triangle', 0.2);
        setTimeout(() => this._tonCal(440, 0.2, 'triangle', 0.25), 150);
        setTimeout(() => this._tonCal(550, 0.3, 'triangle', 0.3), 300);
        setTimeout(() => this._tonCal(660, 0.4, 'triangle', 0.2), 450);
    }
    oyunBittiSesi() {
        this._tonCal(440, 0.3, 'sine', 0.3);
        setTimeout(() => this._tonCal(370, 0.3, 'sine', 0.3), 300);
        setTimeout(() => this._tonCal(330, 0.3, 'sine', 0.3), 600);
        setTimeout(() => this._tonCal(220, 0.6, 'sine', 0.35), 900);
    }
    butonSesi() {
        this._tonCal(600, 0.05, 'sine', 0.15);
    }
    kaynakSesi() {
        this._tonCal(880, 0.08, 'sine', 0.12);
        setTimeout(() => this._tonCal(1100, 0.06, 'sine', 0.1), 50);
    }
    // ARKAPLAN MÜZİĞİ
    // gunduz muzigi - sakin melodi
    gunduzMuzigi() {
        if (!this.aktifMi || !this.audioCtx || !this.muzikAktifMi) return;
        this._muzikDurdur();
        //Melodi notaları
        const notalar = [262, 294, 330, 392, 440, 392, 330, 294];
        const sureler = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
        this._melodiCal(notalar, sureler, 'sine', 0.08, true);
    }
    // gece muzigi - gerilimli
    geceMuzigi() {
        if (!this.aktifMi || !this.audioCtx || !this.muzikAktifMi) return;
        this._muzikDurdur();
        // notalar
        const notalar = [165, 196, 185, 165, 147, 165, 185, 147];
        const sureler = [0.6, 0.4, 0.6, 0.4, 0.6, 0.4, 0.6, 0.4];
        this._melodiCal(notalar, sureler, 'triangle', 0.06, true);
    }
    // melodi dongusu
    _melodiCal(notalar, sureler, dalga, seviye, dongu) {
        let index = 0;
        const toplamSure = sureler.reduce((t, s) => t + s, 0) * 1000;
        const birNotaCal = () => {
            if (!this.muzikAktifMi) return;
            const osilatör = this.audioCtx.createOscillator();
            const kazanc = this.audioCtx.createGain();
            osilatör.type = dalga;
            osilatör.frequency.value = notalar[index];
            const notaSuresi = sureler[index];
            kazanc.gain.setValueAtTime(seviye * this.muzikSeviyesi, this.audioCtx.currentTime);
            kazanc.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + notaSuresi * 0.9);
            osilatör.connect(kazanc);
            kazanc.connect(this.muzikKazanc);
            osilatör.start();
            osilatör.stop(this.audioCtx.currentTime + notaSuresi);
            index = (index + 1) % notalar.length;
        };
        // İlk notayı çalma
        birNotaCal();
        // Sonraki notalar için zamanlayıcı oluşturma
        let gecenSure = sureler[0] * 1000;
        const zamanla = () => {
            this.muzikZamanlayici = setTimeout(() => {
                birNotaCal();
                gecenSure += sureler[index === 0 ? notalar.length - 1 : index - 1] * 1000;
                zamanla();
            }, sureler[index === 0 ? notalar.length - 1 : index - 1] * 1000);
        };
        zamanla();
    }
    _muzikDurdur() {
        if (this.muzikZamanlayici) {
            clearTimeout(this.muzikZamanlayici);
            this.muzikZamanlayici = null;
        }
    }
    // ses toggle
    sesAcKapa() {
        this.aktifMi = !this.aktifMi;
        if (!this.aktifMi) {
            this._muzikDurdur();
        }
        return this.aktifMi;
    }
    // muzik toggle
    muzikAcKapa() {
        this.muzikAktifMi = !this.muzikAktifMi;
        if (!this.muzikAktifMi) {
            this._muzikDurdur();
        }
        return this.muzikAktifMi;
    }
}
// Global ses yöneticisi örneği
const sesYoneticisi = new SesYoneticisi();
