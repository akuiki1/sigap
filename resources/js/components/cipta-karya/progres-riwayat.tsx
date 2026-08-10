import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { formatDate, formatFileSize } from '@/lib/utils';
import berkasRoutes from '@/routes/berkas';
import paketRoutes from '@/routes/paket';
import progresRoutes from '@/routes/progres';
import type { ProgresEntry, ProgresFoto } from '@/types';
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
    CkInput,
    CkTextarea,
} from './ck-dialog';
import { CkCard, VerifikasiBadge } from './primitives';
import { ckColors } from './tokens';

export function TambahProgresDialog({
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
                preserveState: true,
                onSuccess: () => onOpenChange(false),
                onError: (e) => setErrors(e as Record<string, string>),
                onFinish: () => setSubmitting(false),
            },
        );
    }

    return (
        <CkDialog open={open} onOpenChange={onOpenChange}>
            <CkDialogContent>
                <CkDialogTitle>Catat entri progres</CkDialogTitle>
                <CkDialogDescription>
                    Dokumentasikan kondisi fisik gedung pada tanggal &
                    persentase tertentu.
                </CkDialogDescription>

                <CkDialogBody>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
                            gap: 12,
                        }}
                    >
                        <CkField label="Tanggal" error={errors.tanggal}>
                            <CkInput ref={tanggalRef} type="date" />
                        </CkField>

                        <CkField
                            label="Progres fisik (%)"
                            error={errors.persentase}
                        >
                            <CkInput
                                ref={persentaseRef}
                                type="number"
                                min={0}
                                max={100}
                            />
                        </CkField>
                    </div>

                    <CkField
                        label="Keterangan (opsional)"
                        error={errors.keterangan}
                    >
                        <CkTextarea
                            ref={keteranganRef}
                            rows={2}
                            placeholder="Mis. Pekerjaan pondasi selesai, mulai struktur lantai 1."
                        />
                    </CkField>

                    <CkField
                        label="Foto"
                        error={errors.foto}
                        hint="Bisa lebih dari satu sudut — JPG atau PNG, maksimum 10 MB per foto."
                    >
                        <CkFileInput
                            ref={fotoRef}
                            accept=".jpg,.jpeg,.png"
                            multiple
                        />
                    </CkField>
                </CkDialogBody>

                <CkDialogFooter>
                    <CkDialogClose asChild>
                        <CkButton variant="ghost">Batal</CkButton>
                    </CkDialogClose>
                    <CkButton disabled={submitting} onClick={submit}>
                        {submitting ? 'Menyimpan…' : 'Simpan'}
                    </CkButton>
                </CkDialogFooter>
            </CkDialogContent>
        </CkDialog>
    );
}

/**
 * Kartu foto pendukung. Fotonya ditampilkan langsung, bukan sekadar ditautkan:
 * gunanya entri progres adalah "gedung pas X% bentuknya seperti apa", dan itu
 * hilang kalau tiap foto harus diunduh dulu untuk dilihat.
 */
function KartuFoto({ foto }: { foto: ProgresFoto }) {
    return (
        <a
            href={berkasRoutes.download(foto.id).url}
            style={{
                borderRadius: 12,
                overflow: 'hidden',
                border: `1px solid ${ckColors.border}`,
                display: 'block',
            }}
        >
            <img
                src={berkasRoutes.preview(foto.id).url}
                alt={foto.nama_asli}
                loading="lazy"
                style={{
                    height: 104,
                    width: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    background: '#F1EFEA',
                }}
            />
            <div
                style={{
                    padding: '7px 9px',
                    fontSize: 11.5,
                    color: ckColors.textMuted,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                {foto.nama_asli} · {formatFileSize(foto.ukuran)}
            </div>
        </a>
    );
}

function KartuProgres({ entry }: { entry: ProgresEntry }) {
    const [tolakOpen, setTolakOpen] = useState(false);
    const [catatan, setCatatan] = useState('');
    const [verifying, setVerifying] = useState(false);

    function verifikasi(
        keputusan: 'diverifikasi' | 'ditolak',
        catatanVerifikasi?: string,
    ) {
        setVerifying(true);
        router.patch(
            progresRoutes.verify(entry.id).url,
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
        <CkCard padded style={{ padding: '16px 18px' }}>
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
                        fontSize: 22,
                        fontWeight: 640,
                        color: ckColors.text,
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '-.02em',
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
                        marginTop: 7,
                        lineHeight: 1.5,
                        maxWidth: '70ch',
                        textWrap: 'pretty',
                    }}
                >
                    {entry.keterangan}
                </div>
            )}

            {entry.foto.length > 0 && (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fill,minmax(150px,1fr))',
                        gap: 10,
                        marginTop: 12,
                    }}
                >
                    {entry.foto.map((f) => (
                        <KartuFoto key={f.id} foto={f} />
                    ))}
                </div>
            )}

            <div
                style={{
                    fontSize: 12,
                    color: ckColors.textMuted,
                    marginTop: 10,
                }}
            >
                Dilaporkan oleh {entry.dilaporkan_oleh}
                {entry.diverifikasi_oleh &&
                    ` · ${entry.status_verifikasi === 'ditolak' ? 'ditolak' : 'diverifikasi'} oleh ${entry.diverifikasi_oleh}`}
            </div>

            {entry.status_verifikasi === 'ditolak' &&
                entry.catatan_verifikasi && (
                    <div
                        style={{
                            fontSize: 13,
                            color: ckColors.danger,
                            marginTop: 4,
                        }}
                    >
                        Catatan: {entry.catatan_verifikasi}
                    </div>
                )}

            {entry.status_verifikasi === 'diajukan' && (
                <div style={{ display: 'flex', gap: 9, marginTop: 12 }}>
                    <button
                        type="button"
                        disabled={verifying}
                        onClick={() => verifikasi('diverifikasi')}
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
                            opacity: verifying ? 0.6 : 1,
                        }}
                    >
                        Setujui
                    </button>
                    <button
                        type="button"
                        disabled={verifying}
                        onClick={() => setTolakOpen(true)}
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
                            opacity: verifying ? 0.6 : 1,
                        }}
                    >
                        Tolak
                    </button>
                </div>
            )}

            <CkDialog open={tolakOpen} onOpenChange={setTolakOpen}>
                <CkDialogContent>
                    <CkDialogTitle>Tolak entri progres</CkDialogTitle>
                    <CkDialogDescription>
                        Jelaskan apa yang perlu diperbaiki atau diklarifikasi.
                    </CkDialogDescription>

                    <CkDialogBody>
                        <CkField label="Catatan verifikasi">
                            <CkTextarea
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                                placeholder="Mis. Persentase tidak sesuai dengan foto yang dilampirkan."
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
                            Tolak entri
                        </CkButton>
                    </CkDialogFooter>
                </CkDialogContent>
            </CkDialog>
        </CkCard>
    );
}

export function ProgresRiwayat({ entries }: { entries: ProgresEntry[] }) {
    if (entries.length === 0) {
        return (
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
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {entries.map((entry) => (
                <KartuProgres key={entry.id} entry={entry} />
            ))}
        </div>
    );
}
