/**
 * Token warna & bayangan untuk pengalaman "Dashboard Cipta Karya" (Ringkasan
 * + Detail paket) — hasil implementasi dari handoff desain Claude Design.
 *
 * Sengaja terpisah dari tema shadcn/Tailwind bawaan (lihat resources/css/app.css):
 * mockup aslinya memakai palet ala iOS (bg krem #F4F3F0, aksen biru sistem)
 * yang murni preferensi tampilan alat desainnya — bukan keputusan brand.
 * Warna aksen di sini memakai biru institusional PUPR yang sudah dipakai di
 * seluruh aplikasi (var(--color-primary-light) di app.css) supaya halaman ini
 * tetap terasa satu produk dengan sisi lain SIGAP, sementara tata letak,
 * tipografi, dan spacing tetap mengikuti mockup apa adanya.
 */
export const ckColors = {
    bg: '#FFFFFF',
    text: '#1D1C1A',
    textMuted: '#8C8A85',
    textMuted2: '#86847E',
    textMuted3: '#9C9A94',
    textMuted4: '#A2A099',
    textMuted5: '#AEACA6',
    textMuted6: '#A8A6A0',
    textMuted7: '#B4B2AC',
    chevron: '#C7C5BF',
    border: 'rgba(0,0,0,.07)',
    borderSoft: 'rgba(0,0,0,.06)',
    hover: 'rgba(0,0,0,.045)',
    hoverStrong: 'rgba(0,0,0,.025)',
    accent: '#0066b3',
    accentSoft: 'rgba(0,102,179,.12)',
    danger: '#D63A2E',
    dangerSoft: 'rgba(214,58,46,.1)',
    warn: '#B9740A',
    warnSoft: 'rgba(185,116,10,.12)',
    cardShadow: '0 1px 1.5px rgba(30,25,15,.04), 0 5px 18px rgba(30,25,15,.03)',
} as const;

/**
 * Token khusus halaman Masuk (pages/auth/login.tsx). Warnanya tidak dipakai di
 * layar lain: panel kiri bergradasi dan kanvas krem hanya ada di halaman ini.
 *
 * Gradasi mockup (#0E4C8A → #082C51) diganti gradasi biru PUPR dengan titik
 * henti yang sama persis, mengikuti alasan yang sama seperti ckColors.accent.
 */
export const ckLogin = {
    /** Kanvas panel kanan — krem sangat terang, sedikit lebih hangat dari putih. */
    kanvas: '#FCFBF9',
    gradasi: 'linear-gradient(155deg, #0066b3 0%, #004b87 58%, #00325a 100%)',
    /** Teks di atas gradasi: putih penuh, lalu dua tingkat redup. */
    atasGradasi: 'rgba(255,255,255,.7)',
    atasGradasiRedup: 'rgba(255,255,255,.62)',
    atasGradasiPaling: 'rgba(255,255,255,.55)',
    labelField: '#5F5D57',
    borderField: '#E2E0DA',
    ikonField: '#9C9A94',
    /** Titik status "Tahun Anggaran" — hijau iOS mockup, didesaturasi seperti danger/warn. */
    ok: '#2E9E4F',
} as const;

export const ckFont =
    '-apple-system, "Inter", "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';
