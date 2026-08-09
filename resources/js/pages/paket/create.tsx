import { Head } from '@inertiajs/react';
import PaketController from '@/actions/App/Http/Controllers/PaketController';
import { CkCard } from '@/components/cipta-karya/primitives';
import { CiptaKaryaShell } from '@/components/cipta-karya/shell';
import { ckColors } from '@/components/cipta-karya/tokens';
import { PaketForm } from '@/components/paket-form';
import type { StatusOption } from '@/types';

export default function PaketCreate({
    statusOptions,
}: {
    statusOptions: StatusOption[];
}) {
    return (
        <>
            <Head title="Tambah Paket" />

            <CiptaKaryaShell active="paket">
                <div
                    style={{
                        maxWidth: 1180,
                        margin: '0 auto',
                        padding: '38px 40px 72px',
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
                                Tambah Paket
                            </h1>
                        </header>

                        <CkCard padded={true}>
                            <PaketForm
                                action={PaketController.store.form()}
                                statusOptions={statusOptions}
                                submitLabel="Simpan Paket"
                            />
                        </CkCard>
                    </div>
                </div>
            </CiptaKaryaShell>
        </>
    );
}
