import { Head } from '@inertiajs/react';
import PaketController from '@/actions/App/Http/Controllers/PaketController';
import Heading from '@/components/heading';
import { PaketForm } from '@/components/paket-form';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { index } from '@/routes/paket';
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

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Ubah Paket"
                    description={`Memperbarui data paket ${paket.kode_paket}.`}
                />

                <Card>
                    <CardContent>
                        <PaketForm
                            action={PaketController.update.form(paket.id)}
                            statusOptions={statusOptions}
                            submitLabel="Simpan Perubahan"
                            paket={paket}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

PaketEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Data Paket', href: index() },
        { title: 'Ubah Paket', href: '#' },
    ],
};
