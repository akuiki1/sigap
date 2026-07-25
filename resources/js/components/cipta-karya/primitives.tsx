import { Link } from '@inertiajs/react';
import type { CSSProperties, ReactNode } from 'react';
import type { StatusVerifikasi } from '@/types';
import { ckColors } from './tokens';

/** Kartu putih membulat dengan bayangan tipis — unit visual dasar halaman ini. */
export function CkCard({
    children,
    style,
    padded = false,
}: {
    children: ReactNode;
    style?: CSSProperties;
    padded?: boolean;
}) {
    return (
        <div
            style={{
                background: '#fff',
                borderRadius: 16,
                overflow: padded ? undefined : 'hidden',
                boxShadow: ckColors.cardShadow,
                padding: padded ? '18px 20px 16px' : undefined,
                ...style,
            }}
        >
            {children}
        </div>
    );
}

/** Label kecil abu-abu di atas sebuah kartu/daftar, mis. "Semua paket · TA 2026". */
export function CkSectionLabel({
    children,
    style,
}: {
    children: ReactNode;
    style?: CSSProperties;
}) {
    return (
        <div
            style={{
                fontSize: 13,
                color: ckColors.textMuted2,
                fontWeight: 530,
                margin: '0 0 8px 6px',
                letterSpacing: '.01em',
                ...style,
            }}
        >
            {children}
        </div>
    );
}

export function CkChevron() {
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

/** Satu baris dalam daftar bergaya kartu, dengan border atas & hover. */
export function CkRow({
    children,
    href,
    first = false,
}: {
    children: ReactNode;
    href?: string;
    first?: boolean;
}) {
    const style: CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        padding: '14px 18px',
        borderTop: first ? undefined : `1px solid ${ckColors.border}`,
        cursor: href ? 'pointer' : undefined,
    };

    if (href) {
        return (
            <Link href={href} className="ck-row" style={style}>
                {children}
            </Link>
        );
    }

    return <div style={style}>{children}</div>;
}

const verifikasiTone: Record<StatusVerifikasi, { fg: string; bg: string }> = {
    diajukan: { fg: ckColors.warn, bg: ckColors.warnSoft },
    diverifikasi: { fg: ckColors.accent, bg: ckColors.accentSoft },
    ditolak: { fg: ckColors.danger, bg: ckColors.dangerSoft },
};

/** Label kecil berwarna untuk status_verifikasi (berkas maupun entri progres). */
export function VerifikasiBadge({
    status,
    label,
}: {
    status: StatusVerifikasi;
    label: string;
}) {
    const tone = verifikasiTone[status];

    return (
        <span
            style={{
                fontSize: 11.5,
                fontWeight: 590,
                padding: '2px 8px',
                borderRadius: 999,
                color: tone.fg,
                background: tone.bg,
                whiteSpace: 'nowrap',
            }}
        >
            {label}
        </span>
    );
}
