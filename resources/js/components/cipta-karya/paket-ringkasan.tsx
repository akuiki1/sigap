import { formatDate } from '@/lib/utils';
import type {
    ChecklistSection,
    DokumenChecklistItem,
    Kelengkapan,
    MasaPelaksanaan,
    Paket,
    ProgresAgregat,
    ProgresEntry,
} from '@/types';
import { InformasiPaket } from './informasi-paket';
import {
    formatShortDate,
    LinimasaTahapan,
    tahapanPaket,
} from './linimasa-tahapan';
import { CkCard, CkChevron, CkSectionLabel } from './primitives';
import { ckColors } from './tokens';

/** Selisih hari dari hari ini ke sebuah tanggal; negatif berarti sudah lewat. */
function sisaHari(tanggal: string): number {
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);

    const target = new Date(tanggal);
    target.setHours(0, 0, 0, 0);

    return Math.round(
        (target.getTime() - hariIni.getTime()) / (24 * 60 * 60 * 1000),
    );
}

function KartuAngka({
    label,
    nilai,
    sisi,
    sisiTone = 'muted',
    persen,
    aksi,
}: {
    label: string;
    nilai: string;
    sisi?: string;
    sisiTone?: 'muted' | 'warn';
    persen?: number;
    aksi?: { label: string; onClick: () => void };
}) {
    return (
        <CkCard padded style={{ padding: '18px 20px 17px' }}>
            <div
                style={{
                    fontSize: 13,
                    color: ckColors.textMuted,
                    fontWeight: 510,
                }}
            >
                {label}
            </div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 9,
                    marginTop: 2,
                    flexWrap: 'wrap',
                }}
            >
                <div
                    style={{
                        fontSize: 40,
                        fontWeight: 600,
                        letterSpacing: '-.025em',
                        color: ckColors.text,
                        fontVariantNumeric: 'tabular-nums',
                        lineHeight: 1.05,
                    }}
                >
                    {nilai}
                </div>
                {sisi && (
                    <div
                        style={{
                            fontSize: 13.5,
                            color:
                                sisiTone === 'warn'
                                    ? ckColors.warn
                                    : ckColors.textMuted4,
                            fontWeight: sisiTone === 'warn' ? 540 : undefined,
                            fontVariantNumeric: 'tabular-nums',
                        }}
                    >
                        {sisi}
                    </div>
                )}
            </div>

            {persen !== undefined && (
                <div
                    style={{
                        height: 6,
                        borderRadius: 999,
                        background: '#EDEBE6',
                        marginTop: 12,
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            height: '100%',
                            width: `${Math.max(0, Math.min(100, persen))}%`,
                            background: ckColors.accent,
                            borderRadius: 999,
                        }}
                    />
                </div>
            )}

            {aksi && (
                <button
                    type="button"
                    onClick={aksi.onClick}
                    className="ck-link-accent"
                    style={{
                        marginTop: 12,
                        font: 'inherit',
                        fontSize: 13,
                        fontWeight: 560,
                        color: ckColors.accent,
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                    }}
                >
                    {aksi.label}
                </button>
            )}
        </CkCard>
    );
}

type Tindakan = {
    key: string;
    judul: string;
    meta: string;
    tone: 'danger' | 'warn';
    buka: () => void;
};

/**
 * Daftar "Perlu tindakan": ringkasan satu layar atas hal-hal yang menahan
 * paket ini — dokumen wajib yang kosong, berkas yang ditolak, klaim progres
 * yang belum diverifikasi, dan deviasi terhadap rencana.
 */
