import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import type { ChecklistSection, DokumenChecklistItem } from '@/types';
import {
    IkonStatusDokumen,
    keadaanDokumen,
    metaDokumen,
    perluTindakan,
} from './dokumen-status';
import { CkCard } from './primitives';
import { ckColors } from './tokens';

const FILTER = ['Semua', 'Wajib', 'Belum ada', 'Sudah ada'] as const;

type Filter = (typeof FILTER)[number];

function TombolAksi({
    children,
    onClick,
    variant,
}: {
    children: string;
    onClick: () => void;
    variant: 'primary' | 'ghost' | 'soft';
}) {
    const gaya =
        variant === 'primary'
            ? { color: '#fff', background: ckColors.accent, border: 'none' }
            : variant === 'ghost'
              ? {
                    color: ckColors.text,
                    background: '#fff',
                    border: '1px solid rgba(0,0,0,.13)',
                }
              : {
                    color: ckColors.accent,
                    background: 'rgba(0,102,179,.1)',
                    border: 'none',
                };

    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                font: 'inherit',
                fontSize: 12.5,
                fontWeight: variant === 'primary' ? 570 : 560,
                borderRadius: 9,
                padding: '7px 13px',
                cursor: 'pointer',
                minHeight: 34,
                whiteSpace: 'nowrap',
                ...gaya,
            }}
        >
            {children}
        </button>
    );
}

/** Baris pada kartu merah "Butuh tindakan sekarang". */
function BarisTindakan({
    item,
    canInput,
    onLihat,
    onUnggah,
    first,
}: {
    item: DokumenChecklistItem;
    canInput: boolean;
    onLihat: (item: DokumenChecklistItem) => void;
    onUnggah: (item: DokumenChecklistItem) => void;
    first: boolean;
}) {
    const ditolak = item.berkas?.status_verifikasi === 'ditolak';

    const meta = ditolak
        ? `Ditolak${
              item.berkas?.diverifikasi_pada
                  ? ` ${formatDate(item.berkas.diverifikasi_pada.slice(0, 10))}`
                  : ''
          }${
              item.berkas?.catatan_verifikasi
                  ? ` — ${item.berkas.catatan_verifikasi}`
                  : ''
          }`
        : `${item.tahap} · wajib untuk kesiapan audit`;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 13,
                padding: '13px 18px',
                borderTop: first ? undefined : `1px solid ${ckColors.border}`,
                flexWrap: 'wrap',
            }}
        >
            <IkonStatusDokumen keadaan={keadaanDokumen(item)} />

            <div style={{ flex: 1, minWidth: 200 }}>
                <div
                    style={{
                        fontSize: 14.5,
                        color: ckColors.text,
                        fontWeight: 530,
                    }}
                >
                    {item.nama}
                </div>
                <div
                    style={{
                        fontSize: 12.5,
                        color: ckColors.textMuted,
                        marginTop: 3,
                    }}
                >
                    {meta}
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flex: 'none' }}>
                {item.berkas && (
                    <TombolAksi variant="ghost" onClick={() => onLihat(item)}>
                        Lihat
                    </TombolAksi>
                )}
                {canInput && (
                    <TombolAksi
                        variant="primary"
                        onClick={() => onUnggah(item)}
                    >
                        {ditolak ? 'Unggah ulang' : 'Unggah'}
                    </TombolAksi>
                )}
            </div>
        </div>
    );
}

