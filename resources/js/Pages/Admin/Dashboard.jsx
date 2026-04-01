import { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@carbon/react';
import OverviewWorkspace from '@/Components/Dashboard/OverviewWorkspace';

export default function AdminDashboard({
    auth,
    metrics: metricsProp,
    alerts,
    quick_stats,
    chart_data,
    recent_activity,
    top_complexes,
    last_updated_at,
    supports_location_hierarchy,
}) {
    const metrics = metricsProp ?? {};
    const refreshOnly = [
        'metrics',
        'alerts',
        'quick_stats',
        'chart_data',
        'recent_activity',
        'top_complexes',
        'last_updated_at',
        'supports_location_hierarchy',
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: refreshOnly,
                preserveState: true,
                preserveScroll: true,
            });
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const quickActions = [
        {
            eyebrow: 'Asset Operations',
            title: 'Asset Register',
            description: 'Create, update, transfer, and audit live assets from the master register.',
            href: route('asset-management.index'),
            cta: 'Open asset register',
            kind: 'primary',
        },
        {
            eyebrow: 'Administration',
            title: 'Departments',
            description: 'Maintain department ownership and operational structure for the asset estate.',
            href: route('admin.departments.index'),
            cta: 'Manage departments',
        },
        {
            eyebrow: 'Sites & Stores',
            title: 'Complexes and Shops',
            description: 'Maintain complexes, stores, and the assets attached to each site footprint.',
            href: route('store-management.index'),
            cta: 'Open site workspace',
        },
        {
            eyebrow: 'Allocation Control',
            title: 'Transfers and Allocations',
            description: 'Approve transfer requests, allocate equipment, and process returns in one place.',
            href: route('admin.allocations.index'),
            cta: 'Review transfer queue',
        },
        {
            eyebrow: 'Maintenance',
            title: 'Repair Tracking',
            description: 'Monitor repair workload and investigate asset maintenance history before costs escalate.',
            href: route('maintenance.index'),
            cta: 'Open maintenance',
        },
        {
            eyebrow: 'Audit Trail',
            title: 'Activity Intelligence',
            description: 'Inspect user actions, field-level changes, and system-level events in real time.',
            href: route('activity-log.index'),
            cta: 'Open activity log',
        },
    ];

    const supplementaryMetrics = [
        { label: 'Pending transfers', value: metrics.pending_transfers, type: 'red' },
        { label: 'Open maintenance', value: metrics.open_maintenance, type: 'yellow' },
        { label: 'New assets today', value: metrics.new_assets_today, type: 'green' },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Admin Dashboard" />

            <OverviewWorkspace
                role="admin"
                eyebrow="Administration"
                title="Admin Control Dashboard"
                description="A live Carbon control center for assets, users, transfers, maintenance, and site coverage. Use it to monitor operational pressure and jump directly into the CRUD workspaces that run the estate."
                metrics={metrics}
                alerts={alerts}
                quickStats={quick_stats}
                chartData={chart_data}
                recentActivity={recent_activity}
                topComplexes={top_complexes}
                lastUpdatedAt={last_updated_at}
                quickActions={quickActions}
                supplementaryMetrics={supplementaryMetrics}
                supportsLocationHierarchy={supports_location_hierarchy}
                onRefresh={() => router.reload({ only: refreshOnly, preserveState: true, preserveScroll: true })}
                headerActions={(
                    <>
                        <Button as={Link} href={route('asset-management.index')} kind="primary" size="sm">Open asset register</Button>
                        <Button as={Link} href={route('admin.departments.index')} kind="tertiary" size="sm">Manage departments</Button>
                    </>
                )}
            />
        </AuthenticatedLayout>
    );
}
