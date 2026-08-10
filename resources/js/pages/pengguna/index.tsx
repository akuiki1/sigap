import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import {
    CkButton,
    CkDialog,
    CkDialogBody,
    CkDialogClose,
    CkDialogContent,
    CkDialogDescription,
    CkDialogFooter,
    CkDialogTitle,
    CkField,
    CkInput,
} from '@/components/cipta-karya/ck-dialog';
import { CkCard, CkRow } from '@/components/cipta-karya/primitives';
import { CiptaKaryaShell } from '@/components/cipta-karya/shell';
import { ckColors } from '@/components/cipta-karya/tokens';
import { destroy, store, update } from '@/routes/pengguna';
import type { Opsi, Role } from '@/types';

type PenggunaRow = {
    id: number;
    name: string;
    email: string;
    role: Role;
    role_label: string;
    diri_sendiri: boolean;
    /** Hasil UserPolicy::update — jangan hitung ulang aturan perannya di sini. */
    boleh_ubah: boolean;
    /** Hasil UserPolicy::delete. */
    boleh_hapus: boolean;
    dibuat_pada: string | null;
};

const kontrolStyle: CSSProperties = {
    padding: '7px 10px',
    borderRadius: 10,
    border: `1px solid ${ckColors.border}`,
    background: '#fff',
    color: ckColors.text,
    fontSize: 13,
    fontWeight: 520,
    fontFamily: 'inherit',
    outline: 'none',
};

export default function PenggunaIndex({
    pengguna,
    roleOptions,
}: {
    pengguna: PenggunaRow[];
    roleOptions: Opsi[];
}) {
    const [buatBuka, setBuatBuka] = useState(false);
    const [hapusTarget, setHapusTarget] = useState<PenggunaRow | null>(null);

    return (
        <>
            <Head title="Pengguna" />

            <CiptaKaryaShell active="pengguna">
                <div
                    style={{
                        maxWidth: 980,
                        margin: '0 auto',
                        padding: '38px 40px 72px',
                    }}
                >
                    <header
                        style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'space-between',
                            gap: 24,
                            marginBottom: 22,
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: 13,
                                    fontWeight: 520,
                                    color: ckColors.textMuted,
                                    letterSpacing: '.01em',
                                }}
                            >
                                Kelola akses · Bidang Cipta Karya
                            </div>
                            <h1
                                style={{
                                    fontSize: 28,
                                    fontWeight: 680,
                                    letterSpacing: '-.025em',
                                    color: ckColors.text,
                                    marginTop: 3,
                                    marginBottom: 6,
                                }}
                            >
                                Pengguna
                            </h1>
                            <p
                                style={{
                                    fontSize: 13.5,
                                    color: ckColors.textMuted2,
                                    margin: 0,
                                    maxWidth: 560,
                                    lineHeight: 1.5,
                                }}
                            >
                                Operator mengelola seluruh data paket.
                                Administrator sama, ditambah kelola akun di
                                halaman ini. Pendaftaran mandiri ditutup — akun
                                hanya dibuat dari sini.
                            </p>
                        </div>

                        <CkButton
                            onClick={() => setBuatBuka(true)}
                            style={{ flex: 'none' }}
                        >
                            Tambah akun
                        </CkButton>
                    </header>

                    <CkCard>
                        {pengguna.map((baris, i) => (
                            <CkRow key={baris.id} first={i === 0}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 7,
                                            fontSize: 15,
                                            fontWeight: 570,
                                            letterSpacing: '-.015em',
                                            color: ckColors.text,
                                        }}
                                    >
                                        {baris.name}
                                        {baris.diri_sendiri && (
                                            <span
                                                style={{
                                                    fontSize: 11,
                                                    fontWeight: 590,
                                                    padding: '1.5px 7px',
                                                    borderRadius: 999,
                                                    color: ckColors.accent,
                                                    background:
                                                        ckColors.accentSoft,
                                                }}
                                            >
                                                Anda
                                            </span>
                                        )}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 12.5,
                                            color: ckColors.textMuted2,
                                            marginTop: 3,
                                        }}
                                    >
                                        {baris.email}
                                        {baris.dibuat_pada && (
                                            <> · dibuat {baris.dibuat_pada}</>
                                        )}
                                    </div>
                                </div>

                                {baris.boleh_ubah ? (
                                    <select
                                        className="ck-kontrol"
                                        aria-label={`Peran ${baris.name}`}
                                        value={baris.role}
                                        onChange={(e) =>
                                            router.patch(
                                                update(baris.id).url,
                                                { role: e.target.value },
                                                { preserveScroll: true },
                                            )
                                        }
                                        style={{
                                            ...kontrolStyle,
                                            flex: 'none',
                                        }}
                                    >
                                        {roleOptions.map((opsi) => (
                                            <option
                                                key={opsi.value}
                                                value={opsi.value}
                                            >
                                                {opsi.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    /* Peran diri sendiri tidak bisa diubah —
                                       itu yang menjaga admin terakhir tetap
                                       ada (lihat UserPolicy::update). */
                                    <span
                                        style={{
                                            flex: 'none',
                                            fontSize: 13,
                                            fontWeight: 540,
                                            color: ckColors.textMuted,
                                            padding: '7px 10px',
                                        }}
                                    >
                                        {baris.role_label}
                                    </span>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setHapusTarget(baris)}
                                    disabled={!baris.boleh_hapus}
                                    style={{
                                        flex: 'none',
                                        width: 62,
                                        textAlign: 'right',
                                        background: 'none',
                                        border: 'none',
                                        padding: 0,
                                        font: 'inherit',
                                        fontSize: 13,
                                        fontWeight: 520,
                                        color: baris.boleh_hapus
                                            ? ckColors.danger
                                            : ckColors.textMuted7,
                                        cursor: baris.boleh_hapus
                                            ? 'pointer'
                                            : 'not-allowed',
                                    }}
                                >
                                    Hapus
                                </button>
                            </CkRow>
                        ))}
                    </CkCard>
                </div>
            </CiptaKaryaShell>

            <DialogBuatAkun
                buka={buatBuka}
                onBuka={setBuatBuka}
                roleOptions={roleOptions}
            />

            <DialogHapus
                target={hapusTarget}
                onTutup={() => setHapusTarget(null)}
            />
        </>
    );
}

