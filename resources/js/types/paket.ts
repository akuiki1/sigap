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

/** Pilihan siap pakai untuk <select>, dikirim dari backend agar labelnya satu sumber. */
export type Opsi<T extends string = string> = {
    value: T;
    label: string;
};

export type StatusOption = Opsi<StatusPaket>;

export type StatusDokumen = 'ada' | 'belum';

export type StatusVerifikasi = 'diajukan' | 'diverifikasi' | 'ditolak';

/** Ringkasan berkas terkini (versi berlaku) yang diunggah untuk satu item checklist. */
export type BerkasRingkas = {
    id: number;
    nama_asli: string;
    ukuran: number;
    versi: number;
    mime_type: string;
    status_verifikasi: StatusVerifikasi;
    status_verifikasi_label: string;
    catatan_verifikasi: string | null;
    diunggah_oleh: string;
    diunggah_pada: string | null;
    diverifikasi_oleh: string | null;
    diverifikasi_pada: string | null;
};

/** Satu versi berkas dalam riwayat revisi sebuah item checklist. */
export type BerkasVersi = {
    id: number;
    versi: number;
    nama_asli: string;
    ukuran: number;
    is_terkini: boolean;
    diunggah_oleh: string;
    diunggah_pada: string | null;
};

/** Satu baris checklist dokumen dalam konteks realisasi sebuah paket. */
export type DokumenChecklistItem = {
    id: number;
    nama: string;
    tahap: string;
    status: StatusDokumen;
    wajib: boolean;
    berkas: BerkasRingkas | null;
    /** Semua versi, terbaru dulu — termasuk versi yang sedang berlaku. */
    riwayat: BerkasVersi[];
};

/**
 * Ringkasan berkas terkini pada daftar dokumen lintas paket — lebih ramping
 * dari BerkasRingkas: daftar itu tidak menampilkan catatan verifikasi.
 */
export type BerkasBaris = {
    id: number;
    nama_asli: string;
    ukuran: number;
    versi: number;
    status_verifikasi: StatusVerifikasi;
    status_verifikasi_label: string;
    diunggah_oleh: string;
};

/** Satu baris pada halaman Dokumen: item checklist beserta paket pemiliknya. */
export type DokumenBaris = {
    id: number;
    nama: string;
    tahap: string;
    wajib: boolean;
    status: StatusDokumen;
    status_label: string;
    paket_id: number;
    paket_nama: string;
    paket_kode: string;
    paket_tahun: number;
    berkas: BerkasBaris | null;
};

/** Filter aktif halaman Dokumen, dikirim balik agar kontrolnya tetap terisi. */
export type DokumenFilters = {
    tahap: string | null;
    status: StatusDokumen | null;
    verifikasi: StatusVerifikasi | null;
    tahun: number | null;
    q: string | null;
};

/** Satu tahap ("Persiapan & anggaran", dst.) beserta checklist dokumennya. */
export type ChecklistSection = {
    tahap: string;
    done: number;
    total: number;
    docs: DokumenChecklistItem[];
};

/** Kelengkapan checklist dokumen sebuah paket, siap dibaca kartu ringkasan. */
export type Kelengkapan = {
    persen: number;
    ada: number;
    total: number;
};

/** Rentang masa pelaksanaan; tanggalnya mentah agar diformat di sisi React. */
export type MasaPelaksanaan = {
    mulai: string;
    selesai: string;
    hari: number;
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

/**
 * Satu kartu paket di Ringkasan. `sorot` adalah hal paling mendesak dari paket
 * ini — dokumen wajib yang kosong atau progres yang tertinggal — dan null
 * berarti paketnya tidak perlu perhatian; itu juga yang dipakai chip filter
 * "Perlu perhatian". `foto` menunjuk ke berkas foto progres terbaru.
 */
export type DashboardPackageRow = {
    id: number;
    nama: string;
    penyedia: string | null;
    nilai_kontrak: number;
    status: StatusPaket;
    status_label: string;
    progres: number;
    pho_hari: number | null;
    foto: { id: number; tanggal_label: string } | null;
    sorot: { teks: string; tone: FollowupTone } | null;
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

export type DashboardStats = {
    paket_aktif: number;
    kesiapan_audit_persen: number;
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
