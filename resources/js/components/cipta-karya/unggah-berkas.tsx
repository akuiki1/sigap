import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { formatFileSize } from '@/lib/utils';
import paket from '@/routes/paket';
import type { DokumenChecklistItem } from '@/types';
import {
    CkButton,
    CkDialog,
    CkDialogContent,
    CkDialogDescription,
    CkDialogFooter,
    CkDialogTitle,
} from './ck-dialog';
import { ckColors } from './tokens';

const TERIMA = '.pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx';

function Pil({
    children,
    tone,
}: {
    children: string;
    tone: 'danger' | 'netral';
}) {
    return (
        <span
            style={{
                fontSize: 11.5,
                fontWeight: 590,
                padding: '2px 8px',
                borderRadius: 999,
                whiteSpace: 'nowrap',
                color: tone === 'danger' ? ckColors.danger : ckColors.textMuted,
                background:
                    tone === 'danger' ? ckColors.dangerSoft : 'rgba(0,0,0,.05)',
            }}
        >
            {children}
        </span>
    );
}

/**
 * Modal unggah berkas untuk satu item checklist.
 *
 * `item` boleh null: tombol "Unggah dokumen" di kepala tab Dokumen membuka
 * modal tanpa sasaran, lalu itemnya dipilih di dalam modal. Route unggah
 * selalu butuh id checklist, jadi tombol kirim tetap terkunci sampai ada
 * pilihan — bukan sekadar sampai ada berkas.
 */
