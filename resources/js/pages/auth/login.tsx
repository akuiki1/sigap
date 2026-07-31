import { Form, Head, Link, router } from '@inertiajs/react';
import { usePasskeyVerify } from '@laravel/passkeys/react';
import { useState } from 'react';
import { ckColors, ckFont, ckLogin } from '@/components/cipta-karya/tokens';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import '@/components/cipta-karya/cipta-karya.css';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

const gayaField: React.CSSProperties = {
    width: '100%',
    height: 44,
    padding: '0 13px',
    border: `1px solid ${ckLogin.borderField}`,
    borderRadius: 11,
    background: '#fff',
    fontFamily: 'inherit',
    fontSize: 14.5,
    color: ckColors.text,
    outline: 'none',
};

/** Label kecil di atas tiap field — 12.5px, abu kehijauan, seperti di mockup. */
function LabelField({ children }: { children: React.ReactNode }) {
    return (
        <span
            style={{
                fontSize: 12.5,
                fontWeight: 560,
                color: ckLogin.labelField,
            }}
        >
            {children}
        </span>
    );
}

/**
 * Opsi masuk dengan passkey. Memakai hook @laravel/passkeys langsung alih-alih
 * components/passkey-verify.tsx: komponen itu bergaya shadcn dan hanya rapi di
 * dalam AuthLayout, sedangkan halaman ini memakai palet Cipta Karya sendiri
 * (alasan yang sama seperti ck-dialog.tsx). Perilakunya identik.
 */
function MasukPasskey() {
    const { verify, isLoading, error, isSupported } = usePasskeyVerify({
        onSuccess: (response) => {
            router.visit(response.redirect ?? '/dashboard');
        },
    });

    if (!isSupported) {
        return null;
    }

    return (
        <div style={{ marginTop: 18 }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    margin: '0 0 15px',
                }}
            >
                <span
                    style={{ flex: 1, height: 1, background: ckColors.border }}
                />
                <span style={{ fontSize: 12, color: ckColors.textMuted4 }}>
                    atau
                </span>
                <span
                    style={{ flex: 1, height: 1, background: ckColors.border }}
                />
            </div>

            <button
                type="button"
                className="ck-login-passkey"
                onClick={verify}
                disabled={isLoading}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    height: 44,
                    border: `1px solid ${ckLogin.borderField}`,
                    borderRadius: 11,
                    background: '#fff',
                    color: ckColors.text,
                    fontFamily: 'inherit',
                    fontSize: 14.5,
                    fontWeight: 560,
                    cursor: 'pointer',
                }}
            >
                {isLoading ? (
                    <Spinner />
                ) : (
                    <svg
                        width="17"
                        height="17"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12.6" cy="7.4" r="4.4" />
                        <path d="M9.5 10.5L2.6 17.4v0h3.2v-1.8h1.8v-1.8h1.8z" />
                    </svg>
                )}
                {isLoading ? 'Memverifikasi…' : 'Masuk dengan passkey'}
            </button>
            <InputError
                message={error ?? undefined}
                className="mt-2 text-center"
            />
        </div>
    );
}

