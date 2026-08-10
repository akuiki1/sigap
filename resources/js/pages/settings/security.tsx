import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import {
    CkButton,
    CkField,
    CkPasswordInput,
} from '@/components/cipta-karya/ck-dialog';
import {
    PengaturanSeksi,
    PengaturanShell,
} from '@/components/cipta-karya/pengaturan-shell';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';

type Props = {
    passwordRules: string;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Keamanan" />

            <PengaturanShell aktif="keamanan">
                <PengaturanSeksi
                    judul="Ganti kata sandi"
                    deskripsi="Pakai kata sandi yang panjang dan tidak dipakai di layanan lain."
                >
                    <Form
                        {...SecurityController.update.form()}
                        options={{ preserveScroll: true }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                    >
                        {({ errors, processing }) => (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 14,
                                }}
                            >
                                <CkField
                                    label="Kata sandi saat ini"
                                    error={errors.current_password}
                                >
                                    <CkPasswordInput
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        autoComplete="current-password"
                                    />
                                </CkField>

                                <CkField
                                    label="Kata sandi baru"
                                    error={errors.password}
                                >
                                    <CkPasswordInput
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        autoComplete="new-password"
                                        passwordrules={props.passwordRules}
                                    />
                                </CkField>

                                <CkField
                                    label="Ulangi kata sandi baru"
                                    error={errors.password_confirmation}
                                >
                                    <CkPasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        autoComplete="new-password"
                                        passwordrules={props.passwordRules}
                                    />
                                </CkField>

                                <div style={{ marginTop: 2 }}>
                                    <CkButton
                                        type="submit"
                                        disabled={processing}
                                        data-test="update-password-button"
                                    >
                                        {processing
                                            ? 'Menyimpan…'
                                            : 'Simpan kata sandi'}
                                    </CkButton>
                                </div>
                            </div>
                        )}
                    </Form>
                </PengaturanSeksi>

                <ManageTwoFactor
                    canManageTwoFactor={props.canManageTwoFactor}
                    requiresConfirmation={props.requiresConfirmation}
                    twoFactorEnabled={props.twoFactorEnabled}
                />

                <ManagePasskeys
                    canManagePasskeys={props.canManagePasskeys}
                    passkeys={props.passkeys}
                />
            </PengaturanShell>
        </>
    );
}
