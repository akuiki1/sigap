export type StatusPaket = 'aktif' | 'selesai' | 'menunggu_audit';

export type Paket = {
    id: number;
    kode_paket: string;
    nama: string;
    lokasi: string | null;
    penyedia: string | null;
    nilai_kontrak: number;
    progres: number;
    status: StatusPaket;
    tahun_anggaran: number;
    tanggal_mulai: string | null;
    tanggal_selesai: string | null;
    keterangan: string | null;
    created_at: string | null;
    updated_at: string | null;
};

export type StatusOption = {
    value: StatusPaket;
    label: string;
};

/**
 * Bentuk paginator Laravel sebagaimana diserialisasi ke props Inertia.
 */
export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
};
