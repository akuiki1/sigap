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

export const ckFont =
    '-apple-system, "Inter", "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';
