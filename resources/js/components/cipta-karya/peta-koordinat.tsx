import { router, usePage } from '@inertiajs/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import koordinatRoutes from '@/routes/koordinat';
import paketRoutes from '@/routes/paket';
import type { TitikKoordinat } from '@/types';
import { CkCard, CkSectionLabel } from './primitives';
import { ckColors } from './tokens';

/**
 * Pusat peta saat sebuah paket belum punya titik sama sekali: alun-alun
 * Barabai, ibu kota Kabupaten Hulu Sungai Tengah. Zoom 13 kira-kira memuat
 * seluruh kota, cukup untuk menggeser ke lokasi gedung tanpa tersesat.
 */
const PUSAT_HST: [number, number] = [-2.5836, 115.3815];
const ZOOM_AWAL = 13;

/**
 * Penanda dibuat dari SVG inline lewat divIcon, bukan ikon PNG bawaan Leaflet:
 * ikon bawaan dirujuk secara relatif dari CSS-nya sendiri sehingga rusak begitu
 * di-bundle Vite, dan cara ini sekalian membuat warnanya ikut token aksen.
 */
const penanda = L.divIcon({
    className: '',
    html: `<svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 31C12 31 22 19.5 22 12A10 10 0 1 0 2 12c0 7.5 10 19 10 19Z"
              fill="${ckColors.accent}" stroke="#fff" stroke-width="2"/>
        <circle cx="12" cy="12" r="3.5" fill="#fff"/>
    </svg>`,
    iconSize: [24, 32],
    iconAnchor: [12, 32],
});

