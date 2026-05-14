// utils.js - Sabitler ve yardımcı fonksiyonlar
// ==================== OYUN SABİTLERİ ====================
// Canvas ve grid boyutları
const CANVAS_GENISLIK = 960;
const CANVAS_YUKSEKLIK = 640;
const HUCRE_BOYUTU = 40;
const GRID_SUTUN = 24;    // 24 * 40 = 960
const GRID_SATIR = 14;    // 14 * 40 = 560
const UI_YUKSEKLIK = 80;  // Alt panel yüksekliği
// Kale (üs) konumu - grid merkezinde 2x2 alan kaplar
const KALE_SUTUN = 11;
const KALE_SATIR = 6;
const KALE_GENISLIK = 2;
const KALE_YUKSEKLIK = 2;
const KALE_MAX_CAN = 200;
// Oyun durumları
const OYUN_DURUMU = {
    MENU: 'menu',
    GUNDUZ: 'gunduz',
    GECE_GECIS: 'gece_gecis',
    GECE: 'gece',
    GUNDUZ_GECIS: 'gunduz_gecis',
    OYUN_BITTI: 'oyun_bitti'
};
// Başlangıç kaynakları
const BASLANGIC_ALTIN = 150;
const BASLANGIC_TAS = 80;
const BASLANGIC_YIYECEK = 50;
// Gündüz süresi (saniye)
const GUNDUZ_SURESI = 45;
// Renk paleti - Çöl teması
const RENKLER = {
    // Gökyüzü
    GUNDUZ_UST: '#4A90D9',
    GUNDUZ_ALT: '#87CEEB',
    GECE_UST: '#0A0E27',
    GECE_ALT: '#1B2845',
    // Zemin
    KUM_ACIK: '#E8D5A3',
    KUM_KOYU: '#D4C088',
    KUM_COK_KOYU: '#B8A472',
    // Grid
    GRID_CIZGI: 'rgba(139, 119, 85, 0.3)',
    GRID_VURGU: 'rgba(76, 175, 80, 0.3)',
    GRID_GECERSIZ: 'rgba(244, 67, 54, 0.3)',
    // Binalar
    DUVAR: '#9E9E9E',
    DUVAR_KOYU: '#757575',
    KULE_AHSAP: '#8D6E63',
    KULE_AHSAP_KOYU: '#5D4037',
    KULE_TOP: '#546E7A',
    KULE_TOP_KOYU: '#37474F',
    EV: '#BCAAA4',
    EV_CATI: '#D84315',
    CIFTLIK_YESIL: '#66BB6A',
    CIFTLIK_KOYU: '#388E3C',
    MADEN: '#78909C',
    MADEN_KOYU: '#546E7A',
    // Kale
    KALE: '#6D4C41',
    KALE_KOYU: '#4E342E',
    KALE_BAYRAK: '#F44336',
    // Düşmanlar
    DUSMAN_NORMAL: '#E53935',
    DUSMAN_HIZLI: '#FF7043',
    DUSMAN_TANK: '#B71C1C',
    DUSMAN_UCAK: '#7E57C2',
    // Mermiler
    MERMI_OK: '#FFD54F',
    MERMI_TOP: '#455A64',
    MERMI_PATLAMA: '#FF6F00',
    // UI
    UI_ARKAPLAN: 'rgba(15, 20, 35, 0.85)',
    UI_KENAR: 'rgba(255, 215, 0, 0.4)',
    UI_YAZI: '#FFFFFF',
    UI_ALTIN: '#FFD700',
    UI_TAS: '#90A4AE',
    UI_YIYECEK: '#81C784',
    UI_SECILI: 'rgba(255, 215, 0, 0.3)',
    // Efektler
    PARLAMA: 'rgba(255, 255, 200, 0.6)',
    GOLGE: 'rgba(0, 0, 0, 0.3)'
};
// ==================== YARDIMCI FONKSİYONLAR ====================
// iki nokta arası mesafe
function mesafeHesapla(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}
function rastgeleTamSayi(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function rastgeleOndalik(min, max) {
    return Math.random() * (max - min) + min;
}
// clamp
function sinirla(deger, min, max) {
    return Math.max(min, Math.min(max, deger));
}
// grid <-> piksel dönüşümleri
function griddenPiksele(sutun, satir) {
    return {
        x: sutun * HUCRE_BOYUTU,
        y: satir * HUCRE_BOYUTU
    };
}
function pikseledenGride(x, y) {
    return {
        sutun: Math.floor(x / HUCRE_BOYUTU),
        satir: Math.floor(y / HUCRE_BOYUTU)
    };
}
function gridIcindeMi(sutun, satir) {
    return sutun >= 0 && sutun < GRID_SUTUN && satir >= 0 && satir < GRID_SATIR;
}
// AABB çarpışma kontrolü
function dikdortgenCarpisma(x1, y1, g1, u1, x2, y2, g2, u2) {
    return x1 < x2 + g2 && x1 + g1 > x2 && y1 < y2 + u2 && y1 + u1 > y2;
}
function noktaDikdortgenIcinde(noktaX, noktaY, dikX, dikY, dikG, dikU) {
    return noktaX >= dikX && noktaX <= dikX + dikG &&
           noktaY >= dikY && noktaY <= dikY + dikU;
}
// daire-dikdortgen carpisma
function daireDikdortgenCarpisma(daireX, daireY, yaricap, dikX, dikY, dikG, dikU) {
    const yakinX = sinirla(daireX, dikX, dikX + dikG);
    const yakinY = sinirla(daireY, dikY, dikY + dikU);
    return mesafeHesapla(daireX, daireY, yakinX, yakinY) <= yaricap;
}
function aciHesapla(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}
// easeInOut - smooth geçiş için
function yumusakGecis(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
function hucreMerkezi(sutun, satir) {
    return {
        x: sutun * HUCRE_BOYUTU + HUCRE_BOYUTU / 2,
        y: satir * HUCRE_BOYUTU + HUCRE_BOYUTU / 2
    };
}
// 1000 -> 1K seklinde formatlama
function sayiFormatla(sayi) {
    if (sayi >= 1000) {
        return (sayi / 1000).toFixed(1) + 'K';
    }
    return sayi.toString();
}
