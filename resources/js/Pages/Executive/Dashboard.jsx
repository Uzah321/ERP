import { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@carbon/react';
import OverviewWorkspace from '@/Components/Dashboard/OverviewWorkspace';
import { safeRoute } from '@/utils/ziggy';

const currency = (value) => '$' + Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ExecutiveDashboard({
    auth,
    metrics,
    alerts,
    quick_stats,
    chart_data,
    recent_activity: recentActivityProp,
    top_complexes,
    last_updated_at,
    supports_location_hierarchy,
    procurement_metrics: procurementMetricsProp,
    recent_purchases: recentPurchasesProp,
}) {
    const procurement_metrics = procurementMetricsProp ?? {};
    const recent_activity = recentActivityProp ?? [];
    const recent_purchases = recentPurchasesProp ?? [];
    const usersIndexHref = safeRoute('users.index');
    const procurementDashboardHref = safeRoute('procurement.dashboard');
    const storeManagementHref = safeRoute('store-management.index');
    const maintenanceHref = safeRoute('maintenance.index');
    const activityLogHref = safeRoute('activity-log.index');
    const reportsHref = safeRoute('reports.index');
    const assetManagementHref = safeRoute('asset-management.index');
    const refreshOnly = [
        'metrics',
        'alerts',
        'quick_stats',
        'chart_data',
        'recent_activity',
        'top_complexes',
        'last_updated_at',
        'supports_location_hierarchy',
        'procurement_metrics',
        'recent_purchases',
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
            eyebrow: 'Access Control',
            title: 'User Invitations',
            description: 'Invite new users into the system, assign their access role, and control account activation.',
            href: usersIndexHref,
            cta: 'Manage user access',
        },
        {
            eyebrow: 'Procurement',
            title: 'Purchase Monitoring',
            description: 'Track pending approvals, open purchase orders, and operational procurement pressure.',
            href: procurementDashboardHref,
            cta: 'Open procurement hub',
            kind: 'primary',
        },
        {
            eyebrow: 'Operations',
            title: 'Complex and Store View',
            description: 'Open the site workspace to inspect the operational footprint across complexes and shops.',
            href: storeManagementHref,
            cta: 'Open site workspace',
        },
        {
            eyebrow: 'Maintenance',
            title: 'Maintenance Exposure',
            description: 'Review the current maintenance backlog and identify assets with elevated support load.',
            href: maintenanceHref,
            cta: 'View maintenance',
        },
        {
            eyebrow: 'Audit',
            title: 'Recent Activity Feed',
            description: 'Inspect the latest asset, transfer, and administration changes with user attribution.',
            href: activityLogHref,
            cta: 'Open activity log',
        },
        {
            eyebrow: 'Reporting',
            title: 'Analytics Exports',
            description: 'Jump into the reporting workspace for asset, depreciation, and maintenance exports.',
            href: reportsHref,
            cta: 'Open reports',
        },
        {
            eyebrow: 'Asset Portfolio',
            title: 'Asset Register View',
            description: 'Inspect live asset distribution, conditions, and site assignment without leaving the dashboard context.',
            href: assetManagementHref,
            cta: 'View assets',
        },
    ];

    const supplementaryMetrics = [
        { label: 'Pending CAPEX', value: procurement_metrics.pending_capex, type: 'purple' },
        { label: 'Awaiting PO', value: procurement_metrics.approved_waiting_po, type: 'cool-gray' },
        { label: 'Open POs', value: procurement_metrics.open_purchase_orders, type: 'blue' },
        { label: 'Pending invoices', value: procurement_metrics.pending_invoices, type: 'yellow' },
        { label: 'Overdue invoices', value: procurement_metrics.overdue_invoices, type: 'red' },
        { label: 'YTD spend', value: currency(procurement_metrics.ytd_spend), type: 'green' },
    ];

    const activityPlusPurchases = recent_activity.slice(0, 6).concat(
        recent_purchases.slice(0, 2).map((purchase) => ({
            id: `purchase-${purchase.id}`,
            event: purchase.delivery_status,
            description: `Purchase order ${purchase.po_number} for ${purchase.vendor_name}`,
            causer: purchase.department,
            subject_type: 'PurchaseOrder',
            subject_id: purchase.id,
            subject_name: purchase.po_number,
            created_at: purchase.created_at,
            created_at_human: purchase.created_at,
        }))
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Executive Dashboard" />

            <OverviewWorkspace
                role="executive"
                eyebrow="Executive Summary"
                title="Executive Monitoring Dashboard"
                description="A live Carbon executive view of asset footprint, site distribution, transfer pressure, maintenance exposure, and procurement posture. The layout stays read-efficient while surfacing the actions and escalations that matter most."
                metrics={metrics}
                alerts={alerts}
                quickStats={quick_stats}
                chartData={chart_data}
                recentActivity={activityPlusPurchases}
                topComplexes={top_complexes}
                lastUpdatedAt={last_updated_at}
                quickActions={quickActions}
                supplementaryMetrics={supplementaryMetrics}
                supportsLocationHierarchy={supports_location_hierarchy}
                onRefresh={() => router.reload({ only: refreshOnly, preserveState: true, preserveScroll: true })}
                headerActions={(
                    <>
                        {usersIndexHref && <Button as={Link} href={usersIndexHref} kind="ghost" size="sm">Manage user access</Button>}
                        {procurementDashboardHref && <Button as={Link} href={procurementDashboardHref} kind="primary" size="sm">Open procurement hub</Button>}
                        {reportsHref && <Button as={Link} href={reportsHref} kind="tertiary" size="sm">Open reports</Button>}
                    </>
                )}
            />
        </AuthenticatedLayout>
    );
}