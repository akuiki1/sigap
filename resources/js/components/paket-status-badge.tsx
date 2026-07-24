import { Badge } from '@/components/ui/badge';
import type { StatusPaket } from '@/types';

type BadgeVariant = 'default' | 'success' | 'warning';

const statusBadge: Record<
    StatusPaket,
    { label: string; variant: BadgeVariant }
> = {
    aktif: { label: 'Aktif', variant: 'default' },
    selesai: { label: 'Selesai', variant: 'success' },
    menunggu_audit: { label: 'Menunggu Audit', variant: 'warning' },
};

export function PaketStatusBadge({ status }: { status: StatusPaket }) {
    const badge = statusBadge[status] ?? {
        label: status,
        variant: 'default' as const,
    };

    return <Badge variant={badge.variant}>{badge.label}</Badge>;
}
