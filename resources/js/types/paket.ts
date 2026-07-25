export type StatusPaket = 'aktif' | 'selesai' | 'menunggu_audit';

export type Paket = {
    id: number;
    kode_paket: string;
    nama: string;
    lokasi: string | null;
    alamat: string | null;
    penyedia: string | null;
    sumber_dana: string | null;
    nilai_kontrak: number;
    pagu: number | null;
    progres: number;
    status: StatusPaket;
    no_kontrak: string | null;
    konsultan_pengawas: string | null;
    ppk: string | null;
    pptk: string | null;
    tahun_anggaran: number;
    tanggal_mulai: string | null;
    tanggal_selesai: string | null;
    tanggal_kontrak: string | null;
    tanggal_spmk: string | null;
    tanggal_mc0: string | null;
    tanggal_pho_rencana: string | null;
    keterangan: string | null;
    created_at: string | null;
    updated_at: string | null;
};

export type StatusOption = {
    value: StatusPaket;
    label: string;
};

export type StatusDokumen = 'ada' | 'belum';

export type StatusVerifikasi = 'diajukan' | 'diverifikasi' | 'ditolak';

/** Ringkasan berkas terkini (versi berlaku) yang diunggah untuk satu item checklist. */
export type BerkasRingkas = {
    id: number;
    nama_asli: string;
    ukuran: number;
    versi: number;
    status_verifikasi: StatusVerifikasi;
    status_verifikasi_label: string;
    catatan_verifikasi: string | null;
    diunggah_oleh: string;
    diunggah_pada: string | null;
    diverifikasi_oleh: string | null;
};

/** Satu baris checklist dokumen dalam konteks realisasi sebuah paket. */
export type DokumenChecklistItem = {
    id: number;
    nama: string;
    status: StatusDokumen;
    wajib: boolean;
    berkas: BerkasRingkas | null;
};

/** Satu tahap ("Persiapan & anggaran", dst.) beserta checklist dokumennya. */
export type ChecklistSection = {
    tahap: string;
    done: number;
    total: number;
    docs: DokumenChecklistItem[];
};

/** Satu foto pendukung dalam sebuah entri riwayat progres. */
export type ProgresFoto = {
    id: number;
    nama_asli: string;
    ukuran: number;
};

/** Satu entri riwayat progres fisik ("gedung pas X% bentuknya gimana"). */
export type ProgresEntry = {
    id: number;
    tanggal: string;
    persentase: number;
    keterangan: string | null;
    status_verifikasi: StatusVerifikasi;
    status_verifikasi_label: string;
    catatan_verifikasi: string | null;
    dilaporkan_oleh: string;
    diverifikasi_oleh: string | null;
    foto: ProgresFoto[];
};

/** Satu titik koordinat gedung pada peta. Satu paket bisa punya beberapa. */
export type TitikKoordinat = {
    id: number;
    label: string;
    latitude: number;
    longitude: number;
    keterangan: string | null;
    dicatat_oleh: string;
};

export type FollowupTone = 'warn' | 'danger';

export type FollowupItem = {
    paket_id: number;
    text: string;
    pkg: string;
    meta: string;
    tone: FollowupTone;
};

export type DashboardPackageRow = {
    id: number;
    nama: string;
    penyedia: string | null;
    nilai_kontrak: number;
    status_label: string;
    progres: number;
    flag: FollowupTone | null;
};

export type ProgresAgregatPoint = {
    label: string;
    realisasi: number | null;
    rencana: number;
};

export type ProgresAgregat = {
    points: ProgresAgregatPoint[];
    realisasi: number;
    rencana: number | null;
    deviasi: number | null;
};

export type TenggatItem = {
    paket_id: number;
    title: string;
    pkg: string;
    hari: number;
};

export type DashboardStats = {
    paket_aktif: number;
    kesiapan_audit_persen: number;
    dokumen_belum_lengkap: number;
    menuju_pho: number;
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
