import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editProfile } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import { CkCard } from './primitives';
import { CiptaKaryaShell } from './shell';
import { ckColors } from './tokens';

export type PengaturanTab = 'profil' | 'keamanan' | 'tampilan';

/**
 * Ketiganya route terpisah, bukan tab sisi klien seperti di detail paket:
 * `/settings/security` dijaga middleware RequirePassword sendiri, jadi
 * berpindah ke sana memang harus lewat kunjungan penuh.
 */
const TAB: { key: PengaturanTab; label: string; href: string }[] = [
    { key: 'profil', label: 'Profil', href: editProfile().url },
    { key: 'keamanan', label: 'Keamanan', href: editSecurity().url },
    { key: 'tampilan', label: 'Tampilan', href: editAppearance().url },
];

/**
 * Kerangka halaman Pengaturan. Dulu layar ini satu-satunya yang masih memakai
 * chrome shadcn bawaan starter kit (sidebar kiri + breadcrumb + nav pengaturan
 * sendiri), sehingga terasa datang dari aplikasi lain begitu dibuka dari
 * topbar Cipta Karya. Sekarang ikut CiptaKaryaShell seperti layar lain, dengan
 * navigasi antar-halamannya jadi tab di bawah judul.
 *
 * Tidak ada item topbar yang menyala saat halaman ini terbuka — Pengaturan
 * memang bukan bagian dari menu utama, pintunya dari dropdown avatar.
 */
export function PengaturanShell({
    aktif,
    children,
}: {
    aktif: PengaturanTab;
    children: ReactNode;
}) {
    return (
        <CiptaKaryaShell active="pengaturan">
            <div
                style={{
                    maxWidth: 760,
                    margin: '0 auto',
                    padding: '38px 40px 72px',
                }}
            >
                <div
                    style={{
                        fontSize: 13,
                        fontWeight: 520,
                        color: ckColors.textMuted,
                        letterSpacing: '.01em',
                    }}
                >
                    Akun Anda · Bidang Cipta Karya
                </div>
                <h1
                    style={{
                        fontSize: 28,
                        fontWeight: 680,
                        letterSpacing: '-.025em',
                        color: ckColors.text,
                        marginTop: 3,
                        marginBottom: 0,
                    }}
                >
                    Pengaturan
                </h1>

                <nav
                    style={{
                        display: 'flex',
                        gap: 4,
                        marginTop: 14,
                        borderBottom: `1px solid ${ckColors.border}`,
                    }}
                >
                    {TAB.map((tab) => {
                        const menyala = tab.key === aktif;

                        return (
                            <Link
                                key={tab.key}
                                href={tab.href}
                                className={
                                    menyala ? undefined : 'ck-link-accent'
                                }
                                style={{
                                    padding: '9px 14px 11px',
                                    borderBottom: `2px solid ${menyala ? ckColors.accent : 'transparent'}`,
                                    fontSize: 14,
                                    fontWeight: menyala ? 600 : 520,
                                    letterSpacing: '-.01em',
                                    color: menyala
                                        ? ckColors.accent
                                        : '#5F5D57',
                                    whiteSpace: 'nowrap',
                                    marginBottom: -1,
                                }}
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </nav>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 20,
                        marginTop: 24,
                    }}
                >
                    {children}
                </div>
            </div>
        </CiptaKaryaShell>
    );
}

/** Satu blok bersampul kartu di dalam halaman Pengaturan. */
export function PengaturanSeksi({
    judul,
    deskripsi,
    nada = 'biasa',
    children,
}: {
    judul: string;
    deskripsi?: string;
    /** `bahaya` untuk blok yang merusak data, mis. hapus akun. */
    nada?: 'biasa' | 'bahaya';
    children: ReactNode;
}) {
    const bahaya = nada === 'bahaya';

    return (
        <CkCard
            padded
            style={
                bahaya
                    ? { borderLeft: `3px solid ${ckColors.danger}` }
                    : undefined
            }
        >
            <h2
                style={{
                    fontSize: 15.5,
                    fontWeight: 600,
                    letterSpacing: '-.015em',
                    color: bahaya ? ckColors.danger : ckColors.text,
                    margin: 0,
                }}
            >
                {judul}
            </h2>

            {deskripsi && (
                <p
                    style={{
                        fontSize: 13.5,
                        color: ckColors.textMuted2,
                        lineHeight: 1.5,
                        margin: '4px 0 0',
                    }}
                >
                    {deskripsi}
                </p>
            )}

            <div style={{ marginTop: 16 }}>{children}</div>
        </CkCard>
    );
}
