import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { CkButton, CkField, CkInput } from '@/components/cipta-karya/ck-dialog';
import {
    PengaturanSeksi,
    PengaturanShell,
} from '@/components/cipta-karya/pengaturan-shell';
import { ckColors } from '@/components/cipta-karya/tokens';
import DeleteUser from '@/components/delete-user';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Profil" />

            <PengaturanShell aktif="profil">
                <PengaturanSeksi
                    judul="Profil"
                    deskripsi="Nama dan alamat surel yang melekat pada akun Anda. Nama inilah yang tercatat sebagai pengunggah berkas dan pelapor progres."
                >
                    <Form
                        {...ProfileController.update.form()}
                        options={{ preserveScroll: true }}
                    >
                        {({ processing, errors }) => (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 14,
                                }}
                            >
                                <CkField label="Nama" error={errors.name}>
                                    <CkInput
                                        name="name"
                                        defaultValue={auth.user.name}
                                        autoComplete="name"
                                        required
                                    />
                                </CkField>

                                <CkField
                                    label="Alamat surel"
                                    error={errors.email}
                                >
                                    <CkInput
                                        type="email"
                                        name="email"
                                        defaultValue={auth.user.email}
                                        autoComplete="username"
                                        required
                                    />
                                </CkField>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div
                                            style={{
                                                fontSize: 13,
                                                color: ckColors.textMuted2,
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            Alamat surel ini belum
                                            terverifikasi.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="ck-link-accent"
                                                style={{
                                                    color: ckColors.accent,
                                                    fontWeight: 540,
                                                    background: 'none',
                                                    border: 'none',
                                                    padding: 0,
                                                    font: 'inherit',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Kirim ulang surel verifikasi.
                                            </Link>
                                            {status ===
                                                'verification-link-sent' && (
                                                <div
                                                    style={{
                                                        marginTop: 6,
                                                        fontWeight: 540,
                                                        color: ckColors.accent,
                                                    }}
                                                >
                                                    Tautan verifikasi baru sudah
                                                    dikirim.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div style={{ marginTop: 2 }}>
                                    <CkButton
                                        type="submit"
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        {processing ? 'Menyimpan…' : 'Simpan'}
                                    </CkButton>
                                </div>
                            </div>
                        )}
                    </Form>
                </PengaturanSeksi>

                <DeleteUser />
            </PengaturanShell>
        </>
    );
}
