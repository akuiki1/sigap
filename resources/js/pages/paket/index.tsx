import { Head, Link } from '@inertiajs/react';
import { PaketStatusBadge } from '@/components/paket-status-badge';
import { formatCurrency } from '@/lib/utils';
import { create, index, show } from '@/routes/paket';
import type { Paginated, Paket } from '@/types';
import { CiptaKaryaSidebar } from '@/components/cipta-karya/sidebar';
import { ckColors, ckFont } from '@/components/cipta-karya/tokens';
import { CkCard, CkRow, CkChevron } from '@/components/cipta-karya/primitives';

export default function PaketIndex({ pakets }: { pakets: Paginated<Paket> }) {
    const { data, current_page, last_page, from, to, total } = pakets;

    return (
        <>
            <Head title="Data Paket" />

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
                        <div className="flex flex-col gap-6">
                            <header
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: 'space-between',
                                    gap: 24,
                                    marginBottom: 8,
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
                                        Administrasi Paket · Bidang Cipta Karya
                                    </div>
                                    <h1
                                        style={{
                                            fontSize: 28,
                                            fontWeight: 680,
                                            letterSpacing: '-.025em',
                                            color: ckColors.text,
                                            marginTop: 3,
                                            marginBottom: 0,
                                        }}
                                    >
                                        Daftar Paket
                                    </h1>
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
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    >
                                        <path d="M8 2.5v11M2.5 8h11" />
                                    </svg>
                                    Tambah Paket
                                </Link>
                            </header>

                            <CkCard>
                                {data.length === 0 ? (
                                    <div
                                        style={{
                                            padding: '36px 18px',
                                            fontSize: 14.5,
                                            color: ckColors.textMuted,
                                            textAlign: 'center',
                                        }}
                                    >
                                        Belum ada data paket proyek Cipta Karya.
                                    </div>
                                ) : (
                                    data.map((paket, i) => (
                                        <CkRow
                                            key={paket.id}
                                            href={show(paket.id).url}
                                            first={i === 0}
                                        >
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        fontSize: 15.5,
                                                        fontWeight: 580,
                                                        letterSpacing: '-.015em',
                                                        color: ckColors.text,
                                                    }}
                                                >
                                                    {paket.nama}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 12.5,
                                                        color: ckColors.textMuted2,
                                                        marginTop: 3.5,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontFamily: 'monospace',
                                                            fontSize: 11,
                                                            background: 'rgba(0,0,0,.04)',
                                                            padding: '1px 5px',
                                                            borderRadius: 4,
                                                            color: ckColors.textMuted,
                                                        }}
                                                    >
                                                        {paket.kode_paket}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{formatCurrency(paket.nilai_kontrak)}</span>
                                                    {paket.penyedia && (
                                                        <>
                                                            <span>•</span>
                                                            <span style={{ color: ckColors.textMuted }}>
                                                                {paket.penyedia}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 16,
                                                }}
                                            >
                                                <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
                                                    <div
                                                        style={{
                                                            fontSize: 14.5,
                                                            fontWeight: 570,
                                                            color: ckColors.text,
                                                        }}
                                                    >
                                                        {paket.progres}%
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 11.5,
                                                            color: ckColors.textMuted,
                                                            marginTop: 1,
                                                        }}
                                                    >
                                                        Fisik
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <PaketStatusBadge status={paket.status} />
                                                </div>
                                                <CkChevron />
                                            </div>
                                        </CkRow>
                                    ))
                                )}
                            </CkCard>

                            {last_page > 1 && (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginTop: 8,
                                        padding: '0 4px',
                                    }}
                                >
                                    <p style={{ fontSize: 13.5, color: ckColors.textMuted }}>
                                        Menampilkan {from ?? 0}–{to ?? 0} dari {total} paket
                                    </p>

                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {current_page > 1 ? (
                                            <Link
                                                href={index({
                                                    query: { page: current_page - 1 },
                                                })}
                                                className="ck-btn-accent"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    padding: '7px 13px',
                                                    borderRadius: 10,
                                                    border: `1px solid ${ckColors.border}`,
                                                    color: ckColors.text,
                                                    fontSize: 13,
                                                    fontWeight: 550,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Sebelumnya
                                            </Link>
                                        ) : (
                                            <span
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    padding: '7px 13px',
                                                    borderRadius: 10,
                                                    border: `1px solid ${ckColors.borderSoft}`,
                                                    color: ckColors.textMuted4,
                                                    fontSize: 13,
                                                    fontWeight: 550,
                                                    opacity: 0.5,
                                                }}
                                            >
                                                Sebelumnya
                                            </span>
                                        )}

                                        {current_page < last_page ? (
                                            <Link
                                                href={index({
                                                    query: { page: current_page + 1 },
                                                })}
                                                className="ck-btn-accent"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    padding: '7px 13px',
                                                    borderRadius: 10,
                                                    border: `1px solid ${ckColors.border}`,
                                                    color: ckColors.text,
                                                    fontSize: 13,
                                                    fontWeight: 550,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Berikutnya
                                            </Link>
                                        ) : (
                                            <span
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    padding: '7px 13px',
                                                    borderRadius: 10,
                                                    border: `1px solid ${ckColors.borderSoft}`,
                                                    color: ckColors.textMuted4,
                                                    fontSize: 13,
                                                    fontWeight: 550,
                                                    opacity: 0.5,
                                                }}
                                            >
                                                Berikutnya
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
