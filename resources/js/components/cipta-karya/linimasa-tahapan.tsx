import type { Paket } from '@/types';
import { CkCard } from './primitives';
import { ckColors } from './tokens';

/** Tanggal ringkas untuk di bawah titik linimasa, mis. "04 Mar". */
export function formatShortDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
    }).format(new Date(value));
}

export type StepState = 'done' | 'current' | 'pending';

export type Tahapan = {
    key: string;
    label: string;
    date: string | null;
    state: StepState;
};

/**
 * Linimasa tahapan kontrak (Kontrak → SPMK → MC-0 → PHO → FHO). Tahap
 * "berjalan" adalah tahap pertama yang tanggalnya belum lewat atau belum
 * diisi; bila semuanya sudah lewat, tidak ada yang berstatus current. FHO
 * belum punya kolom tanggal sendiri, jadi selalu pending.
 *
 * Diekspor karena kartu "Tahap berjalan" di tab Ringkasan membaca tahap yang
 * sama — dua tampilan atas satu perhitungan, bukan dua perhitungan yang
 * kebetulan mirip.
 */
export function tahapanPaket(paket: Paket): Tahapan[] {
    const now = new Date();
    const milestones: Omit<Tahapan, 'state'>[] = [
        { key: 'kontrak', label: 'Kontrak', date: paket.tanggal_kontrak },
        { key: 'spmk', label: 'SPMK', date: paket.tanggal_spmk },
        { key: 'mc0', label: 'MC-0', date: paket.tanggal_mc0 },
        { key: 'pho', label: 'PHO', date: paket.tanggal_pho_rencana },
        { key: 'fho', label: 'FHO', date: null },
    ];

    let currentIndex = milestones.findIndex(
        (m) => !m.date || new Date(m.date) > now,
    );

    if (currentIndex === -1) {
        currentIndex = milestones.length; // semua sudah lewat
    }

    return milestones.map((m, i) => ({
        ...m,
        state:
            i < currentIndex
                ? 'done'
                : i === currentIndex
                  ? 'current'
                  : 'pending',
    }));
}

function TitikTahap({ tahap }: { tahap: Tahapan }) {
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
                        tahap.state === 'pending'
                            ? '#DCDAD4'
                            : tahap.state === 'current'
                              ? '#fff'
                              : ckColors.accent,
                    border:
                        tahap.state === 'current'
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
                        color: ckColors.text,
                    }}
                >
                    {tahap.label}
                </div>
                <div
                    style={{
                        fontSize: 11.5,
                        color: ckColors.textMuted3,
                        marginTop: 1,
                    }}
                >
                    {formatShortDate(tahap.date)}
                </div>
            </div>
        </div>
    );
}

export function LinimasaTahapan({ paket }: { paket: Paket }) {
    const tahapan = tahapanPaket(paket);

    return (
        <CkCard padded>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 6,
                    flexWrap: 'wrap',
                }}
            >
                {tahapan.map((tahap, i) => (
                    <div
                        key={tahap.key}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            flex: 1,
                            minWidth: 120,
                        }}
                    >
                        <TitikTahap tahap={tahap} />

                        {i < tahapan.length - 1 && (
                            // Garis ditarik ke atas agar sejajar titik, bukan
                            // dengan tengah kolom yang ikut tinggi labelnya.
                            <div
                                style={{
                                    flex: 1,
                                    height: 2,
                                    marginTop: -24,
                                    background: '#DCDAD4',
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </CkCard>
    );
}
