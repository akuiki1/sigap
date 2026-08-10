import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import {
    PengaturanSeksi,
    PengaturanShell,
} from '@/components/cipta-karya/pengaturan-shell';
import { ckColors } from '@/components/cipta-karya/tokens';

export default function Appearance() {
    return (
        <>
            <Head title="Tampilan" />

            <PengaturanShell aktif="tampilan">
                <PengaturanSeksi
                    judul="Tema"
                    deskripsi="Pilihan disimpan di peramban ini saja, bukan di akun Anda — perangkat lain punya setelannya sendiri."
                >
                    <AppearanceTabs />

                    <p
                        style={{
                            fontSize: 12.5,
                            color: ckColors.textMuted3,
                            lineHeight: 1.5,
                            margin: '14px 0 0',
                        }}
                    >
                        Layar Cipta Karya (Ringkasan, Paket, Dokumen, Pengguna)
                        memakai palet terangnya sendiri, jadi tema gelap baru
                        terasa di halaman akun seperti ini.
                    </p>
                </PengaturanSeksi>
            </PengaturanShell>
        </>
    );
}
