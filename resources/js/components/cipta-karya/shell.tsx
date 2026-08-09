import type { CSSProperties, ReactNode } from 'react';
import './cipta-karya.css';
import { CiptaKaryaSidebar } from './sidebar';
import type { CiptaKaryaNavKey } from './sidebar';
import { ckColors, ckFont } from './tokens';

/**
 * Kerangka semua layar "Cipta Karya": kanvas hangat + sidebar tanpa latar +
 * panel putih yang mengambang di sebelah kanan.
 *
 * Dulu tiap halaman menyusun sendiri `<div flex><Sidebar/><main/></div>`, dan
 * chrome-nya jadi tersalin tujuh kali. Disatukan di sini supaya perubahan
 * kerangka (mis. radius panel atau warna kanvas) cukup satu tempat.
 */
export function CiptaKaryaShell({
    active,
    children,
    mainStyle,
}: {
    active: CiptaKaryaNavKey;
    children: ReactNode;
    /** Tambahan gaya untuk <main>, mis. `position: relative` bagi header lengket. */
    mainStyle?: CSSProperties;
}) {
    return (
        <div
            style={{
                display: 'flex',
                height: '100vh',
                width: '100%',
                background: ckColors.canvas,
                color: ckColors.text,
                overflow: 'hidden',
                fontFamily: ckFont,
                WebkitFontSmoothing: 'antialiased',
            }}
        >
            <CiptaKaryaSidebar active={active} />

            <main
                style={{
                    flex: 1,
                    minWidth: 0,
                    overflowY: 'auto',
                    background: ckColors.bg,
                    borderRadius: 18,
                    // Tanpa margin kiri: jarak ke sidebar sudah datang dari
                    // padding sidebar itu sendiri.
                    margin: '10px 10px 10px 0',
                    boxShadow: ckColors.panelShadow,
                    ...mainStyle,
                }}
            >
                {children}
            </main>
        </div>
    );
}
