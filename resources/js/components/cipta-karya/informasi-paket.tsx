import { formatCurrency } from '@/lib/utils';
import type { MasaPelaksanaan, Paket } from '@/types';
import { CkCard, CkSectionLabel } from './primitives';
import { ckColors } from './tokens';

/** Mis. "04 Mar – 12 Sep 2026 · 180 hari". */
function formatMasa(masa: MasaPelaksanaan): string {
    const mulai = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
    }).format(new Date(masa.mulai));

    const selesai = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(masa.selesai));

    return `${mulai} – ${selesai} · ${masa.hari} hari`;
}

function Baris({
    label,
    value,
    first,
}: {
    label: string;
    value: string;
    first: boolean;
}) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '13px 18px',
                borderTop: first ? undefined : `1px solid ${ckColors.border}`,
            }}
        >
            <div
                style={{
                    fontSize: 14,
                    color: ckColors.textMuted,
                    flex: 'none',
                }}
            >
                {label}
            </div>
            <div
                style={{
                    flex: 1,
                    minWidth: 0,
                    textAlign: 'right',
                    fontSize: 14,
                    fontWeight: 510,
                    color: ckColors.text,
                    fontVariantNumeric: 'tabular-nums',
                }}
            >
                {value}
            </div>
        </div>
    );
}

/**
 * Kartu ringkasan kontrak & pelaksana di halaman detail paket. Semua nilai
 * bersifat tampilan saja; penyuntingan ada di halaman ubah paket.
 */
export function InformasiPaket({
    paket,
    masaPelaksanaan,
}: {
    paket: Paket;
    masaPelaksanaan: MasaPelaksanaan | null;
}) {
    const baris: [string, string][] = [
        ['Sumber dana', paket.sumber_dana ?? '—'],
        ['Pagu', paket.pagu !== null ? formatCurrency(paket.pagu) : '—'],
        ['Nilai kontrak', formatCurrency(paket.nilai_kontrak)],
        ['Penyedia', paket.penyedia ?? '—'],
        ['Konsultan pengawas', paket.konsultan_pengawas ?? '—'],
        ['PPK', paket.ppk ?? '—'],
        ['PPTK', paket.pptk ?? '—'],
        ['No. kontrak', paket.no_kontrak ?? '—'],
        [
            'Masa pelaksanaan',
            masaPelaksanaan ? formatMasa(masaPelaksanaan) : '—',
        ],
    ];

    // Dibungkus <div>, bukan fragment: pemanggilnya menaruh komponen ini
    // langsung sebagai anak grid, dan fragment membuat label & kartunya
    // dihitung sebagai dua item — keduanya lalu mendarat di kolom berbeda.
    return (
        <div>
            <CkSectionLabel>Informasi paket</CkSectionLabel>
            <CkCard>
                {baris.map(([label, value], i) => (
                    <Baris
                        key={label}
                        label={label}
                        value={value}
                        first={i === 0}
                    />
                ))}
            </CkCard>
        </div>
    );
}
