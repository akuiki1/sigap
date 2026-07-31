import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import {
    CkCard,
    CkChevron,
    VerifikasiBadge,
} from '@/components/cipta-karya/primitives';
import { CiptaKaryaSidebar } from '@/components/cipta-karya/sidebar';
import { ckColors, ckFont } from '@/components/cipta-karya/tokens';
import { formatFileSize } from '@/lib/utils';
import { download } from '@/routes/berkas';
import { index } from '@/routes/dokumen';
import { show } from '@/routes/paket';
import type {
    DokumenBaris,
    DokumenFilters,
    Opsi,
    Paginated,
    StatusDokumen,
    StatusVerifikasi,
} from '@/types';

type Props = {
    dokumen: Paginated<DokumenBaris>;
    filters: DokumenFilters;
    tahapOptions: string[];
    statusOptions: Opsi<StatusDokumen>[];
    verifikasiOptions: Opsi<StatusVerifikasi>[];
    tahunOptions: number[];
};

/** Nilai kosong pada <select> — string kosong lebih ramah daripada null di DOM. */
const SEMUA = '';

const kontrolStyle: CSSProperties = {
    padding: '7px 10px',
    borderRadius: 10,
    border: `1px solid ${ckColors.border}`,
    background: '#fff',
    color: ckColors.text,
    fontSize: 13,
    fontWeight: 520,
    fontFamily: 'inherit',
    outline: 'none',
};