function susunTindakan({
    dokumen,
    riwayatProgres,
    progresAgregat,
    paket,
    bukaDokumen,
    bukaBangunan,
    bukaItem,
}: {
    dokumen: DokumenChecklistItem[];
    riwayatProgres: ProgresEntry[];
    progresAgregat: ProgresAgregat;
    paket: Paket;
    bukaDokumen: () => void;
    bukaBangunan: () => void;
    bukaItem: (item: DokumenChecklistItem) => void;
}): Tindakan[] {
    const tindakan: Tindakan[] = [];

    const wajibBelum = dokumen.filter(
        (d) => d.status === 'belum' && d.wajib && !d.berkas,
    );

    if (wajibBelum.length > 0) {
        tindakan.push({
            key: 'wajib-belum',
            judul: `${wajibBelum.length} dokumen wajib belum diunggah`,
            meta: wajibBelum.map((d) => d.nama).join(' · '),
            tone: 'danger',
            buka: bukaDokumen,
        });
    }

    const ditolak = dokumen.filter(
        (d) => d.berkas?.status_verifikasi === 'ditolak',
    );

    for (const item of ditolak) {
        tindakan.push({
            key: `ditolak-${item.id}`,
            judul: `${item.nama} ditolak`,
            meta: item.berkas?.catatan_verifikasi ?? 'Perlu diunggah ulang',
            tone: 'danger',
            buka: () => bukaItem(item),
        });
    }

    const progresDiajukan = riwayatProgres.find(
        (p) => p.status_verifikasi === 'diajukan',
    );

    if (progresDiajukan) {
        tindakan.push({
            key: 'progres-diajukan',
            judul: `Progres ${progresDiajukan.persentase}% menunggu verifikasi`,
            meta: `Dilaporkan ${formatDate(progresDiajukan.tanggal)}`,
            tone: 'warn',
            buka: bukaBangunan,
        });
    }

    if (progresAgregat.deviasi !== null && progresAgregat.deviasi < 0) {
        const pho = paket.tanggal_pho_rencana;
        const hari = pho !== null ? sisaHari(pho) : null;

        tindakan.push({
            key: 'deviasi',
            judul: `Deviasi progres ${progresAgregat.deviasi}% dari rencana`,
            meta:
                hari === null
                    ? 'Target PHO belum dijadwalkan'
                    : hari >= 0
                      ? `PHO tinggal ${hari} hari lagi`
                      : `Target PHO lewat ${Math.abs(hari)} hari`,
            tone: 'warn',
            buka: bukaBangunan,
        });
    }

    return tindakan;
}

/**
 * Kartu "Tahap berjalan": tahap kontrak berikutnya yang belum lewat, beserta
 * hitung mundurnya dan tahap-tahap yang sudah dilalui.
 */
function KartuTahap({ paket }: { paket: Paket }) {
    const tahapan = tahapanPaket(paket);
    const berjalan = tahapan.find((t) => t.state === 'current');
    const selesai = tahapan.filter((t) => t.state === 'done');

    const hari = berjalan?.date ? sisaHari(berjalan.date) : null;

    const keterangan =
        selesai.length > 0
            ? `${selesai.map((t) => t.label).join(', ')} sudah lewat.`
            : 'Belum ada tahap yang tercatat lewat.';

    return (
        <CkCard padded style={{ padding: '18px 20px 17px' }}>
            <div
                style={{
                    fontSize: 13,
                    color: ckColors.textMuted,
                    fontWeight: 510,
                }}
            >
                Tahap berjalan
            </div>
            <div
                style={{
                    fontSize: 22,
                    fontWeight: 620,
                    letterSpacing: '-.02em',
                    color: ckColors.text,
                    marginTop: 6,
                }}
            >
                {berjalan ? `Menuju ${berjalan.label}` : 'Seluruh tahap lewat'}
            </div>
            <div
                style={{
                    fontSize: 13.5,
                    color: ckColors.textMuted,
                    marginTop: 4,
                }}
            >
                {berjalan?.date
                    ? `${formatShortDate(berjalan.date)} ${new Date(berjalan.date).getFullYear()} · ${
                          hari !== null && hari >= 0
                              ? `${hari} hari lagi`
                              : `lewat ${Math.abs(hari ?? 0)} hari`
                      }`
                    : 'Tanggal belum dijadwalkan'}
            </div>
            <div
                style={{
                    fontSize: 13,
                    color: ckColors.textMuted,
                    marginTop: 12,
                    lineHeight: 1.45,
                }}
            >
                {keterangan}
            </div>
        </CkCard>
    );
}

