import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PaketController from '@/actions/App/Http/Controllers/PaketController';
import { ChecklistItemRow } from '@/components/cipta-karya/checklist-item';
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
import { InformasiPaket } from '@/components/cipta-karya/informasi-paket';
import { LinimasaTahapan } from '@/components/cipta-karya/linimasa-tahapan';
import { PetaKoordinat } from '@/components/cipta-karya/peta-koordinat';
import { CkCard, CkSectionLabel } from '@/components/cipta-karya/primitives';
import { ProgresRiwayat } from '@/components/cipta-karya/progres-riwayat';
import { SCurveChart } from '@/components/cipta-karya/s-curve-chart';
import { CiptaKaryaSidebar } from '@/components/cipta-karya/sidebar';
import { ckColors, ckFont } from '@/components/cipta-karya/tokens';
import { dashboard } from '@/routes';
import paket, { edit, index } from '@/routes/paket';
import type {
    ChecklistSection,
    Paket,
    ProgresAgregat,
    ProgresEntry,
    TitikKoordinat,
} from '@/types';

type PaketShowProps = {
    paket: Paket;
    statusLabel: string;
    kelengkapanPersen: number;
    dokumenWajibBelum: string[];
    rencanaProgres: number | null;
    sections: ChecklistSection[];
    riwayatProgres: ProgresEntry[];
    masaPelaksanaan: string | null;
    progresAgregat: ProgresAgregat;
    titikKoordinat: TitikKoordinat[];
};