export function UnggahBerkasDialog({
    paketId,
    item,
    pilihan,
    open,
    onOpenChange,
}: {
    paketId: number;
    item: DokumenChecklistItem | null;
    /** Semua item checklist paket ini, untuk modal yang dibuka tanpa sasaran. */
    pilihan: DokumenChecklistItem[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [seret, setSeret] = useState(false);
    const [dipilihId, setDipilihId] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInput = useRef<HTMLInputElement>(null);

    const sasaran = item ?? pilihan.find((p) => p.id === dipilihId) ?? null;
    const ditolak = sasaran?.berkas?.status_verifikasi === 'ditolak';

    function tutup() {
        onOpenChange(false);
        setFile(null);
        setSeret(false);
        setDipilihId(null);
        setError(null);
    }

    function kirim() {
        if (!file || !sasaran) {
            return;
        }

        setUploading(true);
        setError(null);

        router.post(
            paket.dokumen.berkas.store({
                paket: paketId,
                checklistDokumen: sasaran.id,
            }).url,
            { file },
            {
                forceFormData: true,
                preserveScroll: true,
                preserveState: true,
                onSuccess: tutup,
                onError: (errors) =>
                    setError(errors.file ?? 'Gagal mengunggah berkas.'),
                onFinish: () => setUploading(false),
            },
        );
    }

    return (
        <CkDialog
            open={open}
            onOpenChange={(next) => (next ? onOpenChange(true) : tutup())}
        >
            <CkDialogContent lebar={520}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                    }}
                >
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <CkDialogTitle>
                            {sasaran?.berkas ? 'Ganti berkas' : 'Unggah berkas'}
                        </CkDialogTitle>
                        <CkDialogDescription>
                            {sasaran
                                ? sasaran.nama
                                : 'Pilih item checklist yang akan diisi berkas ini.'}
                        </CkDialogDescription>
                    </div>

                    <div style={{ display: 'flex', gap: 6, flex: 'none' }}>
                        {sasaran?.wajib && <Pil tone="danger">Wajib</Pil>}
                        <Pil tone="netral">
                            {sasaran?.tahap ?? 'Belum dipilih'}
                        </Pil>
                    </div>
                </div>

                {!item && (
                    <div style={{ marginTop: 16 }}>
                        <div
                            style={{
                                fontSize: 12.5,
                                fontWeight: 540,
                                color: ckColors.textMuted2,
                                letterSpacing: '.01em',
                            }}
                        >
                            Item checklist
                        </div>
                        <select
                            className="ck-kontrol"
                            value={dipilihId ?? ''}
                            onChange={(e) =>
                                setDipilihId(
                                    e.target.value === ''
                                        ? null
                                        : Number(e.target.value),
                                )
                            }
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                marginTop: 6,
                                padding: '9px 11px',
                                borderRadius: 10,
                                border: '1px solid rgba(0,0,0,.13)',
                                background: '#fff',
                                fontSize: 14,
                                fontFamily: 'inherit',
                                color: ckColors.text,
                                outline: 'none',
                            }}
                        >
                            <option value="">Pilih item…</option>
                            {pilihan.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.tahap} — {p.nama}
                                    {p.wajib ? ' (wajib)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {ditolak && sasaran?.berkas?.catatan_verifikasi && (
                    <div
                        style={{
                            marginTop: 14,
                            padding: '12px 14px',
                            borderRadius: 12,
                            background: 'rgba(214,58,46,.07)',
                            border: '1px solid rgba(214,58,46,.2)',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12.5,
                                fontWeight: 590,
                                color: ckColors.danger,
                            }}
                        >
                            Ditolak pada verifikasi sebelumnya
                        </div>
                        <div
                            style={{
                                fontSize: 13,
                                color: ckColors.text,
                                marginTop: 4,
                                lineHeight: 1.45,
                            }}
                        >
                            {sasaran.berkas.catatan_verifikasi}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: 18 }}>
                    <div
                        style={{
                            fontSize: 12.5,
                            fontWeight: 540,
                            color: ckColors.textMuted2,
                            letterSpacing: '.01em',
                        }}
                    >
                        Berkas
                    </div>

                    <input
                        ref={fileInput}
                        type="file"
                        accept={TERIMA}
                        onChange={(e) => {
                            setFile(e.target.files?.[0] ?? null);
                            setError(null);
                        }}
                        style={{ display: 'none' }}
                    />

                    {file ? (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                marginTop: 6,
                                padding: '13px 15px',
                                border: '1px solid rgba(0,0,0,.13)',
                                borderRadius: 12,
                            }}
                        >
                            <span
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 9,
                                    background: ckColors.accentSoft,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flex: 'none',
                                }}
                            >
                                <svg
                                    width="17"
                                    height="17"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    stroke={ckColors.accent}
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M5.5 3.3h5.4l3.6 3.6v9.3a.9.9 0 0 1-.9.9H5.5a.9.9 0 0 1-.9-.9V4.2a.9.9 0 0 1 .9-.9z" />
                                    <path d="M10.7 3.4V7H14.3" />
                                </svg>
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        fontSize: 13.5,
                                        fontWeight: 540,
                                        color: ckColors.text,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {file.name}
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: ckColors.textMuted,
                                        marginTop: 2,
                                    }}
                                >
                                    {formatFileSize(file.size)}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInput.current?.click()}
                                className="ck-link-accent"
                                style={{
                                    font: 'inherit',
                                    fontSize: 12.5,
                                    fontWeight: 560,
                                    color: ckColors.accent,
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    flex: 'none',
                                }}
                            >
                                Ganti
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileInput.current?.click()}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setSeret(true);
                            }}
                            onDragLeave={() => setSeret(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setSeret(false);
                                setFile(e.dataTransfer.files?.[0] ?? null);
                                setError(null);
                            }}
                            className="ck-row"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 7,
                                width: '100%',
                                marginTop: 6,
                                padding: '26px 18px',
                                border: `1.5px dashed ${seret ? ckColors.accent : '#D3D1CB'}`,
                                borderRadius: 12,
                                background: seret
                                    ? 'rgba(0,102,179,.05)'
                                    : '#FCFBF9',
                                cursor: 'pointer',
                                font: 'inherit',
                            }}
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={ckColors.accent}
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 16V4" />
                                <path d="M7.5 8.5L12 4l4.5 4.5" />
                                <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
                            </svg>
                            <div
                                style={{
                                    fontSize: 14,
                                    fontWeight: 550,
                                    color: ckColors.text,
                                }}
                            >
                                Seret berkas ke sini, atau pilih dari perangkat
                            </div>
                            <div
                                style={{
                                    fontSize: 12.5,
                                    color: ckColors.textMuted,
                                }}
                            >
                                PDF, JPG, PNG, DOC, atau XLS — maksimum 10 MB
                            </div>
                        </button>
                    )}

                    {error && (
                        <div
                            style={{
                                fontSize: 12,
                                color: ckColors.danger,
                                marginTop: 6,
                            }}
                        >
                            {error}
                        </div>
                    )}
                </div>

                <div
                    style={{
                        marginTop: 14,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 9,
                        padding: '11px 13px',
                        borderRadius: 12,
                        background: 'rgba(0,0,0,.03)',
                    }}
                >
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke={ckColors.textMuted}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        style={{ flex: 'none', marginTop: 1 }}
                    >
                        <circle cx="8" cy="8" r="6.2" />
                        <path d="M8 7.3v3.6M8 5.2v.1" />
                    </svg>
                    <div
                        style={{
                            fontSize: 12.5,
                            color: ckColors.textMuted,
                            lineHeight: 1.5,
                        }}
                    >
                        {sasaran?.berkas
                            ? `Tersimpan sebagai versi ${sasaran.berkas.versi + 1}; versi ${sasaran.berkas.versi} diarsipkan otomatis.`
                            : 'Tersimpan sebagai versi 1.'}{' '}
                        Setelah diunggah, statusnya menjadi{' '}
                        <span style={{ color: ckColors.warn, fontWeight: 560 }}>
                            menunggu verifikasi
                        </span>{' '}
                        pengawas.
                    </div>
                </div>

                <CkDialogFooter>
                    <CkButton variant="ghost" onClick={tutup}>
                        Batal
                    </CkButton>
                    <CkButton
                        disabled={uploading || !file || !sasaran}
                        onClick={kirim}
                    >
                        {uploading ? 'Mengunggah…' : 'Unggah'}
                    </CkButton>
                </CkDialogFooter>
            </CkDialogContent>
        </CkDialog>
    );
}
