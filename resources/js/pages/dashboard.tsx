import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import '@/components/cipta-karya/cipta-karya.css';
import {
    CkCard,
    CkChevron,
    CkRow,
    CkSectionLabel,
} from '@/components/cipta-karya/primitives';
import { SCurveChart } from '@/components/cipta-karya/s-curve-chart';
import { CiptaKaryaSidebar } from '@/components/cipta-karya/sidebar';
import { ckColors, ckFont } from '@/components/cipta-karya/tokens';
import { formatCurrencyCompact } from '@/lib/utils';
import { create, show } from '@/routes/paket';
import type {
    DashboardPackageRow,
    DashboardStats,
    FollowupItem,
    ProgresAgregat,
    TenggatItem,
} from '@/types';

type DashboardProps = {
    todayLabel: string;
    stats: DashboardStats;
    followupPaketCount: number;
    followups: FollowupItem[];
    packages: DashboardPackageRow[];
    progresAgregat: ProgresAgregat;
    tenggatTerdekat: TenggatItem[];
    tahunBerjalan: number;
};

const toneColor = (tone: 'warn' | 'danger') =>
    tone === 'danger' ? ckColors.danger : ckColors.warn;

function heroSentence(count: number): { headline: string; sub: string } {
    if (count === 0) {
        return {
            headline: 'Semua paket berjalan sesuai rencana.',
            sub: 'Tidak ada yang perlu perhatian khusus minggu ini.',
        };
    }

    return {
        headline: `${count} paket perlu perhatian minggu ini.`,
        sub: 'Paket lainnya berjalan sesuai rencana.',
    };
}

