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
    /**
     * Kanvas aplikasi di belakang panel utama. Sidebar duduk langsung di atas
     * warna ini tanpa latar sendiri, sehingga panel putih di sebelahnya terbaca
     * sebagai satu lembar yang mengambang — bukan dua kolom bersebelahan.
     */
    canvas: '#F4F3F0',
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
    /** Latar item navigasi aktif di topbar — sedikit lebih tipis dari accentSoft. */
    accentTint: 'rgba(0,102,179,.1)',
    danger: '#D63A2E',
    dangerSoft: 'rgba(214,58,46,.1)',
    warn: '#B9740A',
    warnSoft: 'rgba(185,116,10,.12)',
    /**
     * Lencana yang duduk di atas foto progres. Warnanya **buram**, bukan
     * setengah tembus seperti *Soft: nilainya persis hasil tint mockup
     * (danger .13 / warn .16) dikomposit di atas putih, jadi di atas kartu
     * terang tampilannya identik dengan desain — tapi di atas foto gelap ia
     * tidak ikut menggelap sampai teksnya hilang. Mockup tak pernah menemui
     * ini karena "foto"-nya cuma placeholder bergaris terang.
     */
    dangerOnFoto: 'rgb(250,229,228)',
    warnOnFoto: 'rgb(244,233,216)',
    /** Latar batang progres yang belum terisi. */
    barTrack: '#EDEBE6',
    /**
     * Placeholder foto progres pada kartu paket yang belum punya foto:
     * garis diagonal halus, bukan blok abu polos, supaya terbaca sebagai
     * "tempat gambar" alih-alih gambar yang gagal dimuat.
     */
    fotoPlaceholder:
        'repeating-linear-gradient(135deg,#EFEDE8 0 8px,#F7F5F1 8px 16px)',
    /**
     * Kartu dibatasi garis rambut, bukan bayangan: seluruh isi halaman kini
     * berada di atas panel putih yang sudah mengambang di atas kanvas, dan
     * menumpuk bayangan di dalam bayangan membuat batas kartunya kabur.
     */
    cardBorder: 'rgba(0,0,0,.08)',
    /** Bayangan panel utama yang mengambang di atas kanvas. */
    panelShadow: '0 1px 2px rgba(30,25,15,.05), 0 10px 30px rgba(30,25,15,.05)',
    /** Bayangan tipis item navigasi aktif — "kartu putih" kecil di atas kanvas. */
    navActiveShadow: '0 1px 2px rgba(30,25,15,.07)',
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
