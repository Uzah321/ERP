import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Button, Tag, Tile } from '@carbon/react';

export default function ProcurementDashboard({ auth }) {
    const isAdmin = auth.user.role === 'admin';
    const isExecutive = auth.user.role === 'executive';
    const isPrivileged = isAdmin || isExecutive;
    const workflowActions = isPrivileged
        ? [
            {
                eyebrow: 'Demand Intake',
                title: 'Generate Order Request',
                description: 'Open the request workflow directly from the asset workspace so a new order request can be captured immediately.',
                href: route('asset-management.index', { request: 1 }),
                cta: 'Generate request',
                kind: 'primary',
            },
            {
                eyebrow: 'Approval',
                title: 'Create CAPEX',
                description: 'Move approved demand into the CAPEX workflow and progress sign-off without leaving procurement.',
                href: route('admin.capex.index', { create: 1 }),
                cta: 'Open CAPEX',
            },
            {
                eyebrow: 'Ordering',
                title: 'Generate Purchase Order',
                description: 'Select an approved CAPEX and build the purchase order in the live ordering workspace.',
                href: route('purchase-orders.index', { create: 1 }),
                cta: 'Open purchase orders',
            },
            {
                eyebrow: 'Receiving',
                title: 'Record Goods Receipt',
                description: 'Capture partial or complete deliveries and push received items into the downstream process.',
                href: route('goods-receipts.index', { create: 1 }),
                cta: 'Open receipts',
            },
            {
                eyebrow: 'Financial Close',
                title: 'Record Invoice',
                description: 'Open invoices in create mode so supplier billing can be recorded at the right step of the process.',
                href: route('invoices.index', { create: 1 }),
                cta: 'Record invoice',
            },
            {
                eyebrow: 'Control',
                title: 'Budget Controls',
                description: 'Check budget versus actuals once transactions are flowing through the procurement chain.',
                href: route('admin.budget-tracking'),
                cta: 'Open budget controls',
            },
            {
                eyebrow: 'Queue',
                title: 'Pending Procurement Queue',
                description: 'Review everything waiting across approvals, purchase orders, receipts, invoices, and payment follow-up.',
                href: route('procurement.pending'),
                cta: 'Open queue',
            },
            {
                eyebrow: 'Reporting',
                title: 'Analytics & Reports',
                description: 'Open the reporting workspace for procurement analytics, export packs, and monitoring views.',
                href: route('reports.index'),
                cta: 'Open analytics',
            },
        ]
        : [
            {
                eyebrow: 'Queue',
                title: 'Pending Procurement Queue',
                description: 'Review procurement items still in motion across approvals, receipt capture, invoicing, and payment follow-up.',
                href: route('procurement.pending'),
                cta: 'Open queue',
                kind: 'primary',
            },
            {
                eyebrow: 'Analytics',
                title: 'Analytics & Reports',
                description: 'Use the analytics workspace for procurement counts, recent purchase movement, and export-ready reporting.',
                href: route('reports.index'),
                cta: 'Open analytics',
            },
            {
                eyebrow: 'Workflow',
                title: 'Transaction Workspaces',
                description: 'Admins process CAPEX, purchase orders, receipts, and invoices in their dedicated workspaces; executives monitor flow and unblock decisions.',
                href: route('procurement.pending'),
                cta: 'Review workflow',
            },
        ];
    const stages = [
        'Order Request',
        'CAPEX Approval',
        'Purchase Order',
        'Goods Receipt',
        'Invoice & Payment',
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Procurement Dashboard" />

            <div className="p-6" style={{ display: 'grid', gap: '1.5rem' }}>
                <section style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(18rem, 1fr)' }}>
                    <Tile style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>
                                Procurement
                            </p>
                            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                                Procurement Workflow Hub
                            </h1>
                            <p style={{ margin: 0, maxWidth: '46rem', color: 'var(--cds-text-secondary)', lineHeight: 1.6 }}>
                                Use procurement as the operational entry point for request intake, CAPEX processing, purchase orders,
                                delivery capture, invoicing, and budget control. Analytics now live under Analytics & Reports.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {isPrivileged ? (
                                <>
                                    <Button as={Link} href={route('asset-management.index', { request: 1 })} kind="primary" size="sm">Generate order request</Button>
                                    <Button as={Link} href={route('admin.capex.index')} kind="secondary" size="sm">Create CAPEX</Button>
                                    <Button as={Link} href={route('procurement.pending')} kind="tertiary" size="sm">Open pending queue</Button>
                                </>
                            ) : (
                                <>
                                    <Button as={Link} href={route('procurement.pending')} kind="primary" size="sm">Open pending queue</Button>
                                    <Button as={Link} href={route('reports.index')} kind="tertiary" size="sm">Open analytics</Button>
                                </>
                            )}
                        </div>
                    </Tile>

                    <Tile style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Workflow Stages</h2>
                            <p style={{ margin: '0.5rem 0 0', color: 'var(--cds-text-secondary)' }}>
                                Procurement work moves through these stages in sequence.
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {stages.map((stage) => (
                                <Tag key={stage} type="cool-gray">{stage}</Tag>
                            ))}
                        </div>
                        <p style={{ margin: 0, color: 'var(--cds-text-secondary)', lineHeight: 1.6 }}>
                            {isPrivileged
                                ? 'Admins and executives can transact directly in each stage workspace from this hub.'
                                : 'Use this hub to review the queue and analytics for procurement flow.'}
                        </p>
                    </Tile>
                </section>

                <section>
                    <div style={{ marginBottom: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Procurement Actions</h2>
                        <p style={{ margin: '0.5rem 0 0', color: 'var(--cds-text-secondary)' }}>
                            Open the exact workflow stage you need instead of working from a monitoring dashboard.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                        {workflowActions.map((action) => (
                            <Tile key={action.title} style={{ padding: '1.25rem', display: 'grid', gap: '0.875rem' }}>
                                <div style={{ display: 'grid', gap: '0.375rem' }}>
                                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>
                                        {action.eyebrow}
                                    </p>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{action.title}</h3>
                                    <p style={{ margin: 0, color: 'var(--cds-text-secondary)', lineHeight: 1.55 }}>{action.description}</p>
                                </div>
                                <div>
                                    <Button as={Link} href={action.href} kind={action.kind ?? 'ghost'} size="sm">{action.cta}</Button>
                                </div>
                            </Tile>
                        ))}
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}