function BarisDokumen({
    item,
    canInput,
    onLihat,
    onUnggah,
    first,
}: {
    item: DokumenChecklistItem;
    canInput: boolean;
    onLihat: (item: DokumenChecklistItem) => void;
    onUnggah: (item: DokumenChecklistItem) => void;
    first: boolean;
}) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 13,
                padding: '12px 18px',
                borderTop: first ? undefined : `1px solid ${ckColors.border}`,
                flexWrap: 'wrap',
            }}
        >
            <IkonStatusDokumen keadaan={keadaanDokumen(item)} />

            <div style={{ flex: 1, minWidth: 190 }}>
                <div style={{ fontSize: 14.5, color: ckColors.text }}>
                    {item.nama}
                </div>
                <div
                    style={{
                        fontSize: 12.5,
                        color: ckColors.textMuted,
                        marginTop: 3,
                    }}
                >
                    {metaDokumen(item)}
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flex: 'none',
                }}
            >
                {item.berkas ? (
                    <TombolAksi variant="soft" onClick={() => onLihat(item)}>
                        Lihat
                    </TombolAksi>
                ) : (
                    canInput && (
                        <TombolAksi
                            variant="soft"
                            onClick={() => onUnggah(item)}
                        >
                            Unggah
                        </TombolAksi>
                    )
                )}
            </div>
        </div>
    );
}

