import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { PaketStatusBadge } from '@/components/paket-status-badge';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { dashboard } from '@/routes';
import { review } from '@/routes/audit';
import { show } from '@/routes/paket';
import type { Paket } from '@/types';

export default function AuditReview({ pakets }: { pakets: Paket[] }) {
    return (
        <>
            <Head title="Mode Audit" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Mode Audit"
                    description={`${pakets.length} paket menunggu peninjauan.`}
                />

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode</TableHead>
                                <TableHead>Nama Paket</TableHead>
                                <TableHead>Nilai Kontrak</TableHead>
                                <TableHead>Selesai</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pakets.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center text-muted-foreground"
                                    >
                                        Tidak ada paket yang menunggu audit.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pakets.map((paket) => (
                                    <TableRow key={paket.id}>
                                        <TableCell className="font-mono text-xs">
                                            {paket.kode_paket}
                                        </TableCell>
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
                                        <TableCell>
                                            {formatDate(paket.tanggal_selesai)}
                                        </TableCell>
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

AuditReview.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Mode Audit', href: review() },
    ],
};