export default function Login({ status, canResetPassword }: Props) {
    const [lihatSandi, setLihatSandi] = useState(false);

    return (
        <>
            <Head title="Masuk" />

            <div
                style={{
                    display: 'flex',
                    minHeight: '100svh',
                    width: '100%',
                    background: '#fff',
                    color: ckColors.text,
                    fontFamily: ckFont,
                    WebkitFontSmoothing: 'antialiased',
                    overflow: 'hidden',
                }}
            >
                <div
                    className="ck-login-panel"
                    style={{
                        position: 'relative',
                        flex: '0 0 44%',
                        minWidth: 0,
                        padding: '40px 44px',
                        background: ckLogin.gradasi,
                        overflow: 'hidden',
                    }}
                >
                    <img
                        src="/images/cipta-karya/lambang-hst.png"
                        alt=""
                        style={{
                            position: 'absolute',
                            right: -90,
                            bottom: -70,
                            height: 520,
                            width: 'auto',
                            opacity: 0.07,
                            pointerEvents: 'none',
                        }}
                    />

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            position: 'relative',
                        }}
                    >
                        <img
                            src="/images/cipta-karya/lambang-hst.png"
                            alt="Lambang Kabupaten Hulu Sungai Tengah"
                            style={{ height: 40, width: 'auto', flex: 'none' }}
                        />
                        <div
                            style={{
                                lineHeight: 1.35,
                                color: '#fff',
                                maxWidth: 300,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 13.5,
                                    fontWeight: 600,
                                    letterSpacing: '-.012em',
                                }}
                            >
                                Pemerintah Kabupaten Hulu Sungai Tengah
                            </div>
                            <div
                                style={{
                                    fontSize: 12.5,
                                    color: ckLogin.atasGradasiRedup,
                                }}
                            >
                                Dinas Pekerjaan Umum dan Penataan Ruang
                            </div>
                        </div>
                    </div>

                    <div style={{ position: 'relative', maxWidth: 430 }}>
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 7,
                                padding: '5px 11px 5px 8px',
                                borderRadius: 100,
                                background: 'rgba(255,255,255,.12)',
                                color: 'rgba(255,255,255,.9)',
                                fontSize: 11.5,
                                fontWeight: 560,
                                letterSpacing: '.01em',
                                marginBottom: 20,
                            }}
                        >
                            <span
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    background: ckLogin.ok,
                                }}
                            />
                            Tahun Anggaran 2026
                        </div>
                        <h1
                            style={{
                                fontSize: 34,
                                fontWeight: 660,
                                letterSpacing: '-.025em',
                                lineHeight: 1.15,
                                color: '#fff',
                                textWrap: 'pretty',
                            }}
                        >
                            Satu pintu pemantauan pembangunan gedung daerah
                        </h1>
                        <p
                            style={{
                                marginTop: 14,
                                fontSize: 15,
                                lineHeight: 1.55,
                                color: ckLogin.atasGradasi,
                                textWrap: 'pretty',
                            }}
                        >
                            Progres fisik, keuangan, dan kelengkapan dokumen
                            setiap paket — tercatat rapi sejak DPA hingga serah
                            terima aset.
                        </p>
                    </div>

                    <div
                        style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                        }}
                    >
                        <img
                            src="/images/cipta-karya/logo-pu.jpg"
                            alt="Kementerian Pekerjaan Umum"
                            style={{
                                height: 26,
                                width: 26,
                                borderRadius: 5,
                                flex: 'none',
                            }}
                        />
                        <div
                            style={{
                                fontSize: 11.5,
                                lineHeight: 1.35,
                                color: ckLogin.atasGradasiPaling,
                            }}
                        >
                            Terhubung dengan
                            <br />
                            Kementerian Pekerjaan Umum
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        padding: '40px 32px',
                        background: ckLogin.kanvas,
                        overflowY: 'auto',
                    }}
                >
                    <div
                        style={{ width: '100%', maxWidth: 376, margin: 'auto' }}
                    >
                        <img
                            src="/images/cipta-karya/sigap-wordmark.png"
                            alt="SIGAP"
                            style={{
                                height: 30,
                                width: 'auto',
                                display: 'block',
                                marginBottom: 2,
                            }}
                        />
                        <div
                            style={{
                                fontSize: 12.5,
                                color: ckColors.textMuted,
                                letterSpacing: '.005em',
                            }}
                        >
                            Sistem Informasi Gedung dan Aset Pemerintah
                        </div>

                        <div style={{ marginTop: 34 }}>
                            <div
                                style={{
                                    fontSize: 23,
                                    fontWeight: 650,
                                    letterSpacing: '-.02em',
                                }}
                            >
                                Masuk
                            </div>
                            <div
                                style={{
                                    fontSize: 14,
                                    color: ckColors.textMuted,
                                    marginTop: 3,
                                }}
                            >
                                Gunakan akun SIGAP Bidang Cipta Karya.
                            </div>
                        </div>

                        {status && (
                            <div
                                style={{
                                    marginTop: 18,
                                    padding: '10px 13px',
                                    borderRadius: 11,
                                    background: ckColors.accentSoft,
                                    color: ckColors.accent,
                                    fontSize: 13.5,
                                    fontWeight: 530,
                                    lineHeight: 1.45,
                                }}
                            >
                                {status}
                            </div>
                        )}

                        <Form {...store.form()} resetOnSuccess={['password']}>
                            {({ processing, errors }) => (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 15,
                                        marginTop: 26,
                                    }}
                                >
                                    <label
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 7,
                                        }}
                                    >
                                        <LabelField>Alamat email</LabelField>
                                        <input
                                            className="ck-login-field"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="username"
                                            placeholder="nama@hstkab.go.id"
                                            style={gayaField}
                                        />
                                        <InputError message={errors.email} />
                                    </label>

                                    <label
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 7,
                                        }}
                                    >
                                        <LabelField>Kata sandi</LabelField>
                                        <span
                                            style={{
                                                position: 'relative',
                                                display: 'block',
                                            }}
                                        >
                                            <input
                                                className="ck-login-field"
                                                type={
                                                    lihatSandi
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                style={{
                                                    ...gayaField,
                                                    padding: '0 44px 0 13px',
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="ck-login-toggle"
                                                onClick={() =>
                                                    setLihatSandi((v) => !v)
                                                }
                                                tabIndex={-1}
                                                aria-label={
                                                    lihatSandi
                                                        ? 'Sembunyikan kata sandi'
                                                        : 'Tampilkan kata sandi'
                                                }
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 0,
                                                    height: 44,
                                                    width: 42,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: 'none',
                                                    background: 'none',
                                                    padding: 0,
                                                    cursor: 'pointer',
                                                    color: ckLogin.ikonField,
                                                }}
                                            >
                                                {lihatSandi ? (
                                                    <svg
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 20 20"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.6"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M8.2 4.8A7.5 7.5 0 0 1 10 4.6c5.1 0 8.2 5.4 8.2 5.4a14.9 14.9 0 0 1-2.4 3.1M5.1 5.4A14.7 14.7 0 0 0 1.8 10s3.1 5.4 8.2 5.4c1.6 0 3-.5 4.2-1.2" />
                                                        <path d="M8.2 8.2a2.6 2.6 0 0 0 3.6 3.6" />
                                                        <path d="M2.5 2.5l15 15" />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 20 20"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.6"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M1.8 10S4.9 4.6 10 4.6 18.2 10 18.2 10 15.1 15.4 10 15.4 1.8 10 1.8 10z" />
                                                        <circle
                                                            cx="10"
                                                            cy="10"
                                                            r="2.6"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                        </span>
                                        <InputError message={errors.password} />
                                    </label>

                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 12,
                                            marginTop: 1,
                                        }}
                                    >
                                        <label
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                cursor: 'pointer',
                                                fontSize: 13.5,
                                                color: ckLogin.labelField,
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                name="remember"
                                                tabIndex={3}
                                                style={{
                                                    width: 15,
                                                    height: 15,
                                                    accentColor:
                                                        ckColors.accent,
                                                    cursor: 'pointer',
                                                }}
                                            />
                                            Ingat perangkat ini
                                        </label>
                                        {canResetPassword && (
                                            <Link
                                                href={request()}
                                                tabIndex={5}
                                                style={{
                                                    fontSize: 13.5,
                                                    fontWeight: 540,
                                                    color: ckColors.accent,
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                Lupa kata sandi?
                                            </Link>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="ck-login-submit"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 8,
                                            width: '100%',
                                            height: 47,
                                            marginTop: 5,
                                            border: 'none',
                                            borderRadius: 12,
                                            background: ckColors.accent,
                                            color: '#fff',
                                            fontFamily: 'inherit',
                                            fontSize: 15.5,
                                            fontWeight: 600,
                                            letterSpacing: '-.01em',
                                            cursor: 'pointer',
                                            boxShadow:
                                                '0 1px 2px rgba(0,50,90,.24)',
                                        }}
                                    >
                                        {processing && <Spinner />}
                                        Masuk
                                    </button>
                                </div>
                            )}
                        </Form>

                        <MasukPasskey />

                        <div
                            style={{
                                marginTop: 22,
                                paddingTop: 16,
                                borderTop: `1px solid ${ckColors.border}`,
                                fontSize: 11.5,
                                lineHeight: 1.5,
                                color: ckColors.textMuted4,
                            }}
                        >
                            Akun dikelola Dinas PUPR Kabupaten HST. Hubungi
                            admin bidang bila akun terkunci.
                            <br />
                            SIGAP · Bidang Cipta Karya
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
