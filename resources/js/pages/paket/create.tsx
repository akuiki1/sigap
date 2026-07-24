import { Head } from '@inertiajs/react';
import PaketController from '@/actions/App/Http/Controllers/PaketController';
import Heading from '@/components/heading';
import { PaketForm } from '@/components/paket-form';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { create, index } from '@/routes/paket';
import type { StatusOption } from '@/types';

export default function PaketCreate({
    statusOptions,
}: {
    statusOptions: StatusOption[];
}) {
    return (
        <>
            <Head title="Tambah Paket" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Tambah Paket"
                    description="Form penambahan data paket proyek gedung."
                />

                <Card>
                    <CardContent>
                        <PaketForm
                            action={PaketController.store.form()}
                            statusOptions={statusOptions}
                            submitLabel="Simpan Paket"
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

PaketCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Data Paket', href: index() },
        { title: 'Tambah Paket', href: create() },
    ],
};
