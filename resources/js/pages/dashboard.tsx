import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import '@/components/cipta-karya/cipta-karya.css';
import { KartuPaket } from '@/components/cipta-karya/kartu-paket';
import { CiptaKaryaShell } from '@/components/cipta-karya/shell';
import { ckColors } from '@/components/cipta-karya/tokens';
import { create } from '@/routes/paket';
import type { DashboardPackageRow, DashboardStats } from '@/types';

type DashboardProps = {
    todayLabel: string;
    stats: DashboardStats;
    packages: DashboardPackageRow[];
    tahunBerjalan: number;
};

/**
 * Chip penyaring di atas grid. "Perlu perhatian" bukan status paket melainkan
 * turunan dari `sorot`, jadi ia bisa beririsan dengan chip status di bawahnya —
 * memang begitu maksudnya: satu paket aktif yang dokumennya kurang muncul di
 * kedua chip.
 */
type Saringan = 'semua' | 'perhatian' | 'aktif' | 'menunggu_audit' | 'selesai';

const cocok: Record<Saringan, (p: DashboardPackageRow) => boolean> = {
    semua: () => true,
    perhatian: (p) => p.sorot !== null,
    aktif: (p) => p.status === 'aktif',
    menunggu_audit: (p) => p.status === 'menunggu_audit',
    selesai: (p) => p.status === 'selesai',
};

const LABEL_SARINGAN: Record<Saringan, string> = {
    semua: 'Semua',
    perhatian: 'Perlu perhatian',
    aktif: 'Aktif',
    menunggu_audit: 'Menunggu audit',
    selesai: 'Selesai',
};

const URUTAN_SARINGAN: Saringan[] = [
    'semua',
    'perhatian',
    'aktif',
    'menunggu_audit',
    'selesai',
];

function Statistik({
    label,
    nilai,
}: {
    label: string;
    nilai: string | number;
}) {
    return (
        <div style={{ textAlign: 'right' }}>
            <div
                style={{
                    fontSize: 12.5,
                    color: ckColors.textMuted,
                    fontWeight: 510,
                }}
            >
                {label}
            </div>
            <div
                style={{
                    fontSize: 19,
                    fontWeight: 600,
                    letterSpacing: '-.02em',
                    fontVariantNumeric: 'tabular-nums',
                    marginTop: 1,
                }}
            >
                {nilai}
            </div>
        </div>
    );
}

function PemisahStatistik() {
    return (
        <div
            style={{
                width: 1,
                height: 30,
                background: 'rgba(0,0,0,.08)',
            }}
        />
    );
}

