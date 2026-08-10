import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import PaketController from '@/actions/App/Http/Controllers/PaketController';
import '@/components/cipta-karya/cipta-karya.css';
import {
    CkButton,
    CkDialog,
    CkDialogClose,
    CkDialogContent,
    CkDialogDescription,
    CkDialogFooter,
    CkDialogTitle,
    CkDialogTrigger,
} from '@/components/cipta-karya/ck-dialog';
import { DokumenPanel } from '@/components/cipta-karya/dokumen-panel';
import { perluTindakan } from '@/components/cipta-karya/dokumen-status';
import { PaketBangunan } from '@/components/cipta-karya/paket-bangunan';
import { PaketDokumen } from '@/components/cipta-karya/paket-dokumen';
import { PaketRingkasan } from '@/components/cipta-karya/paket-ringkasan';
import { CiptaKaryaShell } from '@/components/cipta-karya/shell';
import { ckColors } from '@/components/cipta-karya/tokens';
import { UnggahBerkasDialog } from '@/components/cipta-karya/unggah-berkas';
import { dashboard } from '@/routes';
import { edit } from '@/routes/paket';
import type {
    ChecklistSection,
    DokumenChecklistItem,
    Kelengkapan,
    MasaPelaksanaan,
    Paket,
    ProgresAgregat,
    ProgresEntry,
    TitikKoordinat,
} from '@/types';

type Tab = 'ringkasan' | 'dokumen' | 'bangunan';

const TABS: Tab[] = ['ringkasan', 'dokumen', 'bangunan'];

const LABEL_TAB: Record<Tab, string> = {
    ringkasan: 'Ringkasan',
    dokumen: 'Dokumen',
    bangunan: 'Bangunan',
};

/**
 * Tab yang sedang terbuka disimpan di query string, bukan hanya di state.
 * Alasannya dua: kunjungan Inertia setelah unggah/verifikasi bisa memasang
 * ulang komponen halaman (state hilang, tab melompat balik ke Ringkasan), dan
 * tautan ke tab tertentu jadi bisa dibagikan apa adanya.
 */
function tabDariUrl(): Tab {
    if (typeof window === 'undefined') {
        return 'ringkasan';
    }

    const nilai = new URLSearchParams(window.location.search).get('tab');

    return TABS.includes(nilai as Tab) ? (nilai as Tab) : 'ringkasan';
}

type PaketShowProps = {
    paket: Paket;
    statusLabel: string;
    kelengkapan: Kelengkapan;
    sections: ChecklistSection[];
    riwayatProgres: ProgresEntry[];
    masaPelaksanaan: MasaPelaksanaan | null;
    progresAgregat: ProgresAgregat;
    titikKoordinat: TitikKoordinat[];
};

