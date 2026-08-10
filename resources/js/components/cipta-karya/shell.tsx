import type { CSSProperties, ReactNode } from 'react';
import './cipta-karya.css';
import { ckColors, ckFont } from './tokens';
import { CiptaKaryaTopbar } from './topbar';
import type { CiptaKaryaNavKey } from './topbar';

/**
 * Kerangka semua layar "Cipta Karya": kanvas hangat dengan satu panel putih
 * membulat yang mengambang di atasnya, berisi topbar navigasi lalu isi halaman.
 *
 * Dulu tiap halaman menyusun sendiri `<div flex><Sidebar/><main/></div>`, dan
 * chrome-nya jadi tersalin tujuh kali. Disatukan di sini supaya perubahan
 * kerangka (mis. radius panel atau warna kanvas) cukup satu tempat.
 */
export function CiptaKaryaShell({
    active,
    aksi,
    children,
    mainStyle,
}: {
    active: CiptaKaryaNavKey;
    /** Kontrol khas halaman untuk sisi kanan topbar, mis. kolom cari. */
    aksi?: ReactNode;
    children: ReactNode;
    /** Tambahan gaya untuk <main>, mis. `position: relative` bagi header lengket. */
    mainStyle?: CSSProperties;
}) {
    return (
        <div
            style={{
                height: '100vh',
                width: '100%',
                padding: 10,
                boxSizing: 'border-box',
                background: ckColors.canvas,
                color: ckColors.text,
                overflow: 'hidden',
                fontFamily: ckFont,
                WebkitFontSmoothing: 'antialiased',
            }}
        >
            <div
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: ckColors.bg,
                    borderRadius: 18,
                    boxShadow: ckColors.panelShadow,
                    overflow: 'hidden',
                }}
            >
                <CiptaKaryaTopbar active={active} aksi={aksi} />

                {/* <main> yang jadi kontainer gulir, bukan panelnya: topbar
                    harus tetap diam saat isi halaman digulir. */}
                <main
                    style={{
                        flex: 1,
                        minWidth: 0,
                        overflowY: 'auto',
                        ...mainStyle,
                    }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