export default function PaketShow({
    paket: data,
    statusLabel,
    kelengkapanPersen,
    dokumenWajibBelum,
    sections,
    riwayatProgres,
    masaPelaksanaan,
    progresAgregat,
    titikKoordinat,
}: PaketShowProps) {
    const { auth } = usePage().props;
    const [pendingDoc, setPendingDoc] = useState<number | null>(null);

    /**
     * Kembalikan satu item checklist ke "belum". Tidak ada arah sebaliknya di
     * sini: status "ada" hanya lahir dari unggahan berkas.
     */
    function batalkanTanda(checklistDokumenId: number) {
        if (!auth.user.can_input) {
            return;
        }

        setPendingDoc(checklistDokumenId);
        router.patch(
            paket.dokumen.update({
                paket: data.id,
                checklistDokumen: checklistDokumenId,
            }).url,
            {},
            {
                preserveScroll: true,
                onFinish: () => setPendingDoc(null),
            },
        );
    }

    return (
        <>
            <Head title={data.nama} />

            <div
                style={{
                    display: 'flex',
                    height: '100vh',
                    width: '100%',
                    background: ckColors.bg,
                    color: ckColors.text,
                    overflow: 'hidden',
                    fontFamily: ckFont,
                    WebkitFontSmoothing: 'antialiased',
                }}
            >
                <CiptaKaryaSidebar active="paket" />

                <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
                    <div
                        style={{
                            maxWidth: 1180,
                            margin: '0 auto',
                            padding: '40px 48px 72px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 16,
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
                                    fontSize: 15,
                                    fontWeight: 510,
                                    letterSpacing: '-.01em',
                                }}
                            >
                                <svg
                                    width="9"
                                    height="15"
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

                            {(auth.user.can_input || auth.user.is_admin) && (
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 14,
                                        fontSize: 13.5,
                                    }}
                                >
                                    {auth.user.can_input && (
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
                                    )}

                                    {auth.user.is_admin && (
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
                                                    Paket {data.kode_paket} akan
                                                    dihapus permanen dan tidak
                                                    dapat dikembalikan.
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
                                    )}
                                </div>
                            )}
                        </div>

                        <header style={{ marginTop: 14 }}>
                            <div
                                style={{
                                    fontSize: 13,
                                    fontWeight: 520,
                                    color: ckColors.textMuted,
                                    letterSpacing: '.01em',
                                }}
                            >
                                {statusLabel} · TA {data.tahun_anggaran}
                            </div>
                            <h1
                                style={{
                                    fontSize: 'clamp(24px,2.4vw,30px)',
                                    fontWeight: 660,
                                    letterSpacing: '-.025em',
                                    color: ckColors.text,
                                    marginTop: 3,
                                    maxWidth: '22ch',
                                    lineHeight: 1.15,
                                }}
                            >
                                {data.nama}
                            </h1>
                            <div
                                style={{
                                    fontSize: 14,
                                    color: ckColors.textMuted,
                                    marginTop: 6,
                                }}
                            >
                                {data.kode_paket} · {data.lokasi ?? '—'}
                            </div>
                        </header>

                        <section style={{ marginTop: 26, maxWidth: '34ch' }}>
                            <div
                                style={{
                                    fontSize: 13,
                                    color: ckColors.textMuted,
                                    fontWeight: 510,
                                }}
                            >
                                Kelengkapan dokumen
                            </div>
                            <div
                                style={{
                                    fontSize: 'clamp(36px,3.6vw,46px)',
                                    fontWeight: 600,
                                    letterSpacing: '-.025em',
                                    color: ckColors.text,
                                    marginTop: 2,
                                    fontVariantNumeric: 'tabular-nums',
                                }}
                            >
                                {kelengkapanPersen}%
                            </div>
                            <div
                                style={{
                                    fontSize: 16,
                                    color: ckColors.textMuted,
                                    marginTop: 8,
                                    letterSpacing: '-.01em',
                                }}
                            >
                                {dokumenWajibBelum.length > 0 ? (
                                    <>
                                        {dokumenWajibBelum.length} dokumen wajib
                                        belum diunggah —{' '}
                                        <span
                                            style={{
                                                color: ckColors.danger,
                                                fontWeight: 540,
                                            }}
                                        >
                                            {dokumenWajibBelum.join(', ')}
                                        </span>
                                        .
                                    </>
                                ) : (
                                    'Semua dokumen wajib sudah lengkap.'
                                )}
                            </div>
                        </section>

                        <section style={{ marginTop: 26 }}>
                            <LinimasaTahapan paket={data} />
                        </section>

                        <section
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'minmax(0,1fr) minmax(0,1.3fr)',
                                gap: 26,
                                marginTop: 30,
                                alignItems: 'start',
                            }}
                        >
                            <div>
                                <InformasiPaket
                                    paket={data}
                                    masaPelaksanaan={masaPelaksanaan}
                                />

                                <CkSectionLabel
                                    style={{ margin: '26px 0 8px 6px' }}
                                >
                                    Kurva-S paket
                                </CkSectionLabel>
                                <CkCard padded>
                                    <SCurveChart
                                        points={progresAgregat.points}
                                    />
                                    <div
                                        style={{
                                            fontSize: 13,
                                            color: ckColors.textMuted,
                                            marginTop: 10,
                                        }}
                                    >
                                        Realisasi {progresAgregat.realisasi}%
                                        {progresAgregat.rencana !== null && (
                                            <>
                                                {' '}
                                                terhadap rencana{' '}
                                                {progresAgregat.rencana}%
                                            </>
                                        )}
                                    </div>
                                </CkCard>
                            </div>

                            <div>
                                <CkSectionLabel
                                    style={{ margin: '0 0 2px 6px' }}
                                >
                                    Checklist dokumen per tahap
                                </CkSectionLabel>
                                {sections.map((sec) => (
                                    <div
                                        key={sec.tahap}
                                        style={{ marginTop: 20 }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'baseline',
                                                justifyContent: 'space-between',
                                                margin: '0 6px 8px',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: 610,
                                                    letterSpacing: '-.01em',
                                                    color: ckColors.text,
                                                }}
                                            >
                                                {sec.tahap}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    color: ckColors.textMuted4,
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {sec.done}/{sec.total}
                                            </div>
                                        </div>
                                        <CkCard>
                                            {sec.docs.map((item, i) => (
                                                <ChecklistItemRow
                                                    key={item.id}
                                                    paketId={data.id}
                                                    item={item}
                                                    first={i === 0}
                                                    canInput={
                                                        auth.user.can_input
                                                    }
                                                    canVerify={
                                                        auth.user.can_verify
                                                    }
                                                    pending={
                                                        pendingDoc === item.id
                                                    }
                                                    onBatalkanTanda={
                                                        batalkanTanda
                                                    }
                                                />
                                            ))}
                                        </CkCard>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section style={{ marginTop: 32 }}>
                            <PetaKoordinat
                                paketId={data.id}
                                alamat={data.alamat}
                                titik={titikKoordinat}
                            />
                        </section>

                        <section style={{ marginTop: 32 }}>
                            <ProgresRiwayat
                                paketId={data.id}
                                entries={riwayatProgres}
                            />
                        </section>

                        <div style={{ marginTop: 30 }}>
                            <Link
                                href={index()}
                                className="ck-link-accent"
                                style={{
                                    fontSize: 14,
                                    color: ckColors.textMuted,
                                }}
                            >
                                ← Kembali ke Data Paket
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
