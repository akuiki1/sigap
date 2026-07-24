import { Form, Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import PaketController from '@/actions/App/Http/Controllers/PaketController';
import Heading from '@/components/heading';
import { PaketStatusBadge } from '@/components/paket-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import { dashboard } from '@/routes';
import { edit, index } from '@/routes/paket';
import type { Paket } from '@/types';

function Baris({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="grid gap-1 border-b py-3 last:border-b-0 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-sm sm:col-span-2">{children}</dd>
        </div>
    );
}

export default function PaketShow({ paket }: { paket: Paket }) {
    return (
        <>
            <Head title={paket.kode_paket} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title={paket.nama}
                        description={`Kode paket ${paket.kode_paket} · Tahun anggaran ${paket.tahun_anggaran}`}
                    />

                    <div className="flex shrink-0 gap-2">
                        <Button variant="outline" asChild>
                            <Link href={edit(paket.id)}>Ubah</Link>
                        </Button>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="destructive">Hapus</Button>
                            </DialogTrigger>

                            <DialogContent>
                                <DialogTitle>Hapus paket ini?</DialogTitle>
                                <DialogDescription>
                                    Paket {paket.kode_paket} akan dihapus
                                    permanen dan tidak dapat dikembalikan.
                                </DialogDescription>

                                <Form
                                    {...PaketController.destroy.form(paket.id)}
                                >
                                    {({ processing }) => (
                                        <DialogFooter className="gap-2">
                                            <DialogClose asChild>
                                                <Button variant="secondary">
                                                    Batal
                                                </Button>
                                            </DialogClose>

                                            <Button
                                                variant="destructive"
                                                disabled={processing}
                                                asChild
                                            >
                                                <button type="submit">
                                                    Hapus Paket
                                                </button>
                                            </Button>
                                        </DialogFooter>
                                    )}
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card>
                    <CardContent>
                        <dl>
                            <Baris label="Status">
                                <PaketStatusBadge status={paket.status} />
                            </Baris>

                            <Baris label="Nilai Kontrak">
                                {formatCurrency(paket.nilai_kontrak)}
                            </Baris>

                            <Baris label="Progres">{paket.progres}%</Baris>

                            <Baris label="Lokasi">{paket.lokasi ?? '-'}</Baris>

                            <Baris label="Penyedia">
                                {paket.penyedia ?? '-'}
                            </Baris>

                            <Baris label="Tanggal Mulai">
                                {formatDate(paket.tanggal_mulai)}
                            </Baris>

                            <Baris label="Tanggal Selesai">
                                {formatDate(paket.tanggal_selesai)}
                            </Baris>

                            <Baris label="Keterangan">
                                {paket.keterangan ?? '-'}
                            </Baris>
                        </dl>
                    </CardContent>
                </Card>

                <div>
                    <Button variant="outline" asChild>
                        <Link href={index()}>Kembali ke Data Paket</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

PaketShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Data Paket', href: index() },
        { title: 'Detail Paket', href: '#' },
    ],
};
