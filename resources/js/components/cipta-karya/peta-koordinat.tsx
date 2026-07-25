import { router, usePage } from '@inertiajs/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import koordinatRoutes from '@/routes/koordinat';
import paketRoutes from '@/routes/paket';
import type { TitikKoordinat } from '@/types';
import {
    CkButton,
    CkDialog,
    CkDialogClose,
    CkDialogContent,
    CkDialogDescription,
    CkDialogFooter,
    CkDialogTitle,
    CkField,
    CkInput,
    CkTextarea,
} from './ck-dialog';
import { CkCard, CkSectionLabel } from './primitives';
import { ckColors } from './tokens';

/**
 * Pusat peta saat sebuah paket belum punya titik sama sekali: alun-alun
 * Barabai, ibu kota Kabupaten Hulu Sungai Tengah. Zoom 13 kira-kira memuat
 * seluruh kota, cukup untuk menggeser ke lokasi gedung tanpa tersesat.
 */
const PUSAT_HST: [number, number] = [-2.5836, 115.3815];
const ZOOM_AWAL = 13;

/** Zoom saat melompat ke hasil pencarian — cukup dekat untuk mengenali bangunan. */
const ZOOM_HASIL_CARI = 17;

function pin(warna: string, kelas = ''): L.DivIcon {
    // Penanda dibuat dari SVG inline lewat divIcon, bukan ikon PNG bawaan
    // Leaflet: ikon bawaan dirujuk secara relatif dari CSS-nya sendiri sehingga
    // rusak begitu di-bundle Vite, dan cara ini sekalian membuat warnanya ikut
    // token aksen.
    return L.divIcon({
        className: kelas,
        html: `<svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 31C12 31 22 19.5 22 12A10 10 0 1 0 2 12c0 7.5 10 19 10 19Z"
                  fill="${warna}" stroke="#fff" stroke-width="2"/>
            <circle cx="12" cy="12" r="3.5" fill="#fff"/>
        </svg>`,
        iconSize: [24, 32],
        iconAnchor: [12, 32],
    });
}

const penandaTersimpan = pin(ckColors.accent);
const penandaPratinjau = pin(ckColors.warn, 'ck-penanda-pratinjau');

function formatPosisi(lat: number, lng: number): string {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Bentuk yang ditulis balik ke kotak koordinat setelah klik/geser di peta —
 * sengaja sama persis dengan yang disalin orang dari Google Maps, supaya isi
 * kotaknya konsisten dari mana pun titiknya datang. Tujuh desimal ≈ 1 cm,
 * setara presisi kolom di basis data.
 */
function formatIsian(lat: number, lng: number): string {
    return `${lat.toFixed(7)}, ${lng.toFixed(7)}`;
}

type Posisi = { lat: number; lng: number };

function sahkan(lat: number, lng: number): Posisi | null {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
    }

    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        return null;
    }

    return { lat, lng };
}

/**
 * Hemisfer pada notasi derajat-menit-detik → sumbu mana & tandanya. Selain
 * singkatan Inggris (N/S/E/W), Google Maps berbahasa Indonesia memakai
 * U/S (utara/selatan) dan T/B (timur/barat), termasuk bentuk panjang
 * LU/LS/BT/BB — semuanya ikut dikenali supaya tempelan apa adanya tetap jalan.
 */
const HEMISFER: Record<string, { sumbu: 'lat' | 'lng'; tanda: 1 | -1 }> = {
    N: { sumbu: 'lat', tanda: 1 },
    U: { sumbu: 'lat', tanda: 1 },
    LU: { sumbu: 'lat', tanda: 1 },
    S: { sumbu: 'lat', tanda: -1 },
    LS: { sumbu: 'lat', tanda: -1 },
    E: { sumbu: 'lng', tanda: 1 },
    T: { sumbu: 'lng', tanda: 1 },
    BT: { sumbu: 'lng', tanda: 1 },
    W: { sumbu: 'lng', tanda: -1 },
    B: { sumbu: 'lng', tanda: -1 },
    BB: { sumbu: 'lng', tanda: -1 },
};

