import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { formatDate, formatFileSize } from '@/lib/utils';
import berkasRoutes from '@/routes/berkas';
import type { DokumenChecklistItem } from '@/types';
import {
    CkButton,
    CkDialog,
    CkDialogBody,
    CkDialogClose,
    CkDialogContent,
    CkDialogDescription,
    CkDialogFooter,
    CkDialogTitle,
    CkField,
    CkTextarea,
} from './ck-dialog';
import { VerifikasiBadge } from './primitives';
import { ckColors } from './tokens';

/** Tanggal + jam singkat untuk jejak audit, mis. "12 Mei 2026". */
function tanggalJejak(iso: string | null): string {
    return iso ? formatDate(iso.slice(0, 10)) : '—';
}

/**
 * Pratinjau isi berkas. Gambar & PDF ditampilkan apa adanya lewat route unduh
 * terautentikasi (disk-nya privat, jadi tidak ada URL publik untuk disematkan);
 * format lain — DOC/XLS — tidak bisa dirender peramban, jadi diwakili kartu
 * format saja.
 */
function Pratinjau({
    berkas,
}: {
    berkas: NonNullable<DokumenChecklistItem['berkas']>;
}) {
    // Pratinjau memakai route inline-nya sendiri: route unduh menyetel
    // Content-Disposition: attachment, yang membuat <iframe> memicu unduhan
    // alih-alih merender PDF-nya.
    const url = berkasRoutes.preview(berkas.id).url;
    const format = berkas.nama_asli.split('.').pop()?.toUpperCase() ?? 'BERKAS';

    const bingkai = {
        borderRadius: 14,
        overflow: 'hidden',
        border: `1px solid ${ckColors.cardBorder}`,
        height: 340,
    } as const;

    if (berkas.mime_type.startsWith('image/')) {
        return (
            <div style={{ ...bingkai, background: '#F5F3EF' }}>
                <img
                    src={url}
                    alt={berkas.nama_asli}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                    }}
                />
            </div>
        );
    }

    if (berkas.mime_type === 'application/pdf') {
        return (
            <div style={{ ...bingkai, background: '#F5F3EF' }}>
                <iframe
                    src={url}
                    title={berkas.nama_asli}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                />
            </div>
        );
    }

    return (
        <div
            style={{
                ...bingkai,
                background:
                    'repeating-linear-gradient(135deg,#F5F3EF 0 10px,#EDEAE4 10px 20px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
            }}
        >
            <span
                style={{
                    fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace',
                    fontSize: 11.5,
                    color: ckColors.textMuted,
                    letterSpacing: '.02em',
                }}
            >
                berkas {format}
            </span>
            <span style={{ fontSize: 12.5, color: ckColors.textMuted4 }}>
                Tidak bisa dipratinjau di peramban — unduh untuk membukanya.
            </span>
        </div>
    );
}

/**
 * Panel geser kanan yang memuat satu item checklist: pratinjau berkas
 * terkini, aksi verifikasi, dan riwayat versinya.
 */
