import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { dashboard } from '@/routes';
import { create, index } from '@/routes/paket';

type Paket = {
    id: number;
    nama: string;
    nilai_kontrak: number;
    progres: number;
    status: string;
};

export default function PaketIndex({ pakets = [] }: { pakets?: Paket[] }) {
    return (
        <>
            <Head title="Data Paket" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Data Paket"
                        description="Daftar paket proyek gedung yang tercatat."
                    />

                    <Button asChild>
                        <Link href={create()}>Tambah Paket</Link>
                    </Button>
                </div>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Paket</TableHead>
                                <TableHead>Nilai Kontrak</TableHead>
                                <TableHead>Progres</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pakets.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="text-center text-muted-foreground"
                                    >
                                        Belum ada data paket.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pakets.map((paket) => (
                                    <TableRow key={paket.id}>
                                        <TableCell>{paket.nama}</TableCell>
                                        <TableCell>
                                            {formatCurrency(
                                                paket.nilai_kontrak,
                                            )}
                                        </TableCell>
                                        <TableCell>{paket.progres}%</TableCell>
                                        <TableCell>
                                            <Badge>{paket.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </>
    );
}

PaketIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Data Paket', href: index() },
    ],
};
