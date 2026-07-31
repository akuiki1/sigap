import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            // Dashboard Cipta Karya (Ringkasan + Detail paket) membawa shell
            // (sidebar, tipografi, palet) sendiri sesuai handoff desainnya —
            // lihat resources/js/components/cipta-karya/ — jadi tidak dibungkus
            // AppLayout/AppSidebar standar seperti halaman lain.
            case name === 'dashboard':
            case name.startsWith('paket/'):
            case name.startsWith('dokumen/'):
            case name === 'audit/review':
                return null;
            // Halaman Masuk juga membawa shell sendiri (panel kiri bergradasi
            // + kanvas krem) sesuai handoff desain, jadi tidak dibungkus
            // AuthLayout yang dipakai halaman auth lainnya.
            case name === 'auth/login':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
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
