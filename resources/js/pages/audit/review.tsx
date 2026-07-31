import { Head } from '@inertiajs/react';
import { CkCard, CkRow, CkChevron } from '@/components/cipta-karya/primitives';
import { CiptaKaryaSidebar } from '@/components/cipta-karya/sidebar';
import { ckColors, ckFont } from '@/components/cipta-karya/tokens';
import { PaketStatusBadge } from '@/components/paket-status-badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { show } from '@/routes/paket';
import type { Paket } from '@/types';

export default function AuditReview({ pakets }: { pakets: Paket[] }) {
    return (
        <>
            <Head title="Mode Audit" />

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
                <CiptaKaryaSidebar active="audit" />

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
                                    flexDirection: 'column',
                                    gap: 4,
                                    marginBottom: 8,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 520,
                                        color: ckColors.textMuted,
                                        letterSpacing: '.01em',
                                    }}
                                >
                                    Peninjauan Kepatuhan · Bidang Cipta Karya
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
                                    Mode Audit
                                </h1>
                                <p
                                    style={{
                                        fontSize: 14.5,
                                        color: ckColors.textMuted,
                                        margin: '4px 0 0 0',
                                    }}
                                >
                                    {pakets.length} paket sedang dalam status
                                    menunggu peninjauan audit.
                                </p>
                            </header>

                            <CkCard>
                                {pakets.length === 0 ? (
                                    <div
                                        style={{
                                            padding: '36px 18px',
                                            fontSize: 14.5,
                                            color: ckColors.textMuted,
                                            textAlign: 'center',
                                        }}
                                    >
                                        Tidak ada paket yang menunggu audit saat
                                        ini.
                                    </div>
                                ) : (
                                    pakets.map((paket, i) => (
                                        <CkRow
                                            key={paket.id}
                                            href={show(paket.id).url}
                                            first={i === 0}
                                        >
                                            <div
                                                style={{ flex: 1, minWidth: 0 }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 15.5,
                                                        fontWeight: 580,
                                                        letterSpacing:
                                                            '-.015em',
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
                                                            fontFamily:
                                                                'monospace',
                                                            fontSize: 11,
                                                            background:
                                                                'rgba(0,0,0,.04)',
                                                            padding: '1px 5px',
                                                            borderRadius: 4,
                                                            color: ckColors.textMuted,
                                                        }}
                                                    >
                                                        {paket.kode_paket}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {formatCurrency(
                                                            paket.nilai_kontrak,
                                                        )}
                                                    </span>
                                                    {paket.tanggal_selesai && (
                                                        <>
                                                            <span>•</span>
                                                            <span>
                                                                Selesai:{' '}
                                                                {formatDate(
                                                                    paket.tanggal_selesai,
                                                                )}
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
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <PaketStatusBadge
                                                        status={paket.status}
                                                    />
                                                </div>
                                                <CkChevron />
                                            </div>
                                        </CkRow>
                                    ))
                                )}
                            </CkCard>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
