import { Head } from '@inertiajs/react';
import PaketController from '@/actions/App/Http/Controllers/PaketController';
import Heading from '@/components/heading';
import { PaketForm } from '@/components/paket-form';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { index } from '@/routes/paket';
import type { Paket, StatusOption } from '@/types';
import { CiptaKaryaSidebar } from '@/components/cipta-karya/sidebar';
import { ckColors, ckFont } from '@/components/cipta-karya/tokens';

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
                            <Heading
                                title="Ubah Paket"
                                description={`Memperbarui data paket ${paket.kode_paket}.`}
                            />

                            <Card className="border border-neutral-100 shadow-xs">
                                <CardContent className="pt-6">
                                    <PaketForm
                                        action={PaketController.update.form(paket.id)}
                                        statusOptions={statusOptions}
                                        submitLabel="Simpan Perubahan"
                                        paket={paket}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
