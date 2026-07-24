import { Form, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { index } from '@/routes/paket';
import type { Paket, StatusOption } from '@/types';
import type { RouteFormDefinition } from '@/wayfinder';

type PaketFormProps = {
    action: RouteFormDefinition<'post'> | RouteFormDefinition<'put'>;
    statusOptions: StatusOption[];
    submitLabel: string;
    paket?: Paket;
};

export function PaketForm({
    action,
    statusOptions,
    submitLabel,
    paket,
}: PaketFormProps) {
    const tahunSekarang = new Date().getFullYear();

    return (
        <Form {...action} className="space-y-6">
            {({ processing, errors }) => (
                <>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="kode_paket">Kode Paket</Label>

                            <Input
                                id="kode_paket"
                                name="kode_paket"
                                defaultValue={paket?.kode_paket}
                                required
                                placeholder="CK-2026-0001"
                            />

                            <InputError message={errors.kode_paket} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="tahun_anggaran">
                                Tahun Anggaran
                            </Label>

                            <Input
                                id="tahun_anggaran"
                                name="tahun_anggaran"
                                type="number"
                                min={2000}
                                max={2100}
                                defaultValue={
                                    paket?.tahun_anggaran ?? tahunSekarang
                                }
                                required
                            />

                            <InputError message={errors.tahun_anggaran} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="nama">Nama Paket</Label>

                        <Input
                            id="nama"
                            name="nama"
                            defaultValue={paket?.nama}
                            required
                            placeholder="Pembangunan Gedung Kantor"
                        />

                        <InputError message={errors.nama} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="lokasi">Lokasi</Label>

                            <Input
                                id="lokasi"
                                name="lokasi"
                                defaultValue={paket?.lokasi ?? ''}
                                placeholder="Jl. Merdeka No. 10"
                            />

                            <InputError message={errors.lokasi} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="penyedia">Penyedia</Label>

                            <Input
                                id="penyedia"
                                name="penyedia"
                                defaultValue={paket?.penyedia ?? ''}
                                placeholder="CV Karya Utama"
                            />

                            <InputError message={errors.penyedia} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="nilai_kontrak">
                                Nilai Kontrak (Rp)
                            </Label>

                            <Input
                                id="nilai_kontrak"
                                name="nilai_kontrak"
                                type="number"
                                min={0}
                                step={1}
                                defaultValue={paket?.nilai_kontrak ?? 0}
                                required
                            />

                            <InputError message={errors.nilai_kontrak} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="progres">Progres (%)</Label>

                            <Input
                                id="progres"
                                name="progres"
                                type="number"
                                min={0}
                                max={100}
                                defaultValue={paket?.progres ?? 0}
                                required
                            />

                            <InputError message={errors.progres} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>

                            <Select
                                name="status"
                                defaultValue={paket?.status ?? 'aktif'}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>

                                <SelectContent>
                                    {statusOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <InputError message={errors.status} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>

                            <Input
                                id="tanggal_mulai"
                                name="tanggal_mulai"
                                type="date"
                                defaultValue={paket?.tanggal_mulai ?? ''}
                            />

                            <InputError message={errors.tanggal_mulai} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="tanggal_selesai">
                                Tanggal Selesai
                            </Label>

                            <Input
                                id="tanggal_selesai"
                                name="tanggal_selesai"
                                type="date"
                                defaultValue={paket?.tanggal_selesai ?? ''}
                            />

                            <InputError message={errors.tanggal_selesai} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="keterangan">Keterangan</Label>

                        <Textarea
                            id="keterangan"
                            name="keterangan"
                            rows={3}
                            defaultValue={paket?.keterangan ?? ''}
                            placeholder="Catatan tambahan mengenai paket ini."
                        />

                        <InputError message={errors.keterangan} />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing}>
                            {submitLabel}
                        </Button>

                        <Button variant="outline" asChild>
                            <Link href={index()}>Batal</Link>
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