export default function Dashboard({
    todayLabel,
    stats,
    packages,
    tahunBerjalan,
}: DashboardProps) {
    const { auth } = usePage().props;
    const [query, setQuery] = useState('');
    const [saringan, setSaringan] = useState<Saringan>('semua');

    const jumlah = useMemo(
        () =>
            Object.fromEntries(
                URUTAN_SARINGAN.map((key) => [
                    key,
                    packages.filter(cocok[key]).length,
                ]),
            ) as Record<Saringan, number>,
        [packages],
    );

    const terlihat = useMemo(() => {
        const q = query.trim().toLowerCase();

        return packages.filter((p) => {
            if (!cocok[saringan](p)) {
                return false;
            }

            return (
                !q ||
                p.nama.toLowerCase().includes(q) ||
                (p.penyedia ?? '').toLowerCase().includes(q)
            );
        });
    }, [packages, query, saringan]);

    return (
        <>
            <Head title="Ringkasan" />

            <CiptaKaryaShell
                active="ringkasan"
                aksi={
                    <>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 7,
                                padding: '7px 12px',
                                borderRadius: 10,
                                background: 'rgba(120,120,128,.1)',
                                flex: 'none',
                            }}
                        >
                            <svg
                                width="14"
                                height="14"
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
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Cari paket"
                                aria-label="Cari paket"
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    outline: 'none',
                                    fontSize: 13,
                                    color: ckColors.text,
                                    fontFamily: 'inherit',
                                    width: 120,
                                }}
                            />
                        </div>

                        {auth.user.can_input && (
                            <Link
                                href={create()}
                                className="ck-btn-accent"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '8px 14px',
                                    borderRadius: 10,
                                    background: ckColors.accent,
                                    color: '#fff',
                                    fontSize: 13.5,
                                    fontWeight: 590,
                                    letterSpacing: '-.01em',
                                    whiteSpace: 'nowrap',
                                    flex: 'none',
                                }}
                            >
                                <svg
                                    width="13"
                                    height="13"
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
                        )}
                    </>
                }
            >
                <div
                    style={{
                        maxWidth: 1240,
                        margin: '0 auto',
                        padding: '28px 36px 48px',
                    }}
                >
                    <header
                        style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'space-between',
                            gap: 24,
                            flexWrap: 'wrap',
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
                                {todayLabel} · TA {tahunBerjalan}
                            </div>
                            <h1
                                style={{
                                    fontSize: 26,
                                    fontWeight: 680,
                                    letterSpacing: '-.025em',
                                    color: ckColors.text,
                                    margin: '3px 0 0',
                                }}
                            >
                                Ringkasan
                            </h1>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 22,
                                paddingBottom: 3,
                            }}
                        >
                            <Statistik
                                label="Paket aktif"
                                nilai={stats.paket_aktif}
                            />
                            <PemisahStatistik />
                            <Statistik
                                label="Kesiapan audit"
                                nilai={`${stats.kesiapan_audit_persen}%`}
                            />
                            <PemisahStatistik />
                            <Statistik
                                label="Menuju PHO"
                                nilai={stats.menuju_pho}
                            />
                        </div>
                    </header>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginTop: 20,
                            flexWrap: 'wrap',
                        }}
                    >
                        {URUTAN_SARINGAN.map((key) => {
                            const aktif = saringan === key;

                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setSaringan(key)}
                                    className={aktif ? undefined : 'ck-chip'}
                                    aria-pressed={aktif}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 7,
                                        padding: '7px 13px',
                                        borderRadius: 999,
                                        border: aktif
                                            ? '1px solid transparent'
                                            : '1px solid rgba(0,0,0,.1)',
                                        background: aktif
                                            ? ckColors.text
                                            : 'transparent',
                                        color: aktif ? '#fff' : '#3F3E3A',
                                        font: 'inherit',
                                        fontSize: 13,
                                        fontWeight: aktif ? 560 : 530,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        transition:
                                            'background-color .12s ease',
                                    }}
                                >
                                    {key === 'perhatian' && (
                                        <span
                                            style={{
                                                width: 7,
                                                height: 7,
                                                borderRadius: '50%',
                                                background: aktif
                                                    ? '#fff'
                                                    : ckColors.warn,
                                            }}
                                        />
                                    )}
                                    {LABEL_SARINGAN[key]} {jumlah[key]}
                                </button>
                            );
                        })}
                    </div>

                    {terlihat.length === 0 ? (
                        <div
                            style={{
                                marginTop: 20,
                                padding: '48px 18px',
                                borderRadius: 14,
                                border: `1px dashed rgba(0,0,0,.12)`,
                                fontSize: 14,
                                color: ckColors.textMuted,
                                textAlign: 'center',
                            }}
                        >
                            {packages.length === 0
                                ? `Belum ada paket untuk TA ${tahunBerjalan}.`
                                : 'Tidak ada paket yang cocok dengan penyaringan ini.'}
                        </div>
                    ) : (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: 18,
                                marginTop: 20,
                            }}
                        >
                            {terlihat.map((paket) => (
                                <KartuPaket key={paket.id} paket={paket} />
                            ))}
                        </div>
                    )}
                </div>
            </CiptaKaryaShell>
        </>
    );
}