export default function Dashboard({
    todayLabel,
    stats,
    followupPaketCount,
    followups,
    packages,
    progresAgregat,
    tenggatTerdekat,
    tahunBerjalan,
}: DashboardProps) {
    const [query, setQuery] = useState('');

    const filteredPackages = useMemo(() => {
        const q = query.trim().toLowerCase();

        if (!q) {
            return packages;
        }

        return packages.filter(
            (p) =>
                p.nama.toLowerCase().includes(q) ||
                (p.penyedia ?? '').toLowerCase().includes(q),
        );
    }, [packages, query]);

    const hero = heroSentence(followupPaketCount);

    return (
        <>
            <Head title="Ringkasan" />

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
                <CiptaKaryaSidebar active="ringkasan" />

                <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
                    <div
                        style={{
                            maxWidth: 1180,
                            margin: '0 auto',
                            padding: '40px 48px 72px',
                        }}
                    >
                        <header
                            style={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'space-between',
                                gap: 24,
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 520,
                                        color: ckColors.textMuted,
                                        letterSpacing: '.01em',
                                    }}
                                >
                                    {todayLabel} · Bidang Cipta Karya
                                </div>
                                <h1
                                    style={{
                                        fontSize: 28,
                                        fontWeight: 680,
                                        letterSpacing: '-.025em',
                                        color: ckColors.text,
                                        marginTop: 3,
                                    }}
                                >
                                    Ringkasan
                                </h1>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 7,
                                        padding: '9px 13px',
                                        borderRadius: 11,
                                        background: 'rgba(120,120,128,.1)',
                                    }}
                                >
                                    <svg
                                        width="15"
                                        height="15"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        stroke={ckColors.textMuted}
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                    >
                                        <circle cx="7" cy="7" r="4.5" />
                                        <path d="M10.5 10.5L14 14" />
                                    </svg>
                                    <input
                                        value={query}
                                        onChange={(e) =>
                                            setQuery(e.target.value)
                                        }
                                        placeholder="Cari paket"
                                        style={{
                                            border: 'none',
                                            background: 'transparent',
                                            outline: 'none',
                                            fontSize: 13.5,
                                            color: ckColors.text,
                                            fontFamily: 'inherit',
                                            width: 140,
                                        }}
                                    />
                                </div>
                                <Link
                                    href={create()}
                                    className="ck-btn-accent"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '10px 16px',
                                        borderRadius: 12,
                                        background: ckColors.accent,
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        fontWeight: 590,
                                        letterSpacing: '-.01em',
                                    }}
                                >
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 15 15"
                                        fill="none"
                                        stroke="#fff"
                                        strokeWidth="1.9"
                                        strokeLinecap="round"
                                    >
                                        <path d="M7.5 2v11M2 7.5h11" />
                                    </svg>
                                    Paket baru
                                </Link>
                            </div>
                        </header>

                        <section
                            style={{ margin: '32px 0 0', maxWidth: '24ch' }}
                        >
                            <div
                                style={{
                                    fontSize: 'clamp(33px,3.3vw,42px)',
                                    lineHeight: 1.13,
                                    fontWeight: 600,
                                    letterSpacing: '-.024em',
                                    color: ckColors.text,
                                }}
                            >
                                {hero.headline}
                            </div>
                            <div
                                style={{
                                    fontSize: 16,
                                    color: ckColors.textMuted,
                                    marginTop: 11,
                                    letterSpacing: '-.01em',
                                }}
                            >
                                {hero.sub}
                            </div>
                        </section>

                        <section style={{ marginTop: 34 }}>
                            <CkCard>
                                <div
                                    style={{
                                        display: 'flex',
                                        marginLeft: -1,
                                    }}
                                >
                                    {[
                                        {
                                            label: 'Paket aktif',
                                            value: stats.paket_aktif,
                                        },
                                        {
                                            label: 'Kesiapan audit',
                                            value: `${stats.kesiapan_audit_persen}%`,
                                        },
                                        {
                                            label: 'Dokumen belum lengkap',
                                            value: stats.dokumen_belum_lengkap,
                                        },
                                        {
                                            label: 'Menuju PHO (30 hari)',
                                            value: stats.menuju_pho,
                                        },
                                    ].map((stat) => (
                                        <div
                                            key={stat.label}
                                            style={{
                                                flex: 1,
                                                minWidth: 0,
                                                padding: '18px 22px',
                                                borderLeft: `1px solid ${ckColors.border}`,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    color: ckColors.textMuted,
                                                    fontWeight: 510,
                                                }}
                                            >
                                                {stat.label}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 30,
                                                    fontWeight: 600,
                                                    letterSpacing: '-.02em',
                                                    marginTop: 5,
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {stat.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CkCard>
                        </section>

                        {followups.length > 0 && (
                            <section style={{ marginTop: 30 }}>
                                <CkSectionLabel>
                                    Perlu ditindaklanjuti
                                </CkSectionLabel>
                                <CkCard>
                                    {followups.map((item, i) => (
                                        <CkRow
                                            key={`${item.paket_id}-${i}`}
                                            href={show(item.paket_id).url}
                                            first={i === 0}
                                        >
                                            <div
                                                style={{ flex: 1, minWidth: 0 }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 15,
                                                        fontWeight: 530,
                                                        letterSpacing: '-.01em',
                                                        color: ckColors.text,
                                                    }}
                                                >
                                                    {item.text}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        color: ckColors.textMuted,
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    {item.pkg}
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: 570,
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                    whiteSpace: 'nowrap',
                                                    color: toneColor(item.tone),
                                                }}
                                            >
                                                {item.meta}
                                            </div>
                                            <CkChevron />
                                        </CkRow>
                                    ))}
                                </CkCard>
                            </section>
                        )}

                        <section
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'minmax(0,1.55fr) minmax(0,1fr)',
                                gap: 26,
                                marginTop: 32,
                                alignItems: 'start',
                            }}
                        >
                            <div>
                                <CkSectionLabel>
                                    Semua paket · TA {tahunBerjalan}
                                </CkSectionLabel>
                                <CkCard>
                                    {filteredPackages.length === 0 ? (
                                        <div
                                            style={{
                                                padding: '24px 18px',
                                                fontSize: 14,
                                                color: ckColors.textMuted,
                                                textAlign: 'center',
                                            }}
                                        >
                                            {packages.length === 0
                                                ? `Belum ada paket untuk TA ${tahunBerjalan}.`
                                                : 'Tidak ada paket yang cocok dengan pencarian.'}
                                        </div>
                                    ) : (
                                        filteredPackages.map((p, i) => (
                                            <CkRow
                                                key={p.id}
                                                href={show(p.id).url}
                                                first={i === 0}
                                            >
                                                <span
                                                    style={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        flex: 'none',
                                                        background: p.flag
                                                            ? toneColor(p.flag)
                                                            : 'transparent',
                                                    }}
                                                />
                                                <div
                                                    style={{
                                                        flex: 1,
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: 15,
                                                            fontWeight: 530,
                                                            letterSpacing:
                                                                '-.01em',
                                                            color: ckColors.text,
                                                            whiteSpace:
                                                                'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow:
                                                                'ellipsis',
                                                        }}
                                                    >
                                                        {p.nama}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 13,
                                                            color: ckColors.textMuted,
                                                            marginTop: 2,
                                                            whiteSpace:
                                                                'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow:
                                                                'ellipsis',
                                                        }}
                                                    >
                                                        {[
                                                            p.penyedia,
                                                            formatCurrencyCompact(
                                                                p.nilai_kontrak,
                                                            ),
                                                            p.status_label,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' · ')}
                                                    </div>
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 15,
                                                        fontWeight: 560,
                                                        fontVariantNumeric:
                                                            'tabular-nums',
                                                        color: ckColors.text,
                                                    }}
                                                >
                                                    {p.progres}%
                                                </div>
                                                <CkChevron />
                                            </CkRow>
                                        ))
                                    )}
                                </CkCard>
                            </div>

                            <div>
                                <CkSectionLabel>Progres agregat</CkSectionLabel>
                                <CkCard padded>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            color: ckColors.textMuted,
                                            marginBottom: 8,
                                        }}
                                    >
                                        Realisasi vs rencana fisik
                                    </div>
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
                                                · rencana{' '}
                                                {progresAgregat.rencana}%
                                            </>
                                        )}
                                        {progresAgregat.deviasi !== null && (
                                            <>
                                                {' · '}
                                                <span
                                                    style={{
                                                        color:
                                                            progresAgregat.deviasi <
                                                            0
                                                                ? ckColors.warn
                                                                : ckColors.textMuted,
                                                        fontWeight: 540,
                                                    }}
                                                >
                                                    deviasi{' '}
                                                    {progresAgregat.deviasi > 0
                                                        ? '+'
                                                        : ''}
                                                    {progresAgregat.deviasi}%
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </CkCard>

                                {tenggatTerdekat.length > 0 && (
                                    <>
                                        <CkSectionLabel
                                            style={{ margin: '26px 0 8px 6px' }}
                                        >
                                            Tenggat terdekat
                                        </CkSectionLabel>
                                        <CkCard>
                                            {tenggatTerdekat.map((item, i) => (
                                                <CkRow
                                                    key={`${item.paket_id}-${i}`}
                                                    href={
                                                        show(item.paket_id).url
                                                    }
                                                    first={i === 0}
                                                >
                                                    <div
                                                        style={{
                                                            flex: 1,
                                                            minWidth: 0,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontSize: 14.5,
                                                                fontWeight: 530,
                                                                letterSpacing:
                                                                    '-.01em',
                                                                color: ckColors.text,
                                                            }}
                                                        >
                                                            {item.title}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 13,
                                                                color: ckColors.textMuted,
                                                                marginTop: 2,
                                                            }}
                                                        >
                                                            {item.pkg}
                                                        </div>
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 14,
                                                            fontWeight: 560,
                                                            color:
                                                                item.hari <= 7
                                                                    ? ckColors.warn
                                                                    : ckColors.text,
                                                            whiteSpace:
                                                                'nowrap',
                                                            fontVariantNumeric:
                                                                'tabular-nums',
                                                        }}
                                                    >
                                                        {item.hari === 0
                                                            ? 'Hari ini'
                                                            : `${item.hari} hari`}
                                                    </div>
                                                    <CkChevron />
                                                </CkRow>
                                            ))}
                                        </CkCard>
                                    </>
                                )}
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </>
    );
}
