import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { formatFileSize } from '@/lib/utils';
import berkasRoutes from '@/routes/berkas';
import paket from '@/routes/paket';
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
    CkFileInput,
    CkTextarea,
} from './ck-dialog';
import { VerifikasiBadge } from './primitives';
import { ckColors } from './tokens';

export function ChecklistItemRow({
    paketId,
    item,
    first,
    canInput,
    canVerify,
    pending,
    onBatalkanTanda,
}: {
    paketId: number;
    item: DokumenChecklistItem;
    first: boolean;
    canInput: boolean;
    canVerify: boolean;
    pending: boolean;
    onBatalkanTanda: (checklistDokumenId: number) => void;
}) {
    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [catatan, setCatatan] = useState('');
    const [verifying, setVerifying] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);

    const berkas = item.berkas;

    function submitUpload() {
        const file = fileInput.current?.files?.[0];

        if (!file) {
            return;
        }

        setUploading(true);
        setUploadError(null);

        router.post(
            paket.dokumen.berkas.store({
                paket: paketId,
                checklistDokumen: item.id,
            }).url,
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
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 13,
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
                {canInput && item.status === 'ada' && (
                    <button
                        type="button"
                        onClick={() => onBatalkanTanda(item.id)}
                        disabled={pending}
                        className="ck-link-accent"
                        style={{
                            fontSize: 12.5,
                            fontWeight: 560,
                            color: ckColors.textMuted,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Batalkan tanda
                    </button>
                )}

                {canInput && (
                    <button
                        type="button"
                        onClick={() => setUploadOpen(true)}
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
                        <span
                            style={{ fontSize: 12, color: ckColors.textMuted }}
                        >
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

            <CkDialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <CkDialogContent>
                    <CkDialogTitle>
                        {berkas ? 'Ganti berkas' : 'Unggah berkas'}
                    </CkDialogTitle>
                    <CkDialogDescription>{item.nama}</CkDialogDescription>

                    <CkDialogBody>
                        <CkField
                            label="Berkas"
                            error={uploadError ?? undefined}
                            hint="PDF, JPG, PNG, DOC, atau XLS — maksimum 10 MB."
                        >
                            <CkFileInput
                                ref={fileInput}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                            />
                        </CkField>
                    </CkDialogBody>

                    <CkDialogFooter>
                        <CkDialogClose asChild>
                            <CkButton variant="ghost">Batal</CkButton>
                        </CkDialogClose>
                        <CkButton disabled={uploading} onClick={submitUpload}>
                            {uploading ? 'Mengunggah…' : 'Unggah'}
                        </CkButton>
                    </CkDialogFooter>
                </CkDialogContent>
            </CkDialog>

            <CkDialog open={rejectOpen} onOpenChange={setRejectOpen}>
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
                            onClick={() => verify('ditolak', catatan)}
                        >
                            Tolak berkas
                        </CkButton>
                    </CkDialogFooter>
                </CkDialogContent>
            </CkDialog>
        </div>
    );
}
