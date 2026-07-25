import { Link, usePage } from '@inertiajs/react';
import type { CSSProperties, ReactNode } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { dashboard } from '@/routes';
import { review } from '@/routes/audit';
import { index as paketIndex } from '@/routes/paket';
import './cipta-karya.css';
import { ckColors } from './tokens';

export type CiptaKaryaNavKey = 'ringkasan' | 'paket' | 'audit';

const iconStyle: CSSProperties = { flex: 'none' };

function IconRingkasan() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
            style={iconStyle}
        >
            <rect x="2.6" y="2.6" width="6.3" height="6.3" rx="2" />
            <rect x="11.1" y="2.6" width="6.3" height="6.3" rx="2" />
            <rect x="2.6" y="11.1" width="6.3" height="6.3" rx="2" />
            <rect x="11.1" y="11.1" width="6.3" height="6.3" rx="2" />
        </svg>
    );
}

function IconPaket() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            style={iconStyle}
        >
            <path d="M7 5h10M7 10h10M7 15h10" />
            <circle
                cx="3.5"
                cy="5"
                r="1.15"
                fill="currentColor"
                stroke="none"
            />
            <circle
                cx="3.5"
                cy="10"
                r="1.15"
                fill="currentColor"
                stroke="none"
            />
            <circle
                cx="3.5"
                cy="15"
                r="1.15"
                fill="currentColor"
                stroke="none"
            />
        </svg>
    );
}

function IconDokumen() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={iconStyle}
        >
            <path d="M5.5 3.3h5.4l3.6 3.6v9.3a.9.9 0 0 1-.9.9H5.5a.9.9 0 0 1-.9-.9V4.2a.9.9 0 0 1 .9-.9z" />
            <path d="M10.7 3.4V7H14.3" />
            <path d="M7.4 11h5.2M7.4 13.7h5.2" />
        </svg>
    );
}

function IconPembayaran() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            style={iconStyle}
        >
            <rect x="2.5" y="5" width="15" height="10" rx="2.5" />
            <path d="M2.5 8.4h15" />
        </svg>
    );
}

function IconAudit() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={iconStyle}
        >
            <circle cx="10" cy="10" r="7.1" />
            <path d="M6.7 10.2l2.2 2.2 4.3-4.7" />
        </svg>
    );
}

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
            style={iconStyle}
        >
            <path d="M1 1l5 5-5 5" />
        </svg>
    );
}

function NavRow({
    icon,
    label,
    active,
    href,
}: {
    icon: ReactNode;
    label: string;
    active?: boolean;
    href?: string;
}) {
    const content = (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '9px 12px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: active ? 590 : 510,
                letterSpacing: '-.01em',
                background: active ? ckColors.accentSoft : 'transparent',
                color: active ? ckColors.accent : '#5F5D57',
                cursor: href ? 'pointer' : 'default',
                transition: 'background-color .12s ease',
            }}
            className={href && !active ? 'ck-nav-row' : undefined}
        >
            {icon}
            {label}
        </div>
    );

    if (!href) {
        return content;
    }

    return (
        <Link href={href} style={{ display: 'block' }}>
            {content}
        </Link>
    );
}

export function CiptaKaryaSidebar({ active }: { active: CiptaKaryaNavKey }) {
    const { auth } = usePage().props;
    const getInitials = useInitials();

    return (
        <aside
            style={{
                width: 252,
                flex: 'none',
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 12px 14px',
                background: 'rgba(255,255,255,.72)',
                backdropFilter: 'blur(28px) saturate(180%)',
                WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                borderRight: `1px solid ${ckColors.borderSoft}`,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 11,
                    padding: '6px 8px 2px',
                }}
            >
                <img
                    src="/images/cipta-karya/lambang-hst.png"
                    alt="Lambang Kabupaten Hulu Sungai Tengah"
                    style={{ height: 32, width: 'auto', flex: 'none' }}
                />
                <div style={{ minWidth: 0, lineHeight: 1.25 }}>
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
                    <div
                        style={{
                            fontSize: 11.5,
                            color: ckColors.textMuted,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        Dinas PUPR · Kab. HST
                    </div>
                </div>
            </div>

            <nav
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    marginTop: 22,
                }}
            >
                <NavRow
                    icon={<IconRingkasan />}
                    label="Ringkasan"
                    active={active === 'ringkasan'}
                    href={dashboard().url}
                />
                <NavRow
                    icon={<IconPaket />}
                    label="Paket"
                    active={active === 'paket'}
                    href={paketIndex().url}
                />
                <NavRow icon={<IconDokumen />} label="Dokumen" />
                <NavRow icon={<IconPembayaran />} label="Pembayaran" />
                <NavRow
                    icon={<IconAudit />}
                    label="Mode audit"
                    active={active === 'audit'}
                    href={review().url}
                />
            </nav>

            <div style={{ flex: 1 }} />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="ck-nav-row"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: 8,
                            borderRadius: 12,
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            font: 'inherit',
                            textAlign: 'left',
                            width: '100%',
                        }}
                    >
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                flex: 'none',
                                background: ckColors.accentSoft,
                                color: ckColors.accent,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 13,
                                fontWeight: 640,
                                letterSpacing: '.01em',
                            }}
                        >
                            {getInitials(auth.user.name)}
                        </div>
                        <div style={{ minWidth: 0, lineHeight: 1.3, flex: 1 }}>
                            <div
                                style={{
                                    fontSize: 13,
                                    fontWeight: 560,
                                    color: ckColors.text,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {auth.user.name}
                            </div>
                            <div
                                style={{
                                    fontSize: 11,
                                    color: ckColors.textMuted,
                                }}
                            >
                                {auth.user.role_label}
                            </div>
                        </div>
                        <ChevronRight />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-56 rounded-lg"
                    align="end"
                    side="top"
                >
                    <UserMenuContent user={auth.user} />
                </DropdownMenuContent>
            </DropdownMenu>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 8px 2px',
                    marginTop: 8,
                    borderTop: `1px solid ${ckColors.borderSoft}`,
                }}
            >
                <img
                    src="/images/cipta-karya/logo-pu.jpg"
                    alt="Kementerian Pekerjaan Umum"
                    style={{
                        height: 20,
                        width: 20,
                        borderRadius: 4,
                        flex: 'none',
                    }}
                />
                <div
                    style={{
                        fontSize: 10.5,
                        color: ckColors.textMuted4,
                        lineHeight: 1.3,
                    }}
                >
                    Terhubung dengan
                    <br />
                    Kementerian Pekerjaan Umum
                </div>
            </div>
        </aside>
    );
}