export function DokumenPanel({
    item,
    canInput,
    canVerify,
    onTutup,
    onGantiBerkas,
}: {
    item: DokumenChecklistItem | null;
    canInput: boolean;
    canVerify: boolean;
    onTutup: () => void;
    onGantiBerkas: (item: DokumenChecklistItem) => void;
}) {
    const [tolakOpen, setTolakOpen] = useState(false);
    const [catatan, setCatatan] = useState('');
    const [verifying, setVerifying] = useState(false);

    // Esc menutup panel: ia menutupi separuh layar tapi bukan dialog Radix,
    // jadi tidak dapat perilaku itu secara cuma-cuma.
    useEffect(() => {
        if (!item) {
            return;
        }

        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                onTutup();
            }
        }

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [item, onTutup]);

    if (!item) {
        return null;
    }

    const berkas = item.berkas;

    function verifikasi(
        keputusan: 'diverifikasi' | 'ditolak',
        catatanVerifikasi?: string,
    ) {
        if (!berkas) {
            return;
        }

        setVerifying(true);
        router.patch(
            berkasRoutes.verify(berkas.id).url,
            { keputusan, catatan_verifikasi: catatanVerifikasi },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setTolakOpen(false);
                    setCatatan('');
                },
                onFinish: () => setVerifying(false),
            },
        );
    }

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 60,
                display: 'flex',
                justifyContent: 'flex-end',
            }}
        >
            <button
                type="button"
                aria-label="Tutup panel dokumen"
                onClick={onTutup}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(29,28,26,.28)',
                    border: 'none',
                    padding: 0,
                    cursor: 'default',
                }}
            />

            <div
                style={{
                    position: 'relative',
                    width: 'min(560px, 100%)',
                    height: '100%',
                    background: '#fff',
                    boxShadow: '-8px 0 40px rgba(30,25,15,.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'ck-slide-in .18s ease-out',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: '18px 20px 14px',
                        borderBottom: `1px solid ${ckColors.border}`,
                    }}
                >
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                            style={{
                                fontSize: 16,
                                fontWeight: 620,
                                letterSpacing: '-.015em',
                                color: ckColors.text,
                            }}
                        >
                            {item.nama}
                        </div>
                        <div
                            style={{
                                fontSize: 12.5,
                                color: ckColors.textMuted,
                                marginTop: 3,
                            }}
                        >
                            {berkas
                                ? `${berkas.nama_asli} · ${formatFileSize(berkas.ukuran)} · versi ${berkas.versi}`
                                : 'Belum ada berkas'}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onTutup}
                        aria-label="Tutup"
                        className="ck-link-accent"
                        style={{
                            flex: 'none',
                            background: 'none',
                            border: 'none',
                            padding: 4,
                            cursor: 'pointer',
                            lineHeight: 0,
                        }}
                    >
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke={ckColors.textMuted}
                            strokeWidth="1.9"
                            strokeLinecap="round"
                        >
                            <path d="M2 2l8 8M10 2l-8 8" />
                        </svg>
                    </button>
                </div>

                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '18px 20px 24px',
                    }}
                >
                    {berkas ? (
                        <Pratinjau berkas={berkas} />
                    ) : (
                        <div
                            style={{
                                borderRadius: 14,
                                border: `1px dashed ${ckColors.cardBorder}`,
                                padding: '40px 18px',
                                textAlign: 'center',
                                fontSize: 13.5,
                                color: ckColors.textMuted,
                            }}
                        >
                            Item ini belum punya berkas.
                        </div>
                    )}

                    <div
                        style={{
                            display: 'flex',
                            gap: 9,
                            marginTop: 14,
                            flexWrap: 'wrap',
                        }}
                    >
                        {berkas && (
                            <a
                                href={berkasRoutes.download(berkas.id).url}
                                style={{
                                    fontSize: 13,
                                    fontWeight: 570,
                                    color: '#fff',
                                    background: ckColors.accent,
                                    borderRadius: 10,
                                    padding: '9px 15px',
                                }}
                            >
                                Unduh
                            </a>
                        )}

                        {canInput && (
                            <button
                                type="button"
                                onClick={() => onGantiBerkas(item)}
                                style={{
                                    font: 'inherit',
                                    fontSize: 13,
                                    fontWeight: 550,
                                    color: ckColors.text,
                                    background: '#fff',
                                    border: '1px solid rgba(0,0,0,.13)',
                                    borderRadius: 10,
                                    padding: '9px 15px',
                                    cursor: 'pointer',
                                }}
                            >
                                {berkas ? 'Ganti berkas' : 'Unggah berkas'}
                            </button>
                        )}
                    </div>

                    {berkas && (
                        <>
                            <div
                                style={{
                                    fontSize: 13,
                                    color: ckColors.textMuted2,
                                    fontWeight: 530,
                                    margin: '22px 0 8px',
                                    letterSpacing: '.01em',
                                }}
                            >
                                Status verifikasi
                            </div>
                            <div
                                style={{
                                    border: `1px solid ${ckColors.border}`,
                                    borderRadius: 14,
                                    padding: '14px 16px',
                                }}
                            >
                                <VerifikasiBadge
                                    status={berkas.status_verifikasi}
                                    label={berkas.status_verifikasi_label}
                                />

                                {berkas.status_verifikasi === 'ditolak' &&
                                    berkas.catatan_verifikasi && (
                                        <div
                                            style={{
                                                fontSize: 13.5,
                                                color: ckColors.danger,
                                                marginTop: 9,
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            Catatan: {berkas.catatan_verifikasi}
                                        </div>
                                    )}

                                <div
                                    style={{
                                        fontSize: 12.5,
                                        color: ckColors.textMuted,
                                        marginTop: 10,
                                    }}
                                >
                                    Diunggah {berkas.diunggah_oleh} ·{' '}
                                    {tanggalJejak(berkas.diunggah_pada)}
                                    {berkas.diverifikasi_oleh &&
                                        ` · ${
                                            berkas.status_verifikasi ===
                                            'ditolak'
                                                ? 'ditolak'
                                                : 'diverifikasi'
                                        } ${berkas.diverifikasi_oleh} · ${tanggalJejak(berkas.diverifikasi_pada)}`}
                                </div>

                                {canVerify &&
                                    berkas.status_verifikasi === 'diajukan' && (
                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: 9,
                                                marginTop: 12,
                                            }}
                                        >
                                            <button
                                                type="button"
                                                disabled={verifying}
                                                onClick={() =>
                                                    verifikasi('diverifikasi')
                                                }
                                                style={{
                                                    font: 'inherit',
                                                    fontSize: 12.5,
                                                    fontWeight: 590,
                                                    color: '#fff',
                                                    background: ckColors.accent,
                                                    border: 'none',
                                                    borderRadius: 9,
                                                    padding: '7px 13px',
                                                    cursor: 'pointer',
                                                    opacity: verifying
                                                        ? 0.6
                                                        : 1,
                                                }}
                                            >
                                                Setujui
                                            </button>
                                            <button
                                                type="button"
                                                disabled={verifying}
                                                onClick={() =>
                                                    setTolakOpen(true)
                                                }
                                                style={{
                                                    font: 'inherit',
                                                    fontSize: 12.5,
                                                    fontWeight: 590,
                                                    color: ckColors.danger,
                                                    background: 'none',
                                                    border: `1px solid ${ckColors.danger}`,
                                                    borderRadius: 9,
                                                    padding: '7px 13px',
                                                    cursor: 'pointer',
                                                    opacity: verifying
                                                        ? 0.6
                                                        : 1,
                                                }}
                                            >
                                                Tolak
                                            </button>
                                        </div>
                                    )}
                            </div>
                        </>
                    )}

                    {item.riwayat.length > 0 && (
                        <>
                            <div
                                style={{
                                    fontSize: 13,
                                    color: ckColors.textMuted2,
                                    fontWeight: 530,
                                    margin: '22px 0 8px',
                                    letterSpacing: '.01em',
                                }}
                            >
                                Riwayat versi
                            </div>
                            <div
                                style={{
                                    border: `1px solid ${ckColors.border}`,
                                    borderRadius: 14,
                                    overflow: 'hidden',
                                }}
                            >
                                {item.riwayat.map((versi, i) => (
                                    <div
                                        key={versi.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            padding: '11px 16px',
                                            borderTop:
                                                i === 0
                                                    ? undefined
                                                    : `1px solid ${ckColors.border}`,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 570,
                                                color: ckColors.text,
                                                fontVariantNumeric:
                                                    'tabular-nums',
                                                flex: 'none',
                                            }}
                                        >
                                            v{versi.versi}
                                        </div>
                                        <div
                                            style={{
                                                flex: 1,
                                                minWidth: 0,
                                                fontSize: 12.5,
                                                color: ckColors.textMuted,
                                            }}
                                        >
                                            {versi.is_terkini
                                                ? 'Berlaku sekarang'
                                                : 'Diarsipkan'}{' '}
                                            · {formatFileSize(versi.ukuran)} ·{' '}
                                            {versi.diunggah_oleh}
                                        </div>
                                        <a
                                            href={
                                                berkasRoutes.download(versi.id)
                                                    .url
                                            }
                                            className="ck-link-accent"
                                            style={{
                                                fontSize: 12.5,
                                                fontWeight: 550,
                                                color: ckColors.accent,
                                                flex: 'none',
                                            }}
                                        >
                                            Unduh
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <CkDialog open={tolakOpen} onOpenChange={setTolakOpen}>
                <CkDialogContent>
                    <CkDialogTitle>Tolak berkas</CkDialogTitle>
                    <CkDialogDescription>
                        Jelaskan apa yang perlu diperbaiki — operator akan
                        melihat catatan ini saat mengunggah ulang.
                    </CkDialogDescription>

                    <CkDialogBody>
                        <CkField label="Catatan verifikasi">
                            <CkTextarea
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                                placeholder="Mis. Scan buram, mohon unggah ulang dengan resolusi lebih tinggi."
                                rows={3}
                            />
                        </CkField>
                    </CkDialogBody>

                    <CkDialogFooter>
                        <CkDialogClose asChild>
                            <CkButton variant="ghost">Batal</CkButton>
                        </CkDialogClose>
                        <CkButton
                            variant="danger"
                            disabled={verifying || catatan.trim() === ''}
                            onClick={() => verifikasi('ditolak', catatan)}
                        >
                            Tolak berkas
                        </CkButton>
                    </CkDialogFooter>
                </CkDialogContent>
            </CkDialog>
        </div>
    );
}
