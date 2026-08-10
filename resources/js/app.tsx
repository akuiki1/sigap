import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AuthLayout from '@/layouts/auth-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            // Halaman Masuk membawa shell sendiri (panel kiri bergradasi +
            // kanvas krem) sesuai handoff desain, jadi tidak dibungkus
            // AuthLayout yang dipakai halaman auth lainnya.
            case name === 'auth/login':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            // Sisanya — termasuk Pengaturan — membawa CiptaKaryaShell sendiri
            // (lihat resources/js/components/cipta-karya/), jadi tidak boleh
            // dibungkus layout apa pun di sini. AuthLayout satu-satunya yang
            // tersisa; chrome shadcn lama (AppLayout + AppSidebar) sudah
            // dihapus seluruhnya.
            default:
                return null;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
