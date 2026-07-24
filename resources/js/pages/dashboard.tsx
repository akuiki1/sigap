import { Head, Link } from '@inertiajs/react';
import { PaketStatusBadge } from '@/components/paket-status-badge';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { show } from '@/routes/paket';
import type { Paket } from '@/types';

type Stats = {
    total_paket: number;
    proyek_aktif: number;
    selesai: number;
    menunggu_audit: number;
};

const statCards: { key: keyof Stats; label: string }[] = [
    { key: 'total_paket', label: 'Total Paket' },
    { key: 'proyek_aktif', label: 'Proyek Aktif' },
    { key: 'selesai', label: 'Selesai' },
    { key: 'menunggu_audit', label: 'Menunggu Audit' },
];

export default function Dashboard({
    stats,
    pakets = [],
}: {
    stats: Stats;
    pakets?: Paket[];
}) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <Card key={card.key}>
                            <CardHeader>
                                <CardDescription>{card.label}</CardDescription>
                                <CardTitle className="text-3xl">
                                    {stats[card.key]}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Paket Terbaru</CardTitle>
                        <CardDescription>
                            Daftar proyek gedung yang terakhir diperbarui.
                        </CardDescription>
                    </CardHeader>

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
                                        <TableCell>
                                            <Link
                                                href={show(paket.id)}
                                                className="font-medium hover:underline"
                                            >
                                                {paket.nama}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(
                                                paket.nilai_kontrak,
                                            )}
                                        </TableCell>
                                        <TableCell>{paket.progres}%</TableCell>
                                        <TableCell>
                                            <PaketStatusBadge
                                                status={paket.status}
                                            />
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

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