export default function DokumenIndex({
    dokumen,
    filters,
    tahapOptions,
    statusOptions,
    verifikasiOptions,
    tahunOptions,
}: Props) {
    const { data, current_page, last_page, from, to, total } = dokumen;
    const [cari, setCari] = useState(filters.q ?? '');

    /**
     * Setiap perubahan filter memulai ulang dari halaman 1: bertahan di
     * halaman 7 setelah menyempitkan hasil hampir selalu berujung kosong.
     */
    const terapkan = (perubahan: Record<string, string | number | null>) => {
        const query: Record<string, string | number> = {};

        const gabungan = {
            tahap: filters.tahap,
            status: filters.status,
            verifikasi: filters.verifikasi,
            tahun: filters.tahun,
            q: cari.trim() || null,
            ...perubahan,
        };

        for (const [key, value] of Object.entries(gabungan)) {
            if (value !== null && value !== '') {
                query[key] = value;
            }
        }

        router.get(
            index({ query }).url,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const adaFilter =
        filters.tahap !== null ||
        filters.status !== null ||
        filters.verifikasi !== null ||
        filters.tahun !== null ||
        filters.q !== null;

    return (
        <>
            <Head title="Dokumen" />

            <div
                style={{
                    display: 'flex',
                    height: '100vh',
                    width: '100%',
                    background: ckColors.bg,
                    color: ckColors.text,
                    overflow: 'hidden',
                    fontFamily: ckFont,
                    WebkitFontSmoothing: 'antialiased',
                }}
            >
                <CiptaKaryaSidebar active="dokumen" />

                <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
                    <div
                        style={{
                            maxWidth: 1180,
                            margin: '0 auto',
                            padding: '40px 48px 72px',
                        }}
                    >
                        <div className="flex flex-col gap-6">
                            <header
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 4,
                                    marginBottom: 8,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 520,
                                        color: ckColors.textMuted,
                                        letterSpacing: '.01em',
                                    }}
                                >
                                    Kelengkapan Dokumen · Bidang Cipta Karya
                                </div>
                                <h1
                                    style={{
                                        fontSize: 28,
                                        fontWeight: 680,
                                        letterSpacing: '-.025em',
                                        color: ckColors.text,
                                        marginTop: 3,
                                        marginBottom: 0,
                                    }}
                                >
                                    Dokumen
                                </h1>
                                <p
                                    style={{
                                        fontSize: 14.5,
                                        color: ckColors.textMuted,
                                        margin: '4px 0 0 0',
                                    }}
                                >
                                    Telusuri checklist dokumen dari seluruh
                                    paket dalam satu daftar.
                                </p>
                            </header>

                            <CkCard padded>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        alignItems: 'center',
                                        gap: 8,
                                    }}
                                >
                                    <input
                                        className="ck-kontrol"
                                        type="search"
                                        value={cari}
                                        placeholder="Cari dokumen atau paket…"
                                        onChange={(e) =>
                                            setCari(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                terapkan({
                                                    q: cari.trim() || null,
                                                });
                                            }
                                        }}
                                        onBlur={() =>
                                            terapkan({ q: cari.trim() || null })
                                        }
                                        style={{
                                            ...kontrolStyle,
                                            flex: 1,
                                            minWidth: 200,
                                        }}
                                    />

                                    <select
                                        className="ck-kontrol"
                                        value={filters.tahap ?? SEMUA}
                                        onChange={(e) =>
                                            terapkan({
                                                tahap: e.target.value || null,
                                            })
                                        }
                                        style={kontrolStyle}
                                    >
                                        <option value={SEMUA}>
                                            Semua tahap
                                        </option>
                                        {tahapOptions.map((tahap) => (
                                            <option key={tahap} value={tahap}>
                                                {tahap}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        className="ck-kontrol"
                                        value={filters.status ?? SEMUA}
                                        onChange={(e) =>
                                            terapkan({
                                                status: e.target.value || null,
                                            })
                                        }
                                        style={kontrolStyle}
                                    >
                                        <option value={SEMUA}>
                                            Ada & belum
                                        </option>
                                        {statusOptions.map((opsi) => (
                                            <option
                                                key={opsi.value}
                                                value={opsi.value}
                                            >
                                                {opsi.label}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        className="ck-kontrol"
                                        value={filters.verifikasi ?? SEMUA}
                                        onChange={(e) =>
                                            terapkan({
                                                verifikasi:
                                                    e.target.value || null,
                                            })
                                        }
                                        style={kontrolStyle}
                                    >
                                        <option value={SEMUA}>
                                            Semua verifikasi
                                        </option>
                                        {verifikasiOptions.map((opsi) => (
                                            <option
                                                key={opsi.value}
                                                value={opsi.value}
                                            >
                                                {opsi.label}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        className="ck-kontrol"
                                        value={filters.tahun ?? SEMUA}
                                        onChange={(e) =>
                                            terapkan({
                                                tahun: e.target.value || null,
                                            })
                                        }
                                        style={kontrolStyle}
                                    >
                                        <option value={SEMUA}>Semua TA</option>
                                        {tahunOptions.map((tahun) => (
                                            <option key={tahun} value={tahun}>
                                                TA {tahun}
                                            </option>
                                        ))}
                                    </select>

                                    {adaFilter && (
                                        <button
                                            type="button"
                                            className="ck-link-accent"
                                            onClick={() => {
                                                setCari('');
                                                router.get(
                                                    index().url,
                                                    {},
                                                    {
                                                        preserveScroll: true,
                                                        replace: true,
                                                    },
                                                );
                                            }}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                padding: '7px 4px',
                                                cursor: 'pointer',
                                                font: 'inherit',
                                                fontSize: 13,
                                                fontWeight: 540,
                                                color: ckColors.accent,
                                            }}
                                        >
                                            Bersihkan
                                        </button>
                                    )}
                                </div>
                            </CkCard>

                            <CkCard>
                                {data.length === 0 ? (
                                    <div
                                        style={{
                                            padding: '36px 18px',
                                            fontSize: 14.5,
                                            color: ckColors.textMuted,
                                            textAlign: 'center',
                                        }}
                                    >
                                        {adaFilter
                                            ? 'Tidak ada dokumen yang cocok dengan filter ini.'
                                            : 'Belum ada checklist dokumen tercatat.'}
                                    </div>
                                ) : (
                                    data.map((baris, i) => (
                                        <BarisDokumen
                                            key={baris.id}
                                            baris={baris}
                                            first={i === 0}
                                        />
                                    ))
                                )}
                            </CkCard>

                            {last_page > 1 && (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginTop: 8,
                                        padding: '0 4px',
                                    }}
                                >
                                    <p
                                        style={{
                                            fontSize: 13.5,
                                            color: ckColors.textMuted,
                                        }}
                                    >
                                        Menampilkan {from ?? 0}–{to ?? 0} dari{' '}
                                        {total} dokumen
                                    </p>

                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <TombolHalaman
                                            label="Sebelumnya"
                                            halaman={current_page - 1}
                                            aktif={current_page > 1}
                                            filters={filters}
                                        />
                                        <TombolHalaman
                                            label="Berikutnya"
                                            halaman={current_page + 1}
                                            aktif={current_page < last_page}
                                            filters={filters}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

/**
 * Satu baris dokumen. Barisnya sengaja bukan satu <Link> utuh seperti di
 * daftar paket: di sini ada dua tujuan berbeda (buka paket & unduh berkas),
 * dan menyarangkan <a> unduh di dalam <a> baris bukan HTML yang sah.
 */
function BarisDokumen({
    baris,
    first,
}: {
    baris: DokumenBaris;
    first: boolean;
}) {
    const ada = baris.status === 'ada';

    return (
        <div
            className="ck-row"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 13,
                padding: '14px 18px',
                borderTop: first ? undefined : `1px solid ${ckColors.border}`,
            }}
        >
            <Link
                href={show(baris.paket_id)}
                style={{ flex: 1, minWidth: 0, display: 'block' }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                    }}
                >
                    <span
                        style={{
                            fontSize: 15.5,
                            fontWeight: 580,
                            letterSpacing: '-.015em',
                            color: ckColors.text,
                        }}
                    >
                        {baris.nama}
                    </span>
                    {baris.wajib && (
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 590,
                                padding: '1px 6px',
                                borderRadius: 999,
                                color: ckColors.textMuted,
                                background: 'rgba(0,0,0,.05)',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Wajib
                        </span>
                    )}
                </div>
                <div
                    style={{
                        fontSize: 12.5,
                        color: ckColors.textMuted2,
                        marginTop: 3.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        flexWrap: 'wrap',
                    }}
                >
                    <span
                        style={{
                            fontFamily: 'monospace',
                            fontSize: 11,
                            background: 'rgba(0,0,0,.04)',
                            padding: '1px 5px',
                            borderRadius: 4,
                            color: ckColors.textMuted,
                        }}
                    >
                        {baris.paket_kode}
                    </span>
                    <span>{baris.paket_nama}</span>
                    <span>•</span>
                    <span>{baris.tahap}</span>
                    {baris.berkas && (
                        <>
                            <span>•</span>
                            <span>
                                v{baris.berkas.versi} ·{' '}
                                {formatFileSize(baris.berkas.ukuran)}
                            </span>
                        </>
                    )}
                </div>
            </Link>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                }}
            >
                {baris.berkas ? (
                    <VerifikasiBadge
                        status={baris.berkas.status_verifikasi}
                        label={baris.berkas.status_verifikasi_label}
                    />
                ) : (
                    <span
                        style={{
                            fontSize: 11.5,
                            fontWeight: 590,
                            padding: '2px 8px',
                            borderRadius: 999,
                            color: ada ? ckColors.textMuted : ckColors.danger,
                            background: ada
                                ? 'rgba(0,0,0,.05)'
                                : ckColors.dangerSoft,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {baris.status_label}
                    </span>
                )}

                {baris.berkas && (
                    // Tautan biasa, bukan <Link> Inertia: route berkas.download
                    // menstreaming berkas, bukan mengembalikan respons Inertia.
                    <a
                        href={download(baris.berkas.id).url}
                        className="ck-link-accent"
                        title={baris.berkas.nama_asli}
                        style={{
                            fontSize: 12.5,
                            fontWeight: 550,
                            color: ckColors.accent,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Unduh
                    </a>
                )}

                <CkChevron />
            </div>
        </div>
    );
}

/** Tombol paginasi yang membawa serta filter aktif. */
function TombolHalaman({
    label,
    halaman,
    aktif,
    filters,
}: {
    label: string;
    halaman: number;
    aktif: boolean;
    filters: DokumenFilters;
}) {
    const style: CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '7px 13px',
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 550,
    };

    if (!aktif) {
        return (
            <span
                style={{
                    ...style,
                    border: `1px solid ${ckColors.borderSoft}`,
                    color: ckColors.textMuted4,
                    opacity: 0.5,
                }}
            >
                {label}
            </span>
        );
    }

    const query: Record<string, string | number> = { page: halaman };

    for (const [key, value] of Object.entries(filters)) {
        if (value !== null) {
            query[key] = value;
        }
    }

    return (
        <Link
            href={index({ query })}
            className="ck-btn-accent"
            style={{
                ...style,
                border: `1px solid ${ckColors.border}`,
                color: ckColors.text,
                cursor: 'pointer',
            }}
        >
            {label}
        </Link>
    );
}
