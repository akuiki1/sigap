import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { dashboard } from '@/routes';
import { review } from '@/routes/audit';
import { index as dokumenIndex } from '@/routes/dokumen';
import { index as paketIndex } from '@/routes/paket';
import './cipta-karya.css';
import { ckColors } from './tokens';

export type CiptaKaryaNavKey = 'ringkasan' | 'paket' | 'dokumen' | 'audit';

/**
 * Navigasi pindah dari sidebar 246px ke baris atas panel: dengan menunya
 * horizontal, lebar penuh panel bisa dipakai isi halaman — cukup untuk grid
 * kartu paket tiga kolom di Ringkasan.
 */
const MENU: { key: CiptaKaryaNavKey; label: string; href: string }[] = [
    { key: 'ringkasan', label: 'Ringkasan', href: dashboard().url },
    { key: 'paket', label: 'Paket', href: paketIndex().url },
    { key: 'dokumen', label: 'Dokumen', href: dokumenIndex().url },
    { key: 'audit', label: 'Mode audit', href: review().url },
];

function ChevronRight() {
    return (
        <svg
            width="7"
            height="12"
            viewBox="0 0 7 12"
            fill="none"
            stroke={ckColors.chevron}
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flex: 'none' }}
        >
            <path d="M1 1l5 5-5 5" />
        </svg>
    );
}

export function CiptaKaryaTopbar({
    active,
    aksi,
}: {
    active: CiptaKaryaNavKey;
    /** Kontrol khas halaman, mis. kolom cari & tombol "Paket baru". */
    aksi?: ReactNode;
}) {
    const { auth } = usePage().props;
    const getInitials = useInitials();

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                padding: '0 26px',
                height: 58,
                flex: 'none',
                borderBottom: `1px solid ${ckColors.border}`,
            }}
        >
            <Link
                href={dashboard()}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flex: 'none',
                }}
            >
                <img
                    src="/images/cipta-karya/lambang-hst.png"
                    alt="Lambang Kabupaten Hulu Sungai Tengah"
                    style={{ height: 26, width: 'auto', flex: 'none' }}
                />
                <div style={{ lineHeight: 1.2 }}>
                    <div
                        style={{
                            fontSize: 14.5,
                            fontWeight: 640,
                            letterSpacing: '-.01em',
                            color: ckColors.text,
                        }}
                    >
                        Cipta Karya
                    </div>
                    <div style={{ fontSize: 11, color: ckColors.textMuted }}>
                        Dinas PUPR · Kab. HST
                    </div>
                </div>
            </Link>

            <nav
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    minWidth: 0,
                    overflowX: 'auto',
                }}
            >
                {MENU.map((item) => {
                    const aktif = item.key === active;

                    return (
                        <Link
                            key={item.key}
                            href={item.href}
                            className={aktif ? undefined : 'ck-nav-row'}
                            style={{
                                padding: '6px 12px',
                                borderRadius: 9,
                                fontSize: 13.5,
                                fontWeight: aktif ? 590 : 520,
                                letterSpacing: '-.01em',
                                background: aktif
                                    ? ckColors.accentTint
                                    : 'transparent',
                                color: aktif ? ckColors.accent : '#5F5D57',
                                whiteSpace: 'nowrap',
                                transition: 'background-color .12s ease',
                            }}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div style={{ flex: 1 }} />

            {aksi}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="ck-nav-row"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '4px 8px 4px 4px',
                            borderRadius: 999,
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            font: 'inherit',
                            flex: 'none',
                        }}
                    >
                        <div
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                flex: 'none',
                                background: ckColors.accentSoft,
                                color: ckColors.accent,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                fontWeight: 640,
                            }}
                        >
                            {getInitials(auth.user.name)}
                        </div>
                        <ChevronRight />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-lg" align="end">
                    <UserMenuContent user={auth.user} />
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
