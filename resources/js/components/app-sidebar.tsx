import { Link } from '@inertiajs/react';
import { FileText, Folder, Home, Search } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { review } from '@/routes/audit';
import { index as dokumenIndex } from '@/routes/dokumen';
import { index as paketIndex } from '@/routes/paket';
import type { NavItem } from '@/types';

// Label & urutan disamakan persis dengan CiptaKaryaSidebar (ringkasan/paket/
// dokumen/audit) supaya berpindah ke Settings tidak terasa seperti masuk
// aplikasi lain. Menambah menu di satu sisi berarti menambahnya di sini juga.
const mainNavItems: NavItem[] = [
    {
        title: 'Ringkasan',
        href: dashboard(),
        icon: Home,
    },
    {
        title: 'Paket',
        href: paketIndex(),
        icon: Folder,
    },
    {
        title: 'Dokumen',
        href: dokumenIndex(),
        icon: FileText,
    },
    {
        title: 'Mode audit',
        href: review(),
        icon: Search,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
