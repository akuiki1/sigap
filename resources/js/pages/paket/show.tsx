import { Head, Link, router, usePage } from '@inertiajs/react';
import { Fragment, useState } from 'react';
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
import { PetaKoordinat } from '@/components/cipta-karya/peta-koordinat';
import { CkCard, CkSectionLabel } from '@/components/cipta-karya/primitives';
import { ProgresRiwayat } from '@/components/cipta-karya/progres-riwayat';
import { SCurveChart } from '@/components/cipta-karya/s-curve-chart';
import { CiptaKaryaSidebar } from '@/components/cipta-karya/sidebar';
import { ckColors, ckFont } from '@/components/cipta-karya/tokens';
import { formatCurrency } from '@/lib/utils';
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

function formatShortDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
    }).format(new Date(value));
}

type StepState = 'done' | 'current' | 'pending';

function TimelineStep({
    label,
    dateLabel,
    state,
}: {
    label: string;
    dateLabel: string;
    state: StepState;
}) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 9,
                flex: 'none',
                width: 72,
                textAlign: 'center',
            }}
        >
            <span
                style={{
                    width: 15,
                    height: 15,
                    borderRadius: '50%',
                    background:
                        state === 'pending'
                            ? '#DCDAD4'
                            : state === 'current'
                              ? '#fff'
                              : ckColors.accent,
                    border:
                        state === 'current'
                            ? `4px solid ${ckColors.accent}`
                            : undefined,
                    boxSizing: 'border-box',
                }}
            />
            <div style={{ lineHeight: 1.3 }}>
                <div
                    style={{
                        fontSize: 12.5,
                        fontWeight: 590,
                        color: state === 'pending' ? '#B4B2AC' : ckColors.text,
                    }}
                >
                    {label}
                </div>
                <div
                    style={{
                        fontSize: 11.5,
                        color: state === 'pending' ? '#B4B2AC' : '#9C9A94',
                        marginTop: 1,
                    }}
                >
                    {dateLabel}
                </div>
            </div>
        </div>
    );
}

function TimelineConnector({ state }: { state: StepState }) {
    return (
        <div
            style={{
                flex: 1,
                height: 2,
                marginTop: 6.5,
                background:
                    state === 'done'
                        ? ckColors.accent
                        : state === 'current'
                          ? `linear-gradient(90deg, ${ckColors.accent}, #DCDAD4)`
                          : '#DCDAD4',
            }}
        />
    );
}

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

    const now = new Date();
    const milestones: { key: string; label: string; date: string | null }[] = [
        { key: 'kontrak', label: 'Kontrak', date: data.tanggal_kontrak },
        { key: 'spmk', label: 'SPMK', date: data.tanggal_spmk },
        { key: 'mc0', label: 'MC-0', date: data.tanggal_mc0 },
        { key: 'pho', label: 'PHO', date: data.tanggal_pho_rencana },
    ];
    let currentIndex = milestones.findIndex(
        (m) => !m.date || new Date(m.date) > now,
    );

    if (currentIndex === -1) {
        currentIndex = milestones.length; // semua sudah lewat
    }

    const stepStates: StepState[] = milestones.map((_, i) =>
        i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'pending',
    );

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
                            <CkCard padded>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        justifyContent: 'space-between',
                                        gap: 6,
                                    }}
                                >
                                    {milestones.map((m, i) => (
                                        <Fragment key={m.key}>
                                            <TimelineStep
                                                label={m.label}
                                                dateLabel={formatShortDate(
                                                    m.date,
                                                )}
                                                state={stepStates[i]}
                                            />
                                            <TimelineConnector
                                                state={stepStates[i]}
                                            />
                                        </Fragment>
                                    ))}
                                    <TimelineStep
                                        label="FHO"
                                        dateLabel="—"
                                        state="pending"
                                    />
                                </div>
                            </CkCard>
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
                                <CkSectionLabel>Informasi paket</CkSectionLabel>
                                <CkCard>
                                    {[
                                        [
                                            'Sumber dana',
                                            data.sumber_dana ?? '—',
                                        ],
                                        [
                                            'Pagu',
                                            data.pagu !== null
                                                ? formatCurrency(data.pagu)
                                                : '—',
                                        ],
                                        [
                                            'Nilai kontrak',
                                            formatCurrency(data.nilai_kontrak),
                                        ],
                                        ['Penyedia', data.penyedia ?? '—'],
                                        [
                                            'Konsultan pengawas',
                                            data.konsultan_pengawas ?? '—',
                                        ],
                                        ['PPK', data.ppk ?? '—'],
                                        ['PPTK', data.pptk ?? '—'],
                                        ['No. kontrak', data.no_kontrak ?? '—'],
                                        [
                                            'Masa pelaksanaan',
                                            masaPelaksanaan ?? '—',
                                        ],
                                    ].map(([label, value], i) => (
                                        <div
                                            key={label}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 16,
                                                padding: '13px 18px',
                                                borderTop:
                                                    i === 0
                                                        ? undefined
                                                        : `1px solid ${ckColors.border}`,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 14,
                                                    color: ckColors.textMuted,
                                                    flex: 'none',
                                                }}
                                            >
                                                {label}
                                            </div>
                                            <div
                                                style={{
                                                    flex: 1,
                                                    minWidth: 0,
                                                    textAlign: 'right',
                                                    fontSize: 14,
                                                    fontWeight: 510,
                                                    color: ckColors.text,
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {value}
                                            </div>
                                        </div>
                                    ))}
                                </CkCard>

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
