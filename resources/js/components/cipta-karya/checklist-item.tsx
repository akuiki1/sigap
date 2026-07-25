import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatFileSize } from '@/lib/utils';
import berkasRoutes from '@/routes/berkas';
import paket from '@/routes/paket';
import type { DokumenChecklistItem } from '@/types';
import { VerifikasiBadge } from './primitives';
import { ckColors } from './tokens';

export function ChecklistItemRow({
    paketId,
    item,
    first,
    canInput,
    canVerify,
    pending,
    onToggle,
}: {
    paketId: number;
    item: DokumenChecklistItem;
    first: boolean;
    canInput: boolean;
    canVerify: boolean;
    pending: boolean;
    onToggle: (checklistDokumenId: number) => void;
}) {
    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [catatan, setCatatan] = useState('');
    const [verifying, setVerifying] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);

    const berkas = item.berkas;
    const clickable = canInput && !berkas;

    function submitUpload() {
        const file = fileInput.current?.files?.[0];

        if (!file) {
            return;
        }

        setUploading(true);
        setUploadError(null);

        router.post(
            paket.dokumen.berkas.store({ paket: paketId, checklistDokumen: item.id })
                .url,
            { file },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => setUploadOpen(false),
                onError: (errors) =>
                    setUploadError(errors.file ?? 'Gagal mengunggah berkas.'),
                onFinish: () => setUploading(false),
            },
        );
    }

    function verify(keputusan: 'diverifikasi' | 'ditolak', note?: string) {
        if (!berkas) {
            return;
        }

        setVerifying(true);
        router.patch(
            berkasRoutes.verify(berkas.id).url,
            { keputusan, catatan_verifikasi: note },
            {
                preserveScroll: true,
                onSuccess: () => setRejectOpen(false),
                onFinish: () => setVerifying(false),
            },
        );
    }

    return (
        <div
            style={{
                padding: '12.5px 18px',
                borderTop: first ? undefined : `1px solid ${ckColors.border}`,
            }}
        >
            <div
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                aria-pressed={clickable ? item.status === 'ada' : undefined}
                onClick={clickable ? () => onToggle(item.id) : undefined}
                onKeyDown={
                    clickable
                        ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  onToggle(item.id);
                              }
                          }
                        : undefined
                }
                className={clickable ? 'ck-checklist-item' : undefined}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 13,
                    cursor: clickable ? 'pointer' : 'default',
                    opacity: pending ? 0.5 : 1,
                }}
            >
                {item.status === 'ada' ? (
                    <span
                        style={{
                            width: 19,
                            height: 19,
                            borderRadius: '50%',
                            background: ckColors.accent,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 'none',
                        }}
                    >
                        <svg
                            width="11"
                            height="11"
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke="#fff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M2.5 6.3l2.3 2.3L9.5 3.7" />
                        </svg>
                    </span>
                ) : (
                    <span
                        style={{
                            width: 19,
                            height: 19,
                            borderRadius: '50%',
                            border: item.wajib
                                ? `2px solid ${ckColors.danger}`
                                : '1.5px solid #D3D1CB',
                            flex: 'none',
                            boxSizing: 'border-box',
                        }}
                    />
                )}
                <div
                    style={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: 14.5,
                        color: ckColors.text,
                    }}
                >
                    {item.nama}
                </div>
                {!berkas && item.status === 'belum' && (
                    <div
                        style={{
                            fontSize: 13,
                            fontWeight: 520,
                            whiteSpace: 'nowrap',
                            color: item.wajib
                                ? ckColors.danger
                                : ckColors.textMuted6,
                        }}
                    >
                        {item.wajib ? 'Wajib · belum' : 'Belum'}
                    </div>
                )}
                {canInput && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setUploadOpen(true);
                        }}
                        className="ck-link-accent"
                        style={{
                            fontSize: 12.5,
                            fontWeight: 560,
                            color: ckColors.accent,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {berkas ? 'Ganti' : 'Unggah'}
                    </button>
                )}
            </div>

            {berkas && (
                <div
                    style={{
                        marginLeft: 32,
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 5,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 8,
                        }}
                    >
                        <a
                            href={berkasRoutes.download(berkas.id).url}
                            style={{
                                fontSize: 13,
                                fontWeight: 540,
                                color: ckColors.accent,
                            }}
                        >
                            {berkas.nama_asli}
                        </a>
                        <span style={{ fontSize: 12, color: ckColors.textMuted }}>
                            {formatFileSize(berkas.ukuran)} · v{berkas.versi}
                        </span>
                        <VerifikasiBadge
                            status={berkas.status_verifikasi}
                            label={berkas.status_verifikasi_label}
                        />
                    </div>
                    <div style={{ fontSize: 12, color: ckColors.textMuted }}>
                        Diunggah oleh {berkas.diunggah_oleh}
                        {berkas.diverifikasi_oleh &&
                            ` · diverifikasi oleh ${berkas.diverifikasi_oleh}`}
                    </div>
                    {berkas.status_verifikasi === 'ditolak' &&
                        berkas.catatan_verifikasi && (
                            <div
                                style={{ fontSize: 13, color: ckColors.danger }}
                            >
                                Catatan: {berkas.catatan_verifikasi}
                            </div>
                        )}
                    {canVerify && berkas.status_verifikasi === 'diajukan' && (
                        <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                            <button
                                type="button"
                                disabled={verifying}
                                onClick={() => verify('diverifikasi')}
                                style={{
                                    fontSize: 12.5,
                                    fontWeight: 590,
                                    color: '#fff',
                                    background: ckColors.accent,
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '5px 11px',
                                    cursor: 'pointer',
                                    opacity: verifying ? 0.6 : 1,
                                }}
                            >
                                Setujui
                            </button>
                            <button
                                type="button"
                                disabled={verifying}
                                onClick={() => setRejectOpen(true)}
                                style={{
                                    fontSize: 12.5,
                                    fontWeight: 590,
                                    color: ckColors.danger,
                                    background: 'none',
                                    border: `1px solid ${ckColors.danger}`,
                                    borderRadius: 8,
                                    padding: '5px 11px',
                                    cursor: 'pointer',
                                    opacity: verifying ? 0.6 : 1,
                                }}
                            >
                                Tolak
                            </button>
                        </div>
                    )}
                </div>
            )}

            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogContent>
                    <DialogTitle>
                        {berkas ? 'Ganti berkas' : 'Unggah berkas'}
                    </DialogTitle>
                    <DialogDescription>{item.nama}</DialogDescription>

                    <input
                        ref={fileInput}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                        className="mt-2 block w-full text-sm"
                    />
                    {uploadError && (
                        <p
                            style={{
                                fontSize: 13,
                                color: ckColors.danger,
                                marginTop: 6,
                            }}
                        >
                            {uploadError}
                        </p>
                    )}
                    <p
                        style={{
                            fontSize: 12,
                            color: ckColors.textMuted,
                            marginTop: 6,
                        }}
                    >
                        PDF, JPG, PNG, DOC, atau XLS — maksimum 10 MB.
                    </p>

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <button
                                type="button"
                                className="rounded-md border px-3 py-1.5 text-sm"
                            >
                                Batal
                            </button>
                        </DialogClose>
                        <button
                            type="button"
                            disabled={uploading}
                            onClick={submitUpload}
                            className="rounded-md px-3 py-1.5 text-sm text-white disabled:opacity-60"
                            style={{ background: ckColors.accent }}
                        >
                            {uploading ? 'Mengunggah…' : 'Unggah'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent>
                    <DialogTitle>Tolak berkas</DialogTitle>
                    <DialogDescription>
                        Jelaskan apa yang perlu diperbaiki — operator akan
                        melihat catatan ini saat mengunggah ulang.
                    </DialogDescription>

                    <Textarea
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder="Mis. Scan buram, mohon unggah ulang dengan resolusi lebih tinggi."
                        rows={3}
                    />

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <button
                                type="button"
                                className="rounded-md border px-3 py-1.5 text-sm"
                            >
                                Batal
                            </button>
                        </DialogClose>
                        <button
                            type="button"
                            disabled={verifying || catatan.trim() === ''}
                            onClick={() => verify('ditolak', catatan)}
                            className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-60"
                        >
                            Tolak berkas
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