export default function PaketShow({
    paket: data,
    statusLabel,
    kelengkapan,
    sections,
    riwayatProgres,
    masaPelaksanaan,
    progresAgregat,
    titikKoordinat,
}: PaketShowProps) {
    const [tab, setTab] = useState<Tab>(tabDariUrl);

    // Panel dokumen & modal unggah memegang id, bukan objek item: props halaman
    // datang baru setiap kunjungan Inertia, dan menyimpan objek lama akan
    // menampilkan status pra-unggah setelah berkasnya berganti.
    const [panelId, setPanelId] = useState<number | null>(null);
    const [unggahId, setUnggahId] = useState<number | null>(null);
    const [unggahOpen, setUnggahOpen] = useState(false);

    const semuaDokumen = sections.flatMap((s) => s.docs);
    const panelItem = semuaDokumen.find((d) => d.id === panelId) ?? null;
    const unggahItem = semuaDokumen.find((d) => d.id === unggahId) ?? null;
    const jumlahTindakan = semuaDokumen.filter(perluTindakan).length;

    const pindahTab = useCallback((tujuan: Tab) => {
        setTab(tujuan);

        const url = new URL(window.location.href);
        url.searchParams.set('tab', tujuan);
        window.history.replaceState(window.history.state, '', url);
    }, []);

    const bukaPanel = useCallback(
        (item: DokumenChecklistItem) => {
            pindahTab('dokumen');
            setPanelId(item.id);
        },
        [pindahTab],
    );

    const bukaUnggah = useCallback(
        (item: DokumenChecklistItem | null) => {
            pindahTab('dokumen');
            setPanelId(null);
            setUnggahId(item?.id ?? null);
            setUnggahOpen(true);
        },
        [pindahTab],
    );

    return (
        <>
            <Head title={data.nama} />

            {/* Topbar menandai "Ringkasan" sebagai aktif, bukan "Paket":
                grid kartu di Ringkasan-lah jalan masuk utama ke halaman ini,
                dan tautan kembali di bawah menunjuk ke sana juga. */}
            <CiptaKaryaShell
                active="ringkasan"
                mainStyle={{ position: 'relative' }}
            >
                <div
                    style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 20,
                        background: 'rgba(255,255,255,.92)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        borderBottom: `1px solid ${ckColors.border}`,
                    }}
                >
                    <div
                        style={{
                            maxWidth: 1240,
                            margin: '0 auto',
                            padding: '12px 36px 0',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 14,
                                flexWrap: 'wrap',
                            }}
                        >
                            <Link
                                href={dashboard()}
                                className="ck-link-accent"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    color: ckColors.accent,
                                    fontSize: 13.5,
                                    fontWeight: 520,
                                    flex: 'none',
                                }}
                            >
                                <svg
                                    width="8"
                                    height="13"
                                    viewBox="0 0 9 15"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.9"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M8 1L1.5 7.5 8 14" />
                                </svg>
                                Ringkasan
                            </Link>

                            <div
                                style={{
                                    minWidth: 0,
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: 10,
                                    flexWrap: 'wrap',
                                }}
                            >
                                <h1
                                    style={{
                                        fontSize: 16,
                                        fontWeight: 640,
                                        letterSpacing: '-.02em',
                                        color: ckColors.text,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '100%',
                                        margin: 0,
                                    }}
                                >
                                    {data.nama}
                                </h1>
                                <div
                                    style={{
                                        fontSize: 13,
                                        color: ckColors.textMuted,
                                        fontVariantNumeric: 'tabular-nums',
                                        flex: 'none',
                                    }}
                                >
                                    {data.kode_paket}
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    gap: 14,
                                    fontSize: 13,
                                    flex: 'none',
                                }}
                            >
                                <Link
                                    href={edit(data.id)}
                                    className="ck-link-accent"
                                    style={{
                                        color: ckColors.accent,
                                        fontWeight: 520,
                                    }}
                                >
                                    Ubah
                                </Link>

                                <CkDialog>
                                    <CkDialogTrigger asChild>
                                        <button
                                            type="button"
                                            style={{
                                                color: ckColors.danger,
                                                fontWeight: 520,
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                font: 'inherit',
                                                padding: 0,
                                            }}
                                        >
                                            Hapus
                                        </button>
                                    </CkDialogTrigger>

                                    <CkDialogContent>
                                        <CkDialogTitle>
                                            Hapus paket ini?
                                        </CkDialogTitle>
                                        <CkDialogDescription>
                                            Paket {data.kode_paket} akan dihapus
                                            permanen dan tidak dapat
                                            dikembalikan.
                                        </CkDialogDescription>

                                        <CkDialogFooter>
                                            <CkDialogClose asChild>
                                                <CkButton variant="ghost">
                                                    Batal
                                                </CkButton>
                                            </CkDialogClose>

                                            <CkButton
                                                variant="danger"
                                                onClick={() =>
                                                    router.delete(
                                                        PaketController.destroy(
                                                            data.id,
                                                        ).url,
                                                    )
                                                }
                                            >
                                                Hapus Paket
                                            </CkButton>
                                        </CkDialogFooter>
                                    </CkDialogContent>
                                </CkDialog>
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                gap: 4,
                                marginTop: 10,
                                flexWrap: 'wrap',
                            }}
                        >
                            {TABS.map((key) => {
                                const aktif = tab === key;
                                const lencana =
                                    key === 'dokumen' && jumlahTindakan > 0;

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => pindahTab(key)}
                                        className={
                                            aktif ? undefined : 'ck-link-accent'
                                        }
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 7,
                                            padding: '9px 14px 11px',
                                            background: 'none',
                                            border: 'none',
                                            borderBottom: `2px solid ${aktif ? ckColors.accent : 'transparent'}`,
                                            font: 'inherit',
                                            fontSize: 14,
                                            fontWeight: aktif ? 600 : 520,
                                            letterSpacing: '-.01em',
                                            color: aktif
                                                ? ckColors.accent
                                                : '#5F5D57',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            marginBottom: -1,
                                        }}
                                    >
                                        {LABEL_TAB[key]}
                                        {lencana && (
                                            <span
                                                style={{
                                                    fontSize: 11.5,
                                                    fontWeight: 600,
                                                    padding: '1.5px 7px',
                                                    borderRadius: 999,
                                                    color: ckColors.danger,
                                                    background:
                                                        ckColors.dangerSoft,
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {jumlahTindakan}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        maxWidth: 1240,
                        margin: '0 auto',
                        padding: '26px 36px 60px',
                    }}
                >
                    {tab === 'ringkasan' && (
                        <PaketRingkasan
                            paket={data}
                            statusLabel={statusLabel}
                            kelengkapan={kelengkapan}
                            sections={sections}
                            riwayatProgres={riwayatProgres}
                            progresAgregat={progresAgregat}
                            masaPelaksanaan={masaPelaksanaan}
                            bukaDokumen={() => pindahTab('dokumen')}
                            bukaBangunan={() => pindahTab('bangunan')}
                            bukaItem={bukaPanel}
                        />
                    )}

                    {tab === 'dokumen' && (
                        <PaketDokumen
                            sections={sections}
                            onLihat={bukaPanel}
                            onUnggah={bukaUnggah}
                            onUnggahBaru={() => bukaUnggah(null)}
                        />
                    )}

                    {tab === 'bangunan' && (
                        <PaketBangunan
                            paket={data}
                            progresAgregat={progresAgregat}
                            riwayatProgres={riwayatProgres}
                            titikKoordinat={titikKoordinat}
                        />
                    )}
                </div>

                <DokumenPanel
                    item={panelItem}
                    onTutup={() => setPanelId(null)}
                    onGantiBerkas={bukaUnggah}
                />

                <UnggahBerkasDialog
                    paketId={data.id}
                    item={unggahItem}
                    pilihan={semuaDokumen}
                    open={unggahOpen}
                    onOpenChange={setUnggahOpen}
                />
            </CiptaKaryaShell>
        </>
    );
}
