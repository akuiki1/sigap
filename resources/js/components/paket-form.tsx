import { Form, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
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
import { ckColors } from '@/components/cipta-karya/tokens';

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

                    <div className="grid gap-2">
                        <Label htmlFor="alamat">Alamat Gedung</Label>

                        <Textarea
                            id="alamat"
                            name="alamat"
                            rows={2}
                            defaultValue={paket?.alamat ?? ''}
                            placeholder="Jl. Perwira No. 1, Barabai, Kab. Hulu Sungai Tengah"
                        />

                        <InputError message={errors.alamat} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="sumber_dana">Sumber Dana</Label>

                            <Input
                                id="sumber_dana"
                                name="sumber_dana"
                                defaultValue={paket?.sumber_dana ?? ''}
                                placeholder="DAU 2026"
                            />

                            <InputError message={errors.sumber_dana} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="no_kontrak">No. Kontrak</Label>

                            <Input
                                id="no_kontrak"
                                name="no_kontrak"
                                defaultValue={paket?.no_kontrak ?? ''}
                                placeholder="602/012/CK/2026"
                            />

                            <InputError message={errors.no_kontrak} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
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
                            <Label htmlFor="pagu">Pagu (Rp)</Label>

                            <Input
                                id="pagu"
                                name="pagu"
                                type="number"
                                min={0}
                                step={1}
                                defaultValue={paket?.pagu ?? ''}
                                placeholder="Plafon RUP/DPA, boleh dikosongkan"
                            />

                            <InputError message={errors.pagu} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
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

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="konsultan_pengawas">
                                Konsultan Pengawas
                            </Label>

                            <Input
                                id="konsultan_pengawas"
                                name="konsultan_pengawas"
                                defaultValue={paket?.konsultan_pengawas ?? ''}
                                placeholder="CV Rancang Banua"
                            />

                            <InputError message={errors.konsultan_pengawas} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="ppk">PPK</Label>

                            <Input
                                id="ppk"
                                name="ppk"
                                defaultValue={paket?.ppk ?? ''}
                                placeholder="H. Ahmad Fauzi, ST"
                            />

                            <InputError message={errors.ppk} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="pptk">PPTK</Label>

                            <Input
                                id="pptk"
                                name="pptk"
                                defaultValue={paket?.pptk ?? ''}
                            />

                            <InputError message={errors.pptk} />
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
                        <p className="text-sm text-muted-foreground">
                            Tanggal tahapan administrasi — dipakai untuk
                            linimasa & kurva-S di halaman detail paket.
                        </p>

                        <div className="grid gap-4 sm:grid-cols-4">
                            <div className="grid gap-2">
                                <Label htmlFor="tanggal_kontrak">
                                    Tanggal Kontrak
                                </Label>

                                <Input
                                    id="tanggal_kontrak"
                                    name="tanggal_kontrak"
                                    type="date"
                                    defaultValue={paket?.tanggal_kontrak ?? ''}
                                />

                                <InputError message={errors.tanggal_kontrak} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tanggal_spmk">
                                    Tanggal SPMK
                                </Label>

                                <Input
                                    id="tanggal_spmk"
                                    name="tanggal_spmk"
                                    type="date"
                                    defaultValue={paket?.tanggal_spmk ?? ''}
                                />

                                <InputError message={errors.tanggal_spmk} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tanggal_mc0">
                                    Tanggal MC-0
                                </Label>

                                <Input
                                    id="tanggal_mc0"
                                    name="tanggal_mc0"
                                    type="date"
                                    defaultValue={paket?.tanggal_mc0 ?? ''}
                                />

                                <InputError message={errors.tanggal_mc0} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tanggal_pho_rencana">
                                    PHO Rencana
                                </Label>

                                <Input
                                    id="tanggal_pho_rencana"
                                    name="tanggal_pho_rencana"
                                    type="date"
                                    defaultValue={
                                        paket?.tanggal_pho_rencana ?? ''
                                    }
                                />

                                <InputError
                                    message={errors.tanggal_pho_rencana}
                                />
                            </div>
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

                    <div className="flex items-center gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="ck-btn-accent"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '10px 20px',
                                borderRadius: 12,
                                background: ckColors.accent,
                                color: '#fff',
                                cursor: processing ? 'not-allowed' : 'pointer',
                                fontSize: 14,
                                fontWeight: 590,
                                letterSpacing: '-.01em',
                                border: 'none',
                                opacity: processing ? 0.6 : 1,
                            }}
                        >
                            {submitLabel}
                        </button>

                        <Link
                            href={index()}
                            className="ck-btn-accent"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '9px 18px',
                                borderRadius: 12,
                                border: `1px solid ${ckColors.border}`,
                                color: ckColors.text,
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 590,
                                letterSpacing: '-.01em',
                            }}
                        >
                            Batal
                        </Link>
                    </div>
                </>
            )}
        </Form>
    );
}
