import { router, usePage } from '@inertiajs/react';
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
import { formatDate, formatFileSize } from '@/lib/utils';
import berkasRoutes from '@/routes/berkas';
import paketRoutes from '@/routes/paket';
import progresRoutes from '@/routes/progres';
import type { ProgresEntry } from '@/types';
import { CkCard, CkSectionLabel, VerifikasiBadge } from './primitives';
import { ckColors } from './tokens';

function TambahProgresDialog({
    paketId,
    open,
    onOpenChange,
}: {
    paketId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const tanggalRef = useRef<HTMLInputElement>(null);
    const persentaseRef = useRef<HTMLInputElement>(null);
    const keteranganRef = useRef<HTMLTextAreaElement>(null);
    const fotoRef = useRef<HTMLInputElement>(null);

    function submit() {
        const foto = fotoRef.current?.files;

        setSubmitting(true);
        setErrors({});

        router.post(
            paketRoutes.progres.store(paketId).url,
            {
                tanggal: tanggalRef.current?.value,
                persentase: persentaseRef.current?.value,
                keterangan: keteranganRef.current?.value || null,
                foto: foto ? Array.from(foto) : [],
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => onOpenChange(false),
                onError: (e) => setErrors(e as Record<string, string>),
                onFinish: () => setSubmitting(false),
            },
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogTitle>Catat entri progres</DialogTitle>
                <DialogDescription>
                    Dokumentasikan kondisi fisik gedung pada tanggal & persentase
                    tertentu.
                </DialogDescription>

                <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                    <label style={{ fontSize: 13, color: ckColors.textMuted }}>
                        Tanggal
                        <input
                            ref={tanggalRef}
                            type="date"
                            className="mt-1 block w-full rounded-md border px-2 py-1.5 text-sm"
                        />
                        {errors.tanggal && (
                            <span
                                style={{ color: ckColors.danger, fontSize: 12 }}
                            >
                                {errors.tanggal}
                            </span>
                        )}
                    </label>

                    <label style={{ fontSize: 13, color: ckColors.textMuted }}>
                        Persentase progres fisik (%)
                        <input
                            ref={persentaseRef}
                            type="number"
                            min={0}
                            max={100}
                            className="mt-1 block w-full rounded-md border px-2 py-1.5 text-sm"
                        />
                        {errors.persentase && (
                            <span
                                style={{ color: ckColors.danger, fontSize: 12 }}
                            >
                                {errors.persentase}
                            </span>
                        )}
                    </label>

                    <label style={{ fontSize: 13, color: ckColors.textMuted }}>
                        Keterangan (opsional)
                        <Textarea
                            ref={keteranganRef}
                            rows={2}
                            className="mt-1"
                            placeholder="Mis. Pekerjaan pondasi selesai, mulai struktur lantai 1."
                        />
                    </label>

                    <label style={{ fontSize: 13, color: ckColors.textMuted }}>
                        Foto (bisa lebih dari satu sudut)
                        <input
                            ref={fotoRef}
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            multiple
                            className="mt-1 block w-full text-sm"
                        />
                        {errors.foto && (
                            <span
                                style={{ color: ckColors.danger, fontSize: 12 }}
                            >
                                {errors.foto}
                            </span>
                        )}
                    </label>
                </div>

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
                        disabled={submitting}
                        onClick={submit}
                        className="rounded-md px-3 py-1.5 text-sm text-white disabled:opacity-60"
                        style={{ background: ckColors.accent }}
                    >
                        {submitting ? 'Menyimpan…' : 'Simpan'}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ProgresEntryCard({
    entry,
    canVerify,
}: {
    entry: ProgresEntry;
    canVerify: boolean;
}) {
    const [rejectOpen, setRejectOpen] = useState(false);
    const [catatan, setCatatan] = useState('');
    const [verifying, setVerifying] = useState(false);

    function verify(keputusan: 'diverifikasi' | 'ditolak', note?: string) {
        setVerifying(true);
        router.patch(
            progresRoutes.verify(entry.id).url,
            { keputusan, catatan_verifikasi: note },
            {
                preserveScroll: true,
                onSuccess: () => setRejectOpen(false),
                onFinish: () => setVerifying(false),
            },
        );
    }

    return (
        <div style={{ padding: '14px 18px' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                }}
            >
                <div
                    style={{
                        fontSize: 20,
                        fontWeight: 640,
                        color: ckColors.text,
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {entry.persentase}%
                </div>
                <div style={{ fontSize: 13.5, color: ckColors.textMuted }}>
                    {formatDate(entry.tanggal)}
                </div>
                <VerifikasiBadge
                    status={entry.status_verifikasi}
                    label={entry.status_verifikasi_label}
                />
            </div>

            {entry.keterangan && (
                <div
                    style={{
                        fontSize: 14,
                        color: ckColors.text,
                        marginTop: 6,
                    }}
                >
                    {entry.keterangan}
                </div>
            )}

            {entry.foto.length > 0 && (
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 8,
                        marginTop: 8,
                    }}
                >
                    {entry.foto.map((f) => (
                        <a
                            key={f.id}
                            href={berkasRoutes.download(f.id).url}
                            style={{
                                fontSize: 12.5,
                                color: ckColors.accent,
                                background: ckColors.accentSoft,
                                borderRadius: 8,
                                padding: '4px 9px',
                            }}
                        >
                            {f.nama_asli} · {formatFileSize(f.ukuran)}
                        </a>
                    ))}
                </div>
            )}

            <div
                style={{
                    fontSize: 12,
                    color: ckColors.textMuted,
                    marginTop: 8,
                }}
            >
                Dilaporkan oleh {entry.dilaporkan_oleh}
                {entry.diverifikasi_oleh &&
                    ` · diverifikasi oleh ${entry.diverifikasi_oleh}`}
            </div>

            {entry.status_verifikasi === 'ditolak' && entry.catatan_verifikasi && (
                <div style={{ fontSize: 13, color: ckColors.danger, marginTop: 4 }}>
                    Catatan: {entry.catatan_verifikasi}
                </div>
            )}

            {canVerify && entry.status_verifikasi === 'diajukan' && (
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
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

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent>
                    <DialogTitle>Tolak entri progres</DialogTitle>
                    <DialogDescription>
                        Jelaskan apa yang perlu diperbaiki atau diklarifikasi.
                    </DialogDescription>

                    <Textarea
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder="Mis. Persentase tidak sesuai dengan foto yang dilampirkan."
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
                            Tolak entri
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export function ProgresRiwayat({
    paketId,
    entries,
}: {
    paketId: number;
    entries: ProgresEntry[];
}) {
    const { auth } = usePage().props;
    const [addOpen, setAddOpen] = useState(false);

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    margin: '0 6px 8px',
                }}
            >
                <CkSectionLabel style={{ margin: 0 }}>
                    Riwayat progres fisik
                </CkSectionLabel>
                {auth.user.can_input && (
                    <button
                        type="button"
                        onClick={() => setAddOpen(true)}
                        style={{
                            fontSize: 12.5,
                            fontWeight: 560,
                            color: ckColors.accent,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                        }}
                    >
                        + Catat progres
                    </button>
                )}
            </div>

            {entries.length === 0 ? (
                <CkCard>
                    <div
                        style={{
                            padding: '24px 18px',
                            fontSize: 14,
                            color: ckColors.textMuted,
                            textAlign: 'center',
                        }}
                    >
                        Belum ada riwayat progres fisik yang dicatat.
                    </div>
                </CkCard>
            ) : (
                <CkCard>
                    {entries.map((entry, i) => (
                        <div
                            key={entry.id}
                            style={{
                                borderTop:
                                    i === 0
                                        ? undefined
                                        : `1px solid ${ckColors.border}`,
                            }}
                        >
                            <ProgresEntryCard
                                entry={entry}
                                canVerify={auth.user.can_verify}
                            />
                        </div>
                    ))}
                </CkCard>
            )}

            <TambahProgresDialog
                paketId={paketId}
                open={addOpen}
                onOpenChange={setAddOpen}
            />
        </div>
    );
}
