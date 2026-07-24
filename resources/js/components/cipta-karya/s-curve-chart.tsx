import type { ProgresAgregatPoint } from '@/types';
import { ckColors } from './tokens';

/**
 * Grafik "realisasi vs rencana" ala kurva-S, dipakai di Ringkasan (agregat
 * seluruh paket) dan Detail paket (satu paket). Rencana selalu tergambar
 * penuh; realisasi hanya sampai bulan berjalan (bulan berikutnya belum
 * punya data nyata, jadi tidak digambar — lihat DashboardController /
 * PaketController untuk bagaimana titik-titik ini dihitung).
 */
export function SCurveChart({
    points,
    accent = ckColors.accent,
}: {
    points: ProgresAgregatPoint[];
    accent?: string;
}) {
    const n = points.length;
    const xAt = (i: number) => 30 + i * ((612 - 30) / Math.max(1, n - 1));
    const yAt = (pct: number) => 200 - 1.8 * Math.max(0, Math.min(100, pct));

    const rencanaPoints = points
        .map((p, i) => `${xAt(i)},${yAt(p.rencana)}`)
        .join(' ');

    const realisasiKnown = points
        .map((p, i) => (p.realisasi !== null ? { i, v: p.realisasi } : null))
        .filter((v): v is { i: number; v: number } => v !== null);

    const realisasiPoints = realisasiKnown
        .map(({ i, v }) => `${xAt(i)},${yAt(v)}`)
        .join(' ');
    const last = realisasiKnown.at(-1);
    const first = realisasiKnown[0];

    const areaPath =
        first && last
            ? `M${xAt(first.i)} ${yAt(first.v)} ` +
              realisasiKnown
                  .slice(1)
                  .map(({ i, v }) => `L${xAt(i)} ${yAt(v)}`)
                  .join(' ') +
              ` L${xAt(last.i)} 200 L${xAt(first.i)} 200 Z`
            : '';

    return (
        <svg
            viewBox="0 0 680 236"
            style={{ width: '100%', height: 'auto', display: 'block' }}
        >
            <line
                x1={28}
                y1={200}
                x2={612}
                y2={200}
                stroke="#EAE8E3"
                strokeWidth={1}
            />

            {areaPath && <path d={areaPath} fill={accent} fillOpacity={0.07} />}

            <polyline
                points={rencanaPoints}
                fill="none"
                stroke="#CBC9C3"
                strokeWidth={1.6}
                strokeDasharray="5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {realisasiPoints && (
                <polyline
                    points={realisasiPoints}
                    fill="none"
                    stroke={accent}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            )}

            {last && (
                <>
                    <circle
                        cx={xAt(last.i)}
                        cy={yAt(last.v)}
                        r={5.5}
                        fill="#fff"
                    />
                    <circle
                        cx={xAt(last.i)}
                        cy={yAt(last.v)}
                        r={3.4}
                        fill={accent}
                    />
                </>
            )}

            {points.map((p, i) => (
                <text
                    key={`${p.label}-${i}`}
                    x={xAt(i)}
                    y={222}
                    fontSize={11}
                    fill={ckColors.textMuted5}
                    textAnchor="middle"
                    fontFamily="inherit"
                >
                    {p.label}
                </text>
            ))}
        </svg>
    );
}
