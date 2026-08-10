import { Link } from '@inertiajs/react';
import { formatCurrencyCompact } from '@/lib/utils';
import { preview } from '@/routes/berkas';
import { show } from '@/routes/paket';
import type { DashboardPackageRow } from '@/types';
import './cipta-karya.css';
import { ckColors } from './tokens';

const TINGGI_FOTO = 152;

const sorotTone = {
    warn: { fg: ckColors.warn, bg: ckColors.warnOnFoto },
    danger: { fg: ckColors.danger, bg: ckColors.dangerOnFoto },
} as const;

/** Lencana kecil yang mengambang di sudut area foto. */
function Lencana({
    children,
    fg,
    bg,
    posisi,
}: {
    children: string;
    fg: string;
    bg: string;
    posisi: 'kiri-atas' | 'kanan-atas' | 'kiri-bawah';
}) {
    return (
        <div
            style={{
                position: 'absolute',
                top: posisi === 'kiri-bawah' ? undefined : 10,
                bottom: posisi === 'kiri-bawah' ? 10 : undefined,
                left: posisi === 'kanan-atas' ? undefined : 10,
                right: posisi === 'kanan-atas' ? 10 : undefined,
                maxWidth: 'calc(100% - 20px)',
                padding: '3px 9px',
                borderRadius: 999,
                background: bg,
                color: fg,
                fontSize: 11,
                fontWeight: 590,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}
        >
            {children}
        </div>
    );
}

/**
 * Satu paket sebagai kartu bergambar di Ringkasan. Foto progres terbaru jadi
 * sampulnya: pengguna mengenali proyek dari wujud bangunannya jauh lebih cepat
 * daripada dari baris teks, dan foto itu memang sudah ada di sistem.
 */
export function KartuPaket({ paket }: { paket: DashboardPackageRow }) {
    const sorot = paket.sorot ? sorotTone[paket.sorot.tone] : null;

    const meta = [
        paket.penyedia,
        formatCurrencyCompact(paket.nilai_kontrak),
        paket.pho_hari === null
            ? null
            : paket.pho_hari === 0
              ? 'PHO hari ini'
              : `PHO ${paket.pho_hari} hari`,
    ].filter(Boolean);

    return (
        <Link
            href={show(paket.id)}
            className="ck-kartu-paket"
            style={{
                display: 'block',
                background: '#fff',
                border: `1px solid ${ckColors.cardBorder}`,
                borderRadius: 14,
                overflow: 'hidden',
                transition: 'border-color .12s ease',
            }}
        >
            <div
                style={{
                    position: 'relative',
                    height: TINGGI_FOTO,
                    background: ckColors.fotoPlaceholder,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {paket.foto ? (
                    <img
                        src={preview(paket.foto.id).url}
                        alt={`Foto progres ${paket.nama}`}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                        }}
                    />
                ) : (
                    <div
                        style={{
                            fontFamily:
                                'ui-monospace, SFMono-Regular, Menlo, monospace',
                            fontSize: 10.5,
                            letterSpacing: '.02em',
                            color: ckColors.textMuted6,
                        }}
                    >
                        belum ada foto progres
                    </div>
                )}

                <Lencana
                    posisi="kiri-atas"
                    fg="#5F5D57"
                    bg="rgba(255,255,255,.92)"
                >
                    {paket.status_label}
                </Lencana>

                {paket.sorot && sorot && (
                    <Lencana posisi="kanan-atas" fg={sorot.fg} bg={sorot.bg}>
                        {paket.sorot.teks}
                    </Lencana>
                )}

                {paket.foto && (
                    <Lencana
                        posisi="kiri-bawah"
                        fg="#5F5D57"
                        bg="rgba(255,255,255,.92)"
                    >
                        {paket.foto.tanggal_label}
                    </Lencana>
                )}
            </div>

            <div style={{ padding: '14px 16px 16px' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 11,
                    }}
                >
                    <div
                        style={{
                            fontSize: 26,
                            fontWeight: 620,
                            letterSpacing: '-.03em',
                            fontVariantNumeric: 'tabular-nums',
                            lineHeight: 1,
                            color: ckColors.text,
                        }}
                    >
                        {paket.progres}%
                    </div>
                    <div
                        style={{
                            flex: 1,
                            height: 5,
                            borderRadius: 999,
                            background: ckColors.barTrack,
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                height: '100%',
                                width: `${paket.progres}%`,
                                background: ckColors.accent,
                                borderRadius: 999,
                            }}
                        />
                    </div>
                </div>

                <div
                    style={{
                        fontSize: 15,
                        fontWeight: 570,
                        letterSpacing: '-.015em',
                        lineHeight: 1.32,
                        marginTop: 13,
                        // Judul dua baris jadi tinggi minimum kartu: tanpa ini
                        // kartu berjudul pendek dan panjang tidak sejajar
                        // barisnya di dalam grid.
                        minHeight: 40,
                        color: ckColors.text,
                    }}
                >
                    {paket.nama}
                </div>

                {meta.length > 0 && (
                    <div
                        style={{
                            fontSize: 12.5,
                            color: ckColors.textMuted,
                            marginTop: 5,
                        }}
                    >
                        {meta.join(' · ')}
                    </div>
                )}
            </div>
        </Link>
    );
}
