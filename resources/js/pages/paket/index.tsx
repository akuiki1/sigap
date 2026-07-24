import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { PaketStatusBadge } from '@/components/paket-status-badge';
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
import { create, index, show } from '@/routes/paket';
import type { Paginated, Paket } from '@/types';
import { CiptaKaryaSidebar } from '@/components/cipta-karya/sidebar';
import { ckColors, ckFont } from '@/components/cipta-karya/tokens';

export default function PaketIndex({ pakets }: { pakets: Paginated<Paket> }) {
    const { data, current_page, last_page, from, to, total } = pakets;

    return (
        <>
            <Head title="Data Paket" />

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
                            <div className="flex items-center justify-between">
                                <Heading
                                    title="Data Paket"
                                    description="Daftar paket proyek gedung yang tercatat."
                                />

                                <Button asChild>
                                    <Link href={create()}>Tambah Paket</Link>
                                </Button>
                            </div>

                            <Card className="border border-neutral-100 shadow-xs">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode</TableHead>
                                <TableHead>Nama Paket</TableHead>
                                <TableHead>Nilai Kontrak</TableHead>
                                <TableHead>Progres</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center text-muted-foreground"
                                    >
                                        Belum ada data paket.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((paket) => (
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

                {last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {from ?? 0}–{to ?? 0} dari {total} paket
                        </p>

                        <div className="flex gap-2">
                            {current_page > 1 ? (
                                <Button variant="outline" size="sm" asChild>
                                    <Link
                                        href={index({
                                            query: { page: current_page - 1 },
                                        })}
                                    >
                                        Sebelumnya
                                    </Link>
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm" disabled>
                                    Sebelumnya
                                </Button>
                            )}

                            {current_page < last_page ? (
                                <Button variant="outline" size="sm" asChild>
                                    <Link
                                        href={index({
                                            query: { page: current_page + 1 },
                                        })}
                                    >
                                        Berikutnya
                                    </Link>
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm" disabled>
                                    Berikutnya
                                </Button>
                            )}
                        </div>
                    </div>
                )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
