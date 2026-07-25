import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { CSSProperties, ReactNode, Ref } from 'react';
import { ckColors, ckFont } from './tokens';

/**
 * Dialog & kontrol form bergaya "Cipta Karya".
 *
 * Dibangun langsung di atas Radix, bukan memakai `components/ui/dialog`:
 * dialog shadcn mewarisi tema Tailwind (termasuk mode gelap) sementara halaman
 * paket memakai palet sendiri di tokens.ts, sehingga modalnya terasa datang
 * dari aplikasi lain. Semua modal di halaman paket memakai berkas ini supaya
 * satu bahasa visual.
 */

export const CkDialog = DialogPrimitive.Root;
export const CkDialogClose = DialogPrimitive.Close;
export const CkDialogTrigger = DialogPrimitive.Trigger;

export function CkDialogContent({
    children,
    lebar = 460,
}: {
    children: ReactNode;
    /** Lebar maksimum kartu dialog; dinaikkan untuk form yang lebih padat. */
    lebar?: number;
}) {
    return (
        <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    background: 'rgba(29,28,26,.28)',
                    backdropFilter: 'blur(2px)',
                }}
            />
            <DialogPrimitive.Content
                className="ck-dialog-content"
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%,-50%)',
                    zIndex: 1001,
                    width: `min(${lebar}px, calc(100vw - 32px))`,
                    maxHeight: 'calc(100vh - 48px)',
                    overflowY: 'auto',
                    background: '#fff',
                    borderRadius: 16,
                    boxShadow:
                        '0 1px 1.5px rgba(30,25,15,.05), 0 12px 40px rgba(30,25,15,.16)',
                    padding: '22px 24px 20px',
                    fontFamily: ckFont,
                    color: ckColors.text,
                    WebkitFontSmoothing: 'antialiased',
                }}
            >
                {children}
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
    );
}

export function CkDialogTitle({ children }: { children: ReactNode }) {
    return (
        <DialogPrimitive.Title
            style={{
                fontSize: 17,
                fontWeight: 650,
                letterSpacing: '-.015em',
                color: ckColors.text,
                margin: 0,
            }}
        >
            {children}
        </DialogPrimitive.Title>
    );
}

export function CkDialogDescription({ children }: { children: ReactNode }) {
    return (
        <DialogPrimitive.Description
            style={{
                fontSize: 13.5,
                color: ckColors.textMuted,
                margin: '5px 0 0',
                lineHeight: 1.45,
            }}
        >
            {children}
        </DialogPrimitive.Description>
    );
}

export function CkDialogBody({ children }: { children: ReactNode }) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 13,
                marginTop: 18,
            }}
        >
            {children}
        </div>
    );
}

export function CkDialogFooter({ children }: { children: ReactNode }) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 9,
                marginTop: 20,
            }}
        >
            {children}
        </div>
    );
}

/** Label + kontrol + pesan galat, tata letaknya seragam di semua form. */
export function CkField({
    label,
    error,
    hint,
    children,
    style,
}: {
    label: string;
    error?: string;
    hint?: string;
    children: ReactNode;
    style?: CSSProperties;
}) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                minWidth: 0,
                ...style,
            }}
        >
            <span
                style={{
                    fontSize: 12.5,
                    fontWeight: 540,
                    color: ckColors.textMuted2,
                    letterSpacing: '.01em',
                }}
            >
                {label}
            </span>

            {children}

            {hint && !error && (
                <span style={{ fontSize: 12, color: ckColors.textMuted5 }}>
                    {hint}
                </span>
            )}

            {error && (
                <span style={{ fontSize: 12, color: ckColors.danger }}>
                    {error}
                </span>
            )}
        </div>
    );
}

const kontrolStyle: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 11px',
    borderRadius: 10,
    border: `1px solid rgba(0,0,0,.13)`,
    background: '#fff',
    fontSize: 14,
    fontFamily: 'inherit',
    color: ckColors.text,
    outline: 'none',
};

export function CkInput({
    ref,
    style,
    ...props
}: React.ComponentProps<'input'> & { ref?: Ref<HTMLInputElement> }) {
    return (
        <input
            ref={ref}
            className="ck-kontrol"
            style={{ ...kontrolStyle, ...style }}
            {...props}
        />
    );
}

export function CkTextarea({
    ref,
    style,
    ...props
}: React.ComponentProps<'textarea'> & { ref?: Ref<HTMLTextAreaElement> }) {
    return (
        <textarea
            ref={ref}
            className="ck-kontrol"
            style={{ ...kontrolStyle, resize: 'vertical', ...style }}
            {...props}
        />
    );
}

export function CkFileInput({
    ref,
    ...props
}: React.ComponentProps<'input'> & { ref?: Ref<HTMLInputElement> }) {
    return (
        <input
            ref={ref}
            type="file"
            className="ck-kontrol ck-file"
            style={{ ...kontrolStyle, padding: '8px 11px', fontSize: 13 }}
            {...props}
        />
    );
}

type CkButtonVariant = 'primary' | 'ghost' | 'danger';

const variantStyle: Record<CkButtonVariant, CSSProperties> = {
    primary: {
        background: ckColors.accent,
        color: '#fff',
        border: '1px solid transparent',
    },
    ghost: {
        background: '#fff',
        color: ckColors.text,
        border: `1px solid rgba(0,0,0,.13)`,
    },
    danger: {
        background: ckColors.danger,
        color: '#fff',
        border: '1px solid transparent',
    },
};

export function CkButton({
    variant = 'primary',
    style,
    ...props
}: React.ComponentProps<'button'> & { variant?: CkButtonVariant }) {
    return (
        <button
            type="button"
            className="ck-btn"
            style={{
                padding: '9px 16px',
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 570,
                fontFamily: 'inherit',
                letterSpacing: '-.01em',
                cursor: props.disabled ? 'not-allowed' : 'pointer',
                opacity: props.disabled ? 0.55 : 1,
                ...variantStyle[variant],
                ...style,
            }}
            {...props}
        />
    );
}