export function PaketDokumen({
    sections,
    canInput,
    onLihat,
    onUnggah,
    onUnggahBaru,
}: {
    sections: ChecklistSection[];
    canInput: boolean;
    onLihat: (item: DokumenChecklistItem) => void;
    onUnggah: (item: DokumenChecklistItem) => void;
    onUnggahBaru: () => void;
}) {
    const [filter, setFilter] = useState<Filter>('Semua');
    const [cari, setCari] = useState('');
    const [tertutup, setTertutup] = useState<Record<string, boolean>>({});

    const semua = sections.flatMap((s) => s.docs);
    const tindakan = semua.filter(perluTindakan);
    const lengkap = semua.filter((d) => d.status === 'ada').length;
    const wajibBelum = semua.filter(
        (d) => d.status === 'belum' && d.wajib && !d.berkas,
    ).length;
    const ditolak = semua.filter(
        (d) => d.berkas?.status_verifikasi === 'ditolak',
    ).length;

    function cocok(item: DokumenChecklistItem): boolean {
        const kata = cari.trim().toLowerCase();

        if (kata !== '' && !item.nama.toLowerCase().includes(kata)) {
            return false;
        }

        if (filter === 'Wajib') {
            return item.wajib;
        }

        if (filter === 'Belum ada') {
            return item.status === 'belum';
        }

        if (filter === 'Sudah ada') {
            return item.status === 'ada';
        }

        return true;
    }

    const ringkasan = [
        `${lengkap} dari ${semua.length} lengkap`,
        wajibBelum > 0 ? `${wajibBelum} wajib belum diunggah` : null,
        ditolak > 0 ? `${ditolak} ditolak` : null,
    ]
        .filter((s) => s !== null)
        .join(' · ');

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 14,
                    flexWrap: 'wrap',
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: 20,
                            fontWeight: 640,
                            letterSpacing: '-.02em',
                            color: ckColors.text,
                        }}
                    >
                        Dokumen paket
                    </div>
                    <div
                        style={{
                            fontSize: 13.5,
                            color: ckColors.textMuted,
                            marginTop: 3,
                        }}
                    >
                        {ringkasan}
                    </div>
                </div>

                {canInput && (
                    <button
                        type="button"
                        onClick={onUnggahBaru}
                        style={{
                            font: 'inherit',
                            fontSize: 13,
                            fontWeight: 570,
                            color: '#fff',
                            background: ckColors.accent,
                            border: 'none',
                            borderRadius: 10,
                            padding: '9px 15px',
                            cursor: 'pointer',
                            flex: 'none',
                        }}
                    >
                        Unggah dokumen
                    </button>
                )}
            </div>

            {tindakan.length > 0 && (
                <CkCard
                    style={{
                        marginTop: 16,
                        borderLeft: `3px solid ${ckColors.danger}`,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                            padding: '13px 18px',
                            flexWrap: 'wrap',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 14,
                                fontWeight: 610,
                                letterSpacing: '-.01em',
                                color: ckColors.text,
                            }}
                        >
                            Butuh tindakan sekarang
                        </div>
                        <div
                            style={{
                                fontSize: 12.5,
                                color: ckColors.textMuted,
                            }}
                        >
                            {tindakan.length} item
                        </div>
                    </div>

                    {tindakan.map((item) => (
                        <BarisTindakan
                            key={item.id}
                            item={item}
                            canInput={canInput}
                            onLihat={onLihat}
                            onUnggah={onUnggah}
                            first={false}
                        />
                    ))}
                </CkCard>
            )}

            <div
                style={{
                    display: 'flex',
                    gap: 8,
                    marginTop: 26,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}
            >
                {FILTER.map((label) => {
                    const aktif = filter === label;

                    return (
                        <button
                            key={label}
                            type="button"
                            onClick={() => setFilter(label)}
                            className={aktif ? undefined : 'ck-row'}
                            style={{
                                font: 'inherit',
                                fontSize: 13,
                                fontWeight: aktif ? 570 : 530,
                                color: aktif ? '#fff' : '#5F5D57',
                                background: aktif ? ckColors.accent : '#fff',
                                border: `1px solid ${aktif ? ckColors.accent : 'rgba(0,0,0,.13)'}`,
                                borderRadius: 999,
                                padding: '6px 13px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {label}
                        </button>
                    );
                })}

                <input
                    value={cari}
                    onChange={(e) => setCari(e.target.value)}
                    placeholder="Cari nama dokumen…"
                    className="ck-kontrol"
                    style={{
                        flex: 1,
                        minWidth: 180,
                        font: 'inherit',
                        fontSize: 13.5,
                        padding: '7px 12px',
                        border: '1px solid #E2E0DA',
                        borderRadius: 999,
                        color: ckColors.text,
                        background: '#fff',
                        outline: 'none',
                    }}
                />
            </div>

            {sections.map((sec) => {
                const tampil = sec.docs.filter(cocok);
                const terbuka = !tertutup[sec.tahap] && tampil.length > 0;

                return (
                    <div key={sec.tahap} style={{ marginTop: 20 }}>
                        <button
                            type="button"
                            onClick={() =>
                                setTertutup((s) => ({
                                    ...s,
                                    [sec.tahap]: !s[sec.tahap],
                                }))
                            }
                            className="ck-link-accent"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 9,
                                width: '100%',
                                margin: '0 0 8px',
                                padding: '0 6px',
                                background: 'none',
                                border: 'none',
                                font: 'inherit',
                                cursor: 'pointer',
                                textAlign: 'left',
                            }}
                        >
                            {terbuka ? (
                                <svg
                                    width="11"
                                    height="7"
                                    viewBox="0 0 11 7"
                                    fill="none"
                                    stroke={ckColors.textMuted}
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ flex: 'none' }}
                                >
                                    <path d="M1 1.5l4.5 4 4.5-4" />
                                </svg>
                            ) : (
                                <svg
                                    width="7"
                                    height="11"
                                    viewBox="0 0 7 11"
                                    fill="none"
                                    stroke={ckColors.textMuted}
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ flex: 'none' }}
                                >
                                    <path d="M1.5 1l4 4.5-4 4.5" />
                                </svg>
                            )}
                            <div
                                style={{
                                    fontSize: 14,
                                    fontWeight: 610,
                                    letterSpacing: '-.01em',
                                    color: ckColors.text,
                                    flex: 1,
                                }}
                            >
                                {sec.tahap}
                            </div>
                            <div
                                style={{
                                    fontSize: 13,
                                    color: ckColors.textMuted4,
                                    fontVariantNumeric: 'tabular-nums',
                                }}
                            >
                                {sec.done}/{sec.total}
                            </div>
                        </button>

                        {terbuka && (
                            <CkCard>
                                {tampil.map((item, i) => (
                                    <BarisDokumen
                                        key={item.id}
                                        item={item}
                                        canInput={canInput}
                                        onLihat={onLihat}
                                        onUnggah={onUnggah}
                                        first={i === 0}
                                    />
                                ))}
                            </CkCard>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