export function PaketRingkasan({
    paket,
    statusLabel,
    kelengkapan,
    sections,
    riwayatProgres,
    progresAgregat,
    masaPelaksanaan,
    bukaDokumen,
    bukaBangunan,
    bukaItem,
}: {
    paket: Paket;
    statusLabel: string;
    kelengkapan: Kelengkapan;
    sections: ChecklistSection[];
    riwayatProgres: ProgresEntry[];
    progresAgregat: ProgresAgregat;
    masaPelaksanaan: MasaPelaksanaan | null;
    bukaDokumen: () => void;
    bukaBangunan: () => void;
    bukaItem: (item: DokumenChecklistItem) => void;
}) {
    const dokumen = sections.flatMap((s) => s.docs);
    const tindakan = susunTindakan({
        dokumen,
        riwayatProgres,
        progresAgregat,
        paket,
        bukaDokumen,
        bukaBangunan,
        bukaItem,
    });

    return (
        <div>
            <div
                style={{
                    fontSize: 13,
                    fontWeight: 520,
                    color: ckColors.textMuted,
                    letterSpacing: '.01em',
                }}
            >
                {statusLabel} · TA {paket.tahun_anggaran}
                {paket.lokasi ? ` · ${paket.lokasi}` : ''}
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
                    gap: 14,
                    marginTop: 14,
                }}
            >
                <KartuAngka
                    label="Kelengkapan dokumen"
                    nilai={`${kelengkapan.persen}%`}
                    sisi={`${kelengkapan.ada} dari ${kelengkapan.total}`}
                    persen={kelengkapan.persen}
                    aksi={{ label: 'Buka tab Dokumen →', onClick: bukaDokumen }}
                />

                <KartuAngka
                    label="Progres fisik"
                    nilai={`${progresAgregat.realisasi}%`}
                    sisi={
                        progresAgregat.deviasi === null
                            ? undefined
                            : progresAgregat.deviasi < 0
                              ? `${progresAgregat.deviasi}% dari rencana`
                              : `+${progresAgregat.deviasi}% dari rencana`
                    }
                    sisiTone={
                        progresAgregat.deviasi !== null &&
                        progresAgregat.deviasi < 0
                            ? 'warn'
                            : 'muted'
                    }
                    persen={progresAgregat.realisasi}
                    aksi={{
                        label: 'Buka tab Bangunan →',
                        onClick: bukaBangunan,
                    }}
                />

                <KartuTahap paket={paket} />
            </div>

            <div style={{ marginTop: 26 }}>
                <LinimasaTahapan paket={paket} />
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))',
                    gap: 26,
                    marginTop: 28,
                    alignItems: 'start',
                }}
            >
                <div>
                    <CkSectionLabel>Perlu tindakan</CkSectionLabel>
                    <CkCard>
                        {tindakan.length === 0 ? (
                            <div
                                style={{
                                    padding: '24px 18px',
                                    fontSize: 14,
                                    color: ckColors.textMuted,
                                    textAlign: 'center',
                                }}
                            >
                                Tidak ada yang menunggu tindakan.
                            </div>
                        ) : (
                            tindakan.map((t, i) => (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={t.buka}
                                    className="ck-row"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        width: '100%',
                                        padding: '14px 18px',
                                        border: 'none',
                                        borderTop:
                                            i === 0
                                                ? undefined
                                                : `1px solid ${ckColors.border}`,
                                        background: 'none',
                                        font: 'inherit',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background:
                                                t.tone === 'danger'
                                                    ? ckColors.danger
                                                    : ckColors.warn,
                                            flex: 'none',
                                        }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontSize: 14,
                                                color: ckColors.text,
                                                fontWeight: 530,
                                            }}
                                        >
                                            {t.judul}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 12.5,
                                                color: ckColors.textMuted,
                                                marginTop: 2,
                                            }}
                                        >
                                            {t.meta}
                                        </div>
                                    </div>
                                    <CkChevron />
                                </button>
                            ))
                        )}
                    </CkCard>
                </div>

                <InformasiPaket
                    paket={paket}
                    masaPelaksanaan={masaPelaksanaan}
                />
            </div>
        </div>
    );
}
