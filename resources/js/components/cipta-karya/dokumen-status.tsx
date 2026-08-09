import { formatFileSize } from '@/lib/utils';
import type { DokumenChecklistItem } from '@/types';
import { ckColors } from './tokens';

/**
 * Keadaan satu item checklist sebagaimana dibaca mata, hasil peleburan dua
 * kolom yang berbeda arti: `dokumen_paket.status` (ada/belum) dan
 * `berkas.status_verifikasi` (diajukan/diverifikasi/ditolak).
 *
 * Penolakan mengembalikan status ke "belum" (lihat BerkasController::verify),
 * jadi item ditolak selalu dikenali dari berkasnya — bukan dari statusnya.
 */
export type KeadaanDokumen =
    'diverifikasi' | 'diajukan' | 'ditolak' | 'belum-wajib' | 'belum-opsional';

export function keadaanDokumen(item: DokumenChecklistItem): KeadaanDokumen {
    if (item.berkas?.status_verifikasi === 'ditolak') {
        return 'ditolak';
    }

    if (item.status === 'ada') {
        return item.berkas?.status_verifikasi === 'diverifikasi'
            ? 'diverifikasi'
            : 'diajukan';
    }

    return item.wajib ? 'belum-wajib' : 'belum-opsional';
}

/** Item yang menghalangi kesiapan audit: wajib tapi kosong, atau ditolak. */
export function perluTindakan(item: DokumenChecklistItem): boolean {
    const keadaan = keadaanDokumen(item);

    return keadaan === 'ditolak' || keadaan === 'belum-wajib';
}

/** Lingkaran status di kiri tiap baris dokumen. */
export function IkonStatusDokumen({ keadaan }: { keadaan: KeadaanDokumen }) {
    const dasar = {
        width: 19,
        height: 19,
        borderRadius: '50%',
        flex: 'none',
        boxSizing: 'border-box',
    } as const;

    if (keadaan === 'diverifikasi') {
        return (
            <span
                style={{
                    ...dasar,
                    background: ckColors.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
        );
    }

    if (keadaan === 'diajukan') {
        return (
            <span
                style={{
                    ...dasar,
                    border: `2px solid ${ckColors.warn}`,
                    background: ckColors.warnSoft,
                }}
            />
        );
    }

    if (keadaan === 'ditolak') {
        return (
            <span
                style={{
                    ...dasar,
                    background: ckColors.dangerSoft,
                    border: `2px solid ${ckColors.danger}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <svg
                    width="9"
                    height="9"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke={ckColors.danger}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                >
                    <path d="M3 3l6 6M9 3l-6 6" />
                </svg>
            </span>
        );
    }

    return (
        <span
            style={{
                ...dasar,
                border:
                    keadaan === 'belum-wajib'
                        ? `2px solid ${ckColors.danger}`
                        : '1.5px solid #D3D1CB',
            }}
        />
    );
}

/** Baris kedua tiap item: berkas & statusnya, atau alasan ia masih kosong. */
export function metaDokumen(item: DokumenChecklistItem): string {
    if (!item.berkas) {
        return item.wajib
            ? 'Wajib · belum diunggah'
            : 'Opsional · belum diunggah';
    }

    const label =
        item.berkas.status_verifikasi === 'ditolak'
            ? 'Ditolak — perlu unggah ulang'
            : item.berkas.status_verifikasi_label;

    return [
        item.berkas.nama_asli,
        formatFileSize(item.berkas.ukuran),
        `v${item.berkas.versi}`,
        label,
    ].join(' · ');
}
