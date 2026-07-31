import { Head } from '@inertiajs/react';
import PaketController from '@/actions/App/Http/Controllers/PaketController';
import { CkCard } from '@/components/cipta-karya/primitives';
import { CiptaKaryaSidebar } from '@/components/cipta-karya/sidebar';
import { ckColors, ckFont } from '@/components/cipta-karya/tokens';
import { PaketForm } from '@/components/paket-form';
import type { Paket, StatusOption } from '@/types';

export default function PaketEdit({
    paket,
    statusOptions,
}: {
    paket: Paket;
    statusOptions: StatusOption[];
}) {
    return (
        <>
            <Head title={`Ubah ${paket.kode_paket}`} />

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
                                    Ubah Paket
                                </h1>
                            </header>

                            <CkCard padded={true}>
                                <PaketForm
                                    action={PaketController.update.form(
                                        paket.id,
                                    )}
                                    statusOptions={statusOptions}
                                    submitLabel="Simpan Perubahan"
                                    paket={paket}
                                />
                            </CkCard>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