function formatPosisi(lat: number, lng: number): string {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Isi dialog "tandai titik". Sengaja komponen tersendiri: Radix melepas isi
 * dialog saat ditutup, jadi state form otomatis tersetel ulang dari posisi klik
 * terbaru setiap kali dibuka — tanpa perlu effect penyetel ulang.
 *
 * Saat dibuka lewat tombol (tanpa klik peta), lat/long dikosongkan supaya bisa
 * diisi manual — jalur cadangan bila koordinat sudah dicatat di lapangan lewat
 * GPS ponsel.
 */
function FormTandaiTitik({
    paketId,
    onSelesai,
    posisiAwal,
}: {
    paketId: number;
    onSelesai: () => void;
    posisiAwal: { lat: number; lng: number } | null;
}) {
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [label, setLabel] = useState('');
    const [latitude, setLatitude] = useState(
        posisiAwal ? posisiAwal.lat.toFixed(7) : '',
    );
    const [longitude, setLongitude] = useState(
        posisiAwal ? posisiAwal.lng.toFixed(7) : '',
    );
    const [keterangan, setKeterangan] = useState('');

    function submit() {
        setSubmitting(true);
        setErrors({});

        router.post(
            paketRoutes.koordinat.store(paketId).url,
            {
                label,
                latitude,
                longitude,
                keterangan: keterangan || null,
            },
            {
                preserveScroll: true,
                onSuccess: onSelesai,
                onError: (e) => setErrors(e as Record<string, string>),
                onFinish: () => setSubmitting(false),
            },
        );
    }

    const inputClass =
        'mt-1 block w-full rounded-md border px-2 py-1.5 text-sm';

    return (
        <>
            <DialogTitle>Tandai titik koordinat</DialogTitle>
            <DialogDescription>
                Klik peta untuk mengambil posisi, atau isi lintang & bujur
                langsung bila koordinatnya sudah dicatat di lapangan.
            </DialogDescription>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label style={{ fontSize: 13, color: ckColors.textMuted }}>
                    Label titik
                    <input
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className={inputClass}
                        placeholder="Mis. Gedung utama"
                    />
                    {errors.label && (
                        <span style={{ color: ckColors.danger, fontSize: 12 }}>
                            {errors.label}
                        </span>
                    )}
                </label>

                <div style={{ display: 'flex', gap: 10 }}>
                    <label
                        style={{
                            fontSize: 13,
                            color: ckColors.textMuted,
                            flex: 1,
                        }}
                    >
                        Lintang (latitude)
                        <input
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            inputMode="decimal"
                            className={inputClass}
                            placeholder="-2.5836421"
                        />
                        {errors.latitude && (
                            <span
                                style={{
                                    color: ckColors.danger,
                                    fontSize: 12,
                                }}
                            >
                                {errors.latitude}
                            </span>
                        )}
                    </label>

                    <label
                        style={{
                            fontSize: 13,
                            color: ckColors.textMuted,
                            flex: 1,
                        }}
                    >
                        Bujur (longitude)
                        <input
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            inputMode="decimal"
                            className={inputClass}
                            placeholder="115.3814752"
                        />
                        {errors.longitude && (
                            <span
                                style={{
                                    color: ckColors.danger,
                                    fontSize: 12,
                                }}
                            >
                                {errors.longitude}
                            </span>
                        )}
                    </label>
                </div>

                <label style={{ fontSize: 13, color: ckColors.textMuted }}>
                    Keterangan (opsional)
                    <Textarea
                        value={keterangan}
                        onChange={(e) => setKeterangan(e.target.value)}
                        rows={2}
                        className="mt-1"
                        placeholder="Mis. Titik diambil di depan pintu masuk."
                    />
                </label>
            </div>

            <DialogFooter className="gap-2">
                <DialogClose asChild>
                    <button
                        type="button"
                        className="rounded-md border px-3 py-1.5 text-sm"
                    >
                        Batal
                    </button>
                </DialogClose>
                <button
                    type="button"
                    disabled={submitting}
                    onClick={submit}
                    className="rounded-md px-3 py-1.5 text-sm text-white disabled:opacity-60"
                    style={{ background: ckColors.accent }}
                >
                    {submitting ? 'Menyimpan…' : 'Simpan'}
                </button>
            </DialogFooter>
        </>
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

            <Dialog open={hapusOpen} onOpenChange={setHapusOpen}>
                <DialogContent>
                    <DialogTitle>Hapus titik ini?</DialogTitle>
                    <DialogDescription>
                        Titik “{titik.label}” akan dihapus dari peta paket ini.
                    </DialogDescription>

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <button
                                type="button"
                                className="rounded-md border px-3 py-1.5 text-sm"
                            >
                                Batal
                            </button>
                        </DialogClose>
                        <button
                            type="button"
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
                            className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-60"
                        >
                            Hapus titik
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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

    const [tandaiOpen, setTandaiOpen] = useState(false);
    const [posisiKlik, setPosisiKlik] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    // Inisialisasi peta sekali seumur komponen. Leaflet memegang DOM-nya
    // sendiri, jadi tidak boleh ikut dirender ulang React.
    useEffect(() => {
        if (!containerRef.current || mapRef.current) {
            return;
        }

        const map = L.map(containerRef.current, {
            center: PUSAT_HST,
            zoom: ZOOM_AWAL,
            scrollWheelZoom: false, // supaya scroll halaman tidak tersandera peta
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
        };
    }, []);

    // Klik peta membuka dialog dengan lat/long terisi. Handler dipasang di
    // effect terpisah karena bergantung pada hak akses, sementara peta itu
    // sendiri hanya dibuat sekali.
    useEffect(() => {
        const map = mapRef.current;

        if (!map || !canInput) {
            return;
        }

        function onClick(e: L.LeafletMouseEvent) {
            setPosisiKlik({ lat: e.latlng.lat, lng: e.latlng.lng });
            setTandaiOpen(true);
        }

        map.on('click', onClick);

        return () => {
            map.off('click', onClick);
        };
    }, [canInput]);

    // Sinkronkan penanda tiap kali daftar titik berubah (tambah/hapus).
    useEffect(() => {
        const map = mapRef.current;
        const layer = markerLayerRef.current;

        if (!map || !layer) {
            return;
        }

        layer.clearLayers();

        titik.forEach((t) => {
            L.marker([t.latitude, t.longitude], { icon: penanda })
                .bindPopup(
                    `<strong>${t.label}</strong><br>${formatPosisi(t.latitude, t.longitude)}`,
                )
                .addTo(layer);
        });

        if (titik.length > 0) {
            map.fitBounds(
                L.latLngBounds(titik.map((t) => [t.latitude, t.longitude])),
                { padding: [40, 40], maxZoom: 17 },
            );
        }
    }, [titik]);

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
                {canInput && (
                    <button
                        type="button"
                        onClick={() => {
                            setPosisiKlik(null);
                            setTandaiOpen(true);
                        }}
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
                        borderBottom: `1px solid ${ckColors.border}`,
                        fontSize: 14,
                        color: alamat ? ckColors.text : ckColors.textMuted,
                    }}
                >
                    {alamat ?? 'Alamat gedung belum diisi.'}
                </div>

                <div
                    ref={containerRef}
                    style={{ height: 340, width: '100%', zIndex: 0 }}
                />

                {canInput && (
                    <div
                        style={{
                            padding: '10px 18px',
                            fontSize: 12.5,
                            color: ckColors.textMuted,
                            borderTop: `1px solid ${ckColors.border}`,
                        }}
                    >
                        Klik di peta untuk menandai titik baru.
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

            <Dialog open={tandaiOpen} onOpenChange={setTandaiOpen}>
                <DialogContent>
                    <FormTandaiTitik
                        paketId={paketId}
                        posisiAwal={posisiKlik}
                        onSelesai={() => setTandaiOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
