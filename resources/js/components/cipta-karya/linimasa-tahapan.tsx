import { Fragment } from 'react';
import type { Paket } from '@/types';
import { CkCard } from './primitives';
import { ckColors } from './tokens';

/** Tanggal ringkas untuk di bawah titik linimasa, mis. "04 Mar". */
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

/**
 * Linimasa tahapan kontrak (Kontrak → SPMK → MC-0 → PHO → FHO) di halaman
 * detail paket. Tahap "berjalan" adalah tahap pertama yang tanggalnya belum
 * lewat atau belum diisi; bila semuanya sudah lewat, tidak ada yang berstatus
 * current. FHO belum punya kolom tanggal sendiri, jadi selalu pending.
 */
export function LinimasaTahapan({ paket }: { paket: Paket }) {
    const now = new Date();
    const milestones: { key: string; label: string; date: string | null }[] = [
        { key: 'kontrak', label: 'Kontrak', date: paket.tanggal_kontrak },
        { key: 'spmk', label: 'SPMK', date: paket.tanggal_spmk },
        { key: 'mc0', label: 'MC-0', date: paket.tanggal_mc0 },
        { key: 'pho', label: 'PHO', date: paket.tanggal_pho_rencana },
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

    return (
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
                            dateLabel={formatShortDate(m.date)}
                            state={stepStates[i]}
                        />
                        <TimelineConnector state={stepStates[i]} />
                    </Fragment>
                ))}
                <TimelineStep label="FHO" dateLabel="—" state="pending" />
            </div>
        </CkCard>
    );
}
