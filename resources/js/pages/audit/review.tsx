import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { review } from '@/routes/audit';

export default function AuditReview() {
    return (
        <>
            <Head title="Mode Audit" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Heading
                    title="Mode Audit"
                    description="Peninjauan dan audit data proyek gedung."
                />

                <Card>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Mode audit akan tersedia di sini.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AuditReview.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Mode Audit', href: review() },
    ],
};