function DialogBuatAkun({
    buka,
    onBuka,
    roleOptions,
}: {
    buka: boolean;
    onBuka: (buka: boolean) => void;
    roleOptions: Opsi[];
}) {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'operator',
    });

    function kirim(e: FormEvent) {
        e.preventDefault();

        form.post(store().url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onBuka(false);
            },
        });
    }

    return (
        <CkDialog
            open={buka}
            onOpenChange={(nilai) => {
                // Galat & isian dibuang saat dialog ditutup: membukanya lagi
                // harus terasa seperti form baru, bukan lanjutan percobaan tadi.
                if (!nilai) {
                    form.reset();
                    form.clearErrors();
                }

                onBuka(nilai);
            }}
        >
            <CkDialogContent>
                <CkDialogTitle>Tambah akun</CkDialogTitle>
                <CkDialogDescription>
                    Akun langsung aktif tanpa verifikasi surel. Sampaikan kata
                    sandi awalnya ke yang bersangkutan agar bisa diganti sendiri
                    lewat Pengaturan.
                </CkDialogDescription>

                <form onSubmit={kirim}>
                    <CkDialogBody>
                        <CkField label="Nama" error={form.errors.name}>
                            <CkInput
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                autoComplete="off"
                                required
                            />
                        </CkField>

                        <CkField label="Email" error={form.errors.email}>
                            <CkInput
                                type="email"
                                value={form.data.email}
                                onChange={(e) =>
                                    form.setData('email', e.target.value)
                                }
                                autoComplete="off"
                                required
                            />
                        </CkField>

                        <CkField label="Peran" error={form.errors.role}>
                            <select
                                className="ck-kontrol"
                                value={form.data.role}
                                onChange={(e) =>
                                    form.setData('role', e.target.value)
                                }
                                style={{
                                    ...kontrolStyle,
                                    width: '100%',
                                    padding: '9px 11px',
                                    fontSize: 14,
                                    fontWeight: 400,
                                    border: '1px solid rgba(0,0,0,.13)',
                                }}
                            >
                                {roleOptions.map((opsi) => (
                                    <option key={opsi.value} value={opsi.value}>
                                        {opsi.label}
                                    </option>
                                ))}
                            </select>
                        </CkField>

                        <CkField
                            label="Kata sandi"
                            error={form.errors.password}
                        >
                            <CkInput
                                type="password"
                                value={form.data.password}
                                onChange={(e) =>
                                    form.setData('password', e.target.value)
                                }
                                autoComplete="new-password"
                                required
                            />
                        </CkField>

                        <CkField label="Ulangi kata sandi">
                            <CkInput
                                type="password"
                                value={form.data.password_confirmation}
                                onChange={(e) =>
                                    form.setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                autoComplete="new-password"
                                required
                            />
                        </CkField>
                    </CkDialogBody>

                    <CkDialogFooter>
                        <CkDialogClose asChild>
                            <CkButton variant="ghost">Batal</CkButton>
                        </CkDialogClose>

                        <CkButton type="submit" disabled={form.processing}>
                            {form.processing ? 'Menyimpan…' : 'Buat akun'}
                        </CkButton>
                    </CkDialogFooter>
                </form>
            </CkDialogContent>
        </CkDialog>
    );
}

function DialogHapus({
    target,
    onTutup,
}: {
    target: PenggunaRow | null;
    onTutup: () => void;
}) {
    return (
        <CkDialog
            open={target !== null}
            onOpenChange={(nilai) => !nilai && onTutup()}
        >
            <CkDialogContent>
                <CkDialogTitle>Hapus akun ini?</CkDialogTitle>
                <CkDialogDescription>
                    Akun {target?.name} ({target?.email}) akan dihapus permanen.
                    Akun yang namanya sudah melekat pada berkas atau catatan
                    progres tidak bisa dihapus.
                </CkDialogDescription>

                <CkDialogFooter>
                    <CkDialogClose asChild>
                        <CkButton variant="ghost">Batal</CkButton>
                    </CkDialogClose>

                    <CkButton
                        variant="danger"
                        onClick={() => {
                            if (target === null) {
                                return;
                            }

                            router.delete(destroy(target.id).url, {
                                preserveScroll: true,
                                onFinish: onTutup,
                            });
                        }}
                    >
                        Hapus Akun
                    </CkButton>
                </CkDialogFooter>
            </CkDialogContent>
        </CkDialog>
    );
}
