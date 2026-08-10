import { useState } from 'react';
import type {
    Paket,
    ProgresAgregat,
    ProgresEntry,
    TitikKoordinat,
} from '@/types';
import { PetaKoordinat } from './peta-koordinat';
import { CkCard, CkSectionLabel } from './primitives';
import { ProgresRiwayat, TambahProgresDialog } from './progres-riwayat';
import { SCurveChart } from './s-curve-chart';
import { ckColors } from './tokens';

export function PaketBangunan({
    paket,
    progresAgregat,
    riwayatProgres,
    titikKoordinat,
}: {
    paket: Paket;
    progresAgregat: ProgresAgregat;
    riwayatProgres: ProgresEntry[];
    titikKoordinat: TitikKoordinat[];
}) {
    const [catatOpen, setCatatOpen] = useState(false);

    const deviasi = progresAgregat.deviasi;

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14,
                    flexWrap: 'wrap',
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: 20,
                            fontWeight: 640,
                            letterSpacing: '-.02em',
                            color: ckColors.text,
                        }}
                    >
                        Kondisi bangunan
                    </div>
                    <div
                        style={{
                            fontSize: 13.5,
                            color: ckColors.textMuted,
                            marginTop: 3,
                        }}
                    >
                        Progres fisik, dokumentasi lapangan, dan titik koordinat
                        gedung.
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setCatatOpen(true)}
                    style={{
                        font: 'inherit',
                        fontSize: 13,
                        fontWeight: 570,
                        color: '#fff',
                        background: ckColors.accent,
                        border: 'none',
                        borderRadius: 10,
                        padding: '9px 15px',
                        cursor: 'pointer',
                        flex: 'none',
                    }}
                >
                    Catat progres
                </button>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
                    gap: 20,
                    marginTop: 18,
                    alignItems: 'start',
                }}
            >
                <CkCard padded>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            justifyContent: 'space-between',
                            gap: 10,
                            flexWrap: 'wrap',
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: 13,
                                    color: ckColors.textMuted,
                                    fontWeight: 510,
                                }}
                            >
                                Realisasi fisik
                            </div>
                            <div
                                style={{
                                    fontSize: 34,
                                    fontWeight: 600,
                                    letterSpacing: '-.025em',
                                    color: ckColors.text,
                                    fontVariantNumeric: 'tabular-nums',
                                    lineHeight: 1.1,
                                }}
                            >
                                {progresAgregat.realisasi}%
                            </div>
                        </div>

                        {progresAgregat.rencana !== null && (
                            <div
                                style={{
                                    fontSize: 13,
                                    color:
                                        deviasi !== null && deviasi < 0
                                            ? ckColors.warn
                                            : ckColors.textMuted,
                                    fontWeight: 540,
                                }}
                            >
                                Rencana {progresAgregat.rencana}%
                                {deviasi !== null &&
                                    ` · deviasi ${deviasi > 0 ? '+' : ''}${deviasi}%`}
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: 10 }}>
                        <SCurveChart points={progresAgregat.points} />
                    </div>
                </CkCard>

                <PetaKoordinat
                    paketId={paket.id}
                    alamat={paket.alamat}
                    titik={titikKoordinat}
                />
            </div>

            <CkSectionLabel style={{ margin: '28px 0 8px 6px' }}>
                Riwayat progres fisik
            </CkSectionLabel>
            <ProgresRiwayat entries={riwayatProgres} />

            <TambahProgresDialog
                paketId={paket.id}
                open={catatOpen}
                onOpenChange={setCatatOpen}
            />
        </div>
    );
}
