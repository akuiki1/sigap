import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { index } from '@/routes/paket';

export default function PaketEdit() {
    return (
        <>
            <Head title="Ubah Paket" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Ubah Paket"
                    description="Form pengeditan data paket proyek gedung."
                />

                <Card>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Form pengeditan paket akan tersedia di sini.
                        </p>

                        <Button variant="outline" asChild>
                            <Link href={index()}>Kembali ke Data Paket</Link>
                        </Button>
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