/** Mis. 2°35'01.1"S 115°22'53.3"E — bentuk yang muncul di URL Google Maps. */
const POLA_DMS =
    /(\d+(?:\.\d+)?)\s*°\s*(?:(\d+(?:\.\d+)?)\s*['’′]\s*)?(?:(\d+(?:\.\d+)?)\s*(?:"|”|″|'')\s*)?([A-Z]{1,2})/gi;

function bacaDms(teks: string): Posisi | null {
    const nilai: Partial<Posisi> = {};
    let cocok = 0;

    for (const m of teks.matchAll(POLA_DMS)) {
        const arah = HEMISFER[m[4].toUpperCase()];

        if (!arah) {
            return null;
        }

        const desimal =
            Number.parseFloat(m[1]) +
            Number.parseFloat(m[2] ?? '0') / 60 +
            Number.parseFloat(m[3] ?? '0') / 3600;

        nilai[arah.sumbu] = desimal * arah.tanda;
        cocok++;
    }

    // Harus tepat dua komponen, satu lintang & satu bujur.
    if (cocok !== 2 || nilai.lat === undefined || nilai.lng === undefined) {
        return null;
    }

    return sahkan(nilai.lat, nilai.lng);
}

function bacaDesimal(teks: string): Posisi | null {
    // Tautan Google Maps menyimpan posisi setelah "@" (mis. /@-2.58,115.38,17z)
    // atau pada parameter q= / ll=; ambil dari situ bila yang ditempel URL utuh.
    const dariTautan = teks.match(/[@=](-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);

    const bagian = dariTautan
        ? [dariTautan[1], dariTautan[2]]
        : teks.split(/[,;\s]+/).filter((s) => s !== '');

    if (bagian.length !== 2) {
        return null;
    }

    return sahkan(Number.parseFloat(bagian[0]), Number.parseFloat(bagian[1]));
}

/**
 * Baca satu kotak koordinat menjadi posisi peta. Sengaja satu kotak, bukan
 * lintang & bujur terpisah: bentuk "lintang, bujur" itulah yang disalin orang
 * dari Google Maps, dan memecahnya jadi dua kotak memaksa mereka memotong
 * teksnya sendiri — pintu masuk salah tempel yang tak perlu ada.
 *
 * Null bila belum terisi atau formatnya belum dikenali; penanda pratinjau lalu
 * disembunyikan alih-alih melompat ke titik ngawur saat baru diketik separuh.
 */
function bacaKoordinat(teks: string): Posisi | null {
    const bersih = teks.trim();

    if (bersih === '') {
        return null;
    }

    return bacaDms(bersih) ?? bacaDesimal(bersih);
}

type HasilCari = {
    nama: string;
    lat: number;
    lng: number;
};

/**
 * Pencarian lokasi lewat Nominatim (layanan geocoding resmi OpenStreetMap):
 * gratis dan tanpa API key, sejalan dengan alasan memilih tile OSM. Pencarian
 * hanya jalan saat ditekan/Enter — bukan tiap ketikan — karena kebijakan
 * pemakaian Nominatim membatasi satu permintaan per detik.
 */
function KotakCari({ onPilih }: { onPilih: (hasil: HasilCari) => void }) {
    const [kata, setKata] = useState('');
    const [hasil, setHasil] = useState<HasilCari[] | null>(null);
    const [mencari, setMencari] = useState(false);
    const [galat, setGalat] = useState<string | null>(null);

    async function cari() {
        const q = kata.trim();

        if (q === '') {
            return;
        }

        setMencari(true);
        setGalat(null);
        setHasil(null);

        try {
            const url = new URL('https://nominatim.openstreetmap.org/search');
            url.searchParams.set('format', 'jsonv2');
            url.searchParams.set('limit', '6');
            url.searchParams.set('countrycodes', 'id');
            url.searchParams.set('q', q);

            const respons = await fetch(url, {
                headers: { 'Accept-Language': 'id' },
            });

            if (!respons.ok) {
                throw new Error(String(respons.status));
            }

            const data: { display_name: string; lat: string; lon: string }[] =
                await respons.json();

            setHasil(
                data.map((d) => ({
                    nama: d.display_name,
                    lat: Number.parseFloat(d.lat),
                    lng: Number.parseFloat(d.lon),
                })),
            );
        } catch {
            setGalat('Pencarian gagal — periksa koneksi, lalu coba lagi.');
        } finally {
            setMencari(false);
        }
    }

    return (
        <div style={{ position: 'relative' }}>
            <div
                style={{
                    display: 'flex',
                    gap: 8,
                    padding: '11px 18px',
                    borderTop: `1px solid ${ckColors.border}`,
                }}
            >
                <CkInput
                    value={kata}
                    onChange={(e) => setKata(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            void cari();
                        }
                    }}
                    placeholder="Cari lokasi — mis. Barabai, Hulu Sungai Tengah"
                    style={{ flex: 1 }}
                />
                <CkButton
                    variant="ghost"
                    onClick={() => void cari()}
                    disabled={mencari || kata.trim() === ''}
                    style={{ flex: 'none' }}
                >
                    {mencari ? 'Mencari…' : 'Cari'}
                </CkButton>
            </div>

            {galat && (
                <div
                    style={{
                        padding: '0 18px 10px',
                        fontSize: 12.5,
                        color: ckColors.danger,
                    }}
                >
                    {galat}
                </div>
            )}

            {hasil !== null && (
                <div style={{ padding: '0 18px 10px' }}>
                    {hasil.length === 0 ? (
                        <div
                            style={{
                                fontSize: 12.5,
                                color: ckColors.textMuted,
                            }}
                        >
                            Lokasi tidak ditemukan. Coba kata kunci lain, atau
                            klik langsung di peta.
                        </div>
                    ) : (
                        <div
                            style={{
                                border: `1px solid ${ckColors.border}`,
                                borderRadius: 10,
                                overflow: 'hidden',
                            }}
                        >
                            {hasil.map((h, i) => (
                                <button
                                    key={`${h.lat},${h.lng}`}
                                    type="button"
                                    className="ck-row"
                                    onClick={() => {
                                        onPilih(h);
                                        setHasil(null);
                                    }}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '9px 12px',
                                        fontSize: 13,
                                        color: ckColors.text,
                                        background: 'none',
                                        border: 'none',
                                        borderTop:
                                            i === 0
                                                ? undefined
                                                : `1px solid ${ckColors.border}`,
                                        cursor: 'pointer',
                                        font: 'inherit',
                                    }}
                                >
                                    {h.nama}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function TitikRow({
    titik,
    canInput,
    onSorot,
}: {
    titik: TitikKoordinat;
    canInput: boolean;
    onSorot: (titik: TitikKoordinat) => void;
}) {
    const [hapusOpen, setHapusOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '13px 18px',
                // Selalu ada garis atas: baris pertama pun perlu dipisahkan
                // dari peta / baris petunjuk di atasnya.
                borderTop: `1px solid ${ckColors.border}`,
            }}
        >
            <div style={{ flex: 1, minWidth: 0 }}>
                <button
                    type="button"
                    onClick={() => onSorot(titik)}
                    className="ck-link-accent"
                    style={{
                        fontSize: 14,
                        fontWeight: 560,
                        color: ckColors.accent,
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        textAlign: 'left',
                    }}
                >
                    {titik.label}
                </button>

                <div
                    style={{
                        fontSize: 12.5,
                        color: ckColors.textMuted,
                        fontVariantNumeric: 'tabular-nums',
                        marginTop: 2,
                    }}
                >
                    {formatPosisi(titik.latitude, titik.longitude)}
                </div>

                {titik.keterangan && (
                    <div
                        style={{
                            fontSize: 13,
                            color: ckColors.text,
                            marginTop: 4,
                        }}
                    >
                        {titik.keterangan}
                    </div>
                )}

                <div
                    style={{
                        fontSize: 12,
                        color: ckColors.textMuted,
                        marginTop: 4,
                    }}
                >
                    Dicatat oleh {titik.dicatat_oleh}
                </div>
            </div>

            {canInput && (
                <button
                    type="button"
                    onClick={() => setHapusOpen(true)}
                    className="ck-link-accent"
                    style={{
                        fontSize: 12.5,
                        fontWeight: 560,
                        color: ckColors.danger,
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        flex: 'none',
                    }}
                >
                    Hapus
                </button>
            )}

            <CkDialog open={hapusOpen} onOpenChange={setHapusOpen}>
                <CkDialogContent>
                    <CkDialogTitle>Hapus titik ini?</CkDialogTitle>
                    <CkDialogDescription>
                        Titik “{titik.label}” akan dihapus dari peta paket ini.
                    </CkDialogDescription>

                    <CkDialogFooter>
                        <CkDialogClose asChild>
                            <CkButton variant="ghost">Batal</CkButton>
                        </CkDialogClose>
                        <CkButton
                            variant="danger"
                            disabled={deleting}
                            onClick={() => {
                                setDeleting(true);
                                router.delete(
                                    koordinatRoutes.destroy(titik.id).url,
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => setHapusOpen(false),
                                        onFinish: () => setDeleting(false),
                                    },
                                );
                            }}
                        >
                            Hapus titik
                        </CkButton>
                    </CkDialogFooter>
                </CkDialogContent>
            </CkDialog>
        </div>
    );
}

export function PetaKoordinat({
    paketId,
    alamat,
    titik,
}: {
    paketId: number;
    alamat: string | null;
    titik: TitikKoordinat[];
}) {
    const { auth } = usePage().props;
    const canInput = auth.user.can_input;

    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerLayerRef = useRef<L.LayerGroup | null>(null);
    const pratinjauRef = useRef<L.Marker | null>(null);

    // Formulir titik baru hidup langsung di bawah peta, bukan di dalam modal:
    // penandanya harus tetap terlihat & bisa digeser sambil label diisi.
    const [formOpen, setFormOpen] = useState(false);
    const [label, setLabel] = useState('');
    const [keterangan, setKeterangan] = useState('');
    const [koordinat, setKoordinat] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const posisi = bacaKoordinat(koordinat);

    // Dipecah jadi angka biasa supaya effect penanda pratinjau bergantung pada
    // nilai, bukan pada objek baru yang lahir tiap render.
    const posLat = posisi?.lat ?? null;
    const posLng = posisi?.lng ?? null;

    // Hanya keluhkan formatnya setelah ada yang diketik — kotak kosong itu
    // keadaan awal yang normal, bukan kesalahan.
    const formatBelumDikenali = koordinat.trim() !== '' && posisi === null;

    function tutupForm() {
        setFormOpen(false);
        setLabel('');
        setKeterangan('');
        setKoordinat('');
        setErrors({});
    }

    // Inisialisasi peta sekali seumur komponen. Leaflet memegang DOM-nya
    // sendiri, jadi tidak boleh ikut dirender ulang React.
    useEffect(() => {
        if (!containerRef.current || mapRef.current) {
            return;
        }

        const map = L.map(containerRef.current, {
            center: PUSAT_HST,
            zoom: ZOOM_AWAL,

            // Zoom pakai roda mouse langsung saat kursor di atas peta —
            // memencet tombol +/− untuk mencari satu bangunan terlalu lambat.
            // Konsekuensinya scroll halaman ikut tertahan selama kursor berada
            // di peta; itu perilaku yang sudah lazim di peta sematan, dan
            // halaman masih bisa digulir lewat area di kiri/kanan peta.
            scrollWheelZoom: true,
        });

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; kontributor OpenStreetMap',
        }).addTo(map);

        markerLayerRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
            markerLayerRef.current = null;
            pratinjauRef.current = null;
        };
    }, []);

    // Klik peta memilih posisi. Handler dipasang di effect terpisah karena
    // bergantung pada hak akses, sementara peta itu sendiri hanya dibuat sekali.
    useEffect(() => {
        const map = mapRef.current;

        if (!map || !canInput) {
            return;
        }

        function onClick(e: L.LeafletMouseEvent) {
            setKoordinat(formatIsian(e.latlng.lat, e.latlng.lng));
            setFormOpen(true);
        }

        map.on('click', onClick);

        return () => {
            map.off('click', onClick);
        };
    }, [canInput]);

    // Sinkronkan penanda titik tersimpan tiap kali daftarnya berubah.
    useEffect(() => {
        const map = mapRef.current;
        const layer = markerLayerRef.current;

        if (!map || !layer) {
            return;
        }

        layer.clearLayers();

        titik.forEach((t) => {
            L.marker([t.latitude, t.longitude], { icon: penandaTersimpan })
                .bindPopup(
                    `<strong>${t.label}</strong><br>${formatPosisi(t.latitude, t.longitude)}`,
                )
                .addTo(layer);
        });
    }, [titik]);

    // Bingkai peta ke seluruh titik hanya saat daftarnya berubah — sengaja
    // tidak ikut posisi pratinjau, supaya peta tidak melompat sendiri sewaktu
    // penanda digeser atau lat/long diketik manual.
    useEffect(() => {
        const map = mapRef.current;

        if (!map || titik.length === 0) {
            return;
        }

        map.fitBounds(
            L.latLngBounds(titik.map((t) => [t.latitude, t.longitude])),
            { padding: [40, 40], maxZoom: 17 },
        );
    }, [titik]);

    // Penanda pratinjau: muncul begitu posisi dipilih, bisa digeser untuk
    // menghaluskan letaknya, dan hilang saat form ditutup.
    useEffect(() => {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        if (!formOpen || posLat === null || posLng === null) {
            pratinjauRef.current?.remove();
            pratinjauRef.current = null;

            return;
        }

        if (!pratinjauRef.current) {
            const marker = L.marker([posLat, posLng], {
                icon: penandaPratinjau,
                draggable: true,
                zIndexOffset: 1000,
            }).addTo(map);

            marker.on('dragend', () => {
                const p = marker.getLatLng();
                setKoordinat(formatIsian(p.lat, p.lng));
            });

            pratinjauRef.current = marker;

            return;
        }

        pratinjauRef.current.setLatLng([posLat, posLng]);
    }, [formOpen, posLat, posLng]);

    function simpan() {
        if (!posisi) {
            return;
        }

        setSubmitting(true);
        setErrors({});

        // Backend tetap menerima lintang & bujur terpisah; penggabungan murni
        // urusan tampilan, jadi aturan validasinya tak perlu ikut berubah.
        router.post(
            paketRoutes.koordinat.store(paketId).url,
            {
                label,
                latitude: posisi.lat,
                longitude: posisi.lng,
                keterangan: keterangan || null,
            },
            {
                preserveScroll: true,
                onSuccess: tutupForm,
                onError: (e) => setErrors(e as Record<string, string>),
                onFinish: () => setSubmitting(false),
            },
        );
    }

    function sorot(t: TitikKoordinat) {
        mapRef.current?.setView([t.latitude, t.longitude], 18);
    }

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    margin: '0 6px 8px',
                }}
            >
                <CkSectionLabel style={{ margin: 0 }}>
                    Lokasi & titik koordinat
                </CkSectionLabel>
                {canInput && !formOpen && (
                    <button
                        type="button"
                        onClick={() => setFormOpen(true)}
                        className="ck-link-accent"
                        style={{
                            fontSize: 12.5,
                            fontWeight: 560,
                            color: ckColors.accent,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                        }}
                    >
                        + Tandai titik
                    </button>
                )}
            </div>

            <CkCard>
                <div
                    style={{
                        padding: '13px 18px',
                        fontSize: 14,
                        color: alamat ? ckColors.text : ckColors.textMuted,
                    }}
                >
                    {alamat ?? 'Alamat gedung belum diisi.'}
                </div>

                {canInput && (
                    <KotakCari
                        onPilih={(h) =>
                            mapRef.current?.flyTo(
                                [h.lat, h.lng],
                                ZOOM_HASIL_CARI,
                            )
                        }
                    />
                )}

                <div
                    ref={containerRef}
                    style={{ height: 360, width: '100%', zIndex: 0 }}
                />

                {canInput && !formOpen && (
                    <div
                        style={{
                            padding: '10px 18px',
                            fontSize: 12.5,
                            color: ckColors.textMuted,
                            borderTop: `1px solid ${ckColors.border}`,
                        }}
                    >
                        Klik di peta untuk memilih titik, atau cari lokasinya
                        dulu di kotak pencarian.
                    </div>
                )}

                {canInput && formOpen && (
                    <div
                        style={{
                            padding: '15px 18px 17px',
                            borderTop: `1px solid ${ckColors.border}`,
                            background: 'rgba(0,102,179,.035)',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 13,
                                fontWeight: 570,
                                color: ckColors.text,
                                marginBottom: 3,
                            }}
                        >
                            Titik baru
                        </div>
                        <div
                            style={{
                                fontSize: 12.5,
                                color: ckColors.textMuted,
                                marginBottom: 12,
                            }}
                        >
                            {posisi
                                ? 'Geser penanda oranye di peta untuk menghaluskan letaknya, atau ubah angkanya langsung.'
                                : 'Klik di peta untuk memilih posisi, atau tempel koordinatnya bila sudah dicatat dari GPS maupun Google Maps.'}
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                            }}
                        >
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns:
                                        'minmax(0,1fr) minmax(0,1.2fr)',
                                    gap: 12,
                                }}
                            >
                                <CkField
                                    label="Label titik"
                                    error={errors.label}
                                >
                                    <CkInput
                                        value={label}
                                        onChange={(e) =>
                                            setLabel(e.target.value)
                                        }
                                        placeholder="Mis. Gedung utama"
                                    />
                                </CkField>

                                <CkField
                                    label="Koordinat (lintang, bujur)"
                                    error={
                                        formatBelumDikenali
                                            ? 'Format belum dikenali. Contoh: -2.5836421, 115.3814752'
                                            : (errors.latitude ??
                                              errors.longitude)
                                    }
                                    hint="Bisa ditempel apa adanya dari Google Maps — koordinat, notasi derajat, atau tautan petanya."
                                >
                                    <CkInput
                                        value={koordinat}
                                        onChange={(e) =>
                                            setKoordinat(e.target.value)
                                        }
                                        placeholder="-2.5836421, 115.3814752"
                                        style={{
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    />
                                </CkField>
                            </div>

                            <CkField
                                label="Keterangan (opsional)"
                                error={errors.keterangan}
                            >
                                <CkTextarea
                                    value={keterangan}
                                    onChange={(e) =>
                                        setKeterangan(e.target.value)
                                    }
                                    rows={2}
                                    placeholder="Mis. Titik diambil di depan pintu masuk."
                                />
                            </CkField>

                            <div style={{ display: 'flex', gap: 9 }}>
                                <CkButton
                                    onClick={simpan}
                                    disabled={submitting || !posisi}
                                >
                                    {submitting ? 'Menyimpan…' : 'Simpan titik'}
                                </CkButton>
                                <CkButton variant="ghost" onClick={tutupForm}>
                                    Batal
                                </CkButton>
                            </div>
                        </div>
                    </div>
                )}

                {titik.length === 0 ? (
                    <div
                        style={{
                            padding: '20px 18px',
                            fontSize: 14,
                            color: ckColors.textMuted,
                            textAlign: 'center',
                            borderTop: `1px solid ${ckColors.border}`,
                        }}
                    >
                        Belum ada titik koordinat yang ditandai.
                    </div>
                ) : (
                    titik.map((t) => (
                        <TitikRow
                            key={t.id}
                            titik={t}
                            canInput={canInput}
                            onSorot={sorot}
                        />
                    ))
                )}
            </CkCard>
        </div>
    );
}
