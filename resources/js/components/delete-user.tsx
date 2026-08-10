import { Form } from '@inertiajs/react';
import { useRef, useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import {
    CkButton,
    CkDialog,
    CkDialogContent,
    CkDialogDescription,
    CkDialogTitle,
    CkField,
    CkPasswordInput,
} from '@/components/cipta-karya/ck-dialog';
import { PengaturanSeksi } from '@/components/cipta-karya/pengaturan-shell';
import { ckColors } from '@/components/cipta-karya/tokens';

/**
 * Hapus akun sendiri. Admin terakhir ditolak di
 * App\Http\Requests\Settings\ProfileDeleteRequest — pesannya muncul sebagai
 * galat pada kolom kata sandi di dialog ini.
 */
export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const [buka, setBuka] = useState(false);

    return (
        <PengaturanSeksi
            judul="Hapus akun"
            deskripsi="Akun beserta akses ke seluruh data paket dihapus permanen dan tidak bisa dikembalikan."
            nada="bahaya"
        >
            <CkButton
                variant="danger"
                onClick={() => setBuka(true)}
                data-test="delete-user-button"
            >
                Hapus akun saya
            </CkButton>

            <CkDialog open={buka} onOpenChange={setBuka}>
                <CkDialogContent>
                    <CkDialogTitle>Hapus akun ini?</CkDialogTitle>
                    <CkDialogDescription>
                        Masukkan kata sandi Anda untuk mengonfirmasi. Setelah
                        dihapus, akun dan seluruh aksesnya hilang permanen.
                    </CkDialogDescription>

                    <Form
                        {...ProfileController.destroy.form()}
                        options={{ preserveScroll: true }}
                        onError={() => passwordInput.current?.focus()}
                        resetOnSuccess
                    >
                        {({ resetAndClearErrors, processing, errors }) => (
                            <>
                                <div style={{ marginTop: 18 }}>
                                    <CkField
                                        label="Kata sandi"
                                        error={errors.password}
                                    >
                                        <CkPasswordInput
                                            id="password"
                                            name="password"
                                            ref={passwordInput}
                                            autoComplete="current-password"
                                        />
                                    </CkField>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        gap: 9,
                                        marginTop: 20,
                                    }}
                                >
                                    <CkButton
                                        variant="ghost"
                                        onClick={() => {
                                            resetAndClearErrors();
                                            setBuka(false);
                                        }}
                                    >
                                        Batal
                                    </CkButton>

                                    <CkButton
                                        type="submit"
                                        variant="danger"
                                        disabled={processing}
                                        data-test="confirm-delete-user-button"
                                        style={{ color: '#fff' }}
                                    >
                                        {processing
                                            ? 'Menghapus…'
                                            : 'Hapus Akun'}
                                    </CkButton>
                                </div>
                            </>
                        )}
                    </Form>
                </CkDialogContent>
            </CkDialog>

            <p
                style={{
                    fontSize: 12.5,
                    color: ckColors.textMuted3,
                    lineHeight: 1.5,
                    margin: '12px 0 0',
                }}
            >
                Administrator terakhir tidak bisa menghapus akunnya sendiri —
                angkat administrator lain lebih dulu lewat halaman Pengguna.
            </p>
        </PengaturanSeksi>
    );
}
