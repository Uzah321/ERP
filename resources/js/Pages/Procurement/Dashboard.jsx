import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tag, Tile } from '@carbon/react';

const statusTone = {
    open: 'blue',
    partial: 'yellow',
    delivered: 'green',
    pending: 'gray',
};

const currency = (value) => `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function ActionCard({ eyebrow, title, description, href, cta, tone = 'ghost' }) {
    return (
        <Tile style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '13rem' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>{eyebrow}</p>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>{title}</h3>
                <p style={{ margin: 0, color: 'var(--cds-text-secondary)', lineHeight: 1.5 }}>{description}</p>
            </div>
            {href && cta && (
                <div style={{ marginTop: 'auto' }}>
                    <Button as={Link} prefetch={['hover', 'click']} href={href} kind={tone} size="sm">{cta}</Button>
                </div>
            )}
        </Tile>
    );
}

export default function ProcurementDashboard({ auth, metrics, recent_orders }) {
    const isAdmin = auth.user.role === 'admin';
    const metricCards = [
        { label: 'Pending approval forms', value: metrics.pending_capex },
        { label: 'Approved forms awaiting PO', value: metrics.approved_waiting_po },
        { label: 'Open purchase orders', value: metrics.open_purchase_orders },
        { label: 'Delivered awaiting invoice', value: metrics.delivered_waiting_invoice },
        { label: 'Overdue invoices', value: metrics.overdue_invoices },
        { label: 'Paid this month', value: currency(metrics.paid_this_month) },
    ];

    const workflowGroups = [
        {
            title: 'Planning & approvals',
            description: 'Start requests, review queue pressure, and convert approved demand into formal procurement work.',
            items: [
                {
                    eyebrow: 'Queue control',
                    title: 'Pending purchases',
                    description: 'Review the full pipeline of approval forms, open receipts, invoice backlog, and unpaid items.',
                    href: route('procurement.pending'),
                    cta: 'Open queue',
                    tone: 'primary',
                },
                isAdmin ? {
                    eyebrow: 'Demand intake',
                    title: 'Approval forms',
                    description: 'Create, review, and progress approval forms that drive purchasing decisions.',
                    href: route('admin.capex.index'),
                    cta: 'Manage approval forms',
                } : {
                    eyebrow: 'Visibility',
                    title: 'Approval posture',
                    description: 'Track how many requests are still waiting for approval and which departments are generating demand.',
                },
            ],
        },
        {
            title: 'Ordering & fulfilment',
            description: 'Move approved demand through vendor ordering, receiving, and operational handoff.',
            items: [
                isAdmin ? {
                    eyebrow: 'Execution',
                    title: 'Purchase orders',
                    description: 'Issue and monitor purchase orders, track delivery state, and keep vendor commitments visible.',
                    href: route('purchase-orders.index'),
                    cta: 'Open purchase orders',
                } : {
                    eyebrow: 'Execution',
                    title: 'Delivery progress',
                    description: 'Monitor open and partial deliveries without stepping into admin-only order management screens.',
                },
                isAdmin ? {
                    eyebrow: 'Receiving',
                    title: 'Goods receipts',
                    description: 'Capture arrivals, confirm what landed, and surface anything still waiting for receipt.',
                    href: route('goods-receipts.index'),
                    cta: 'Open receipts',
                } : {
                    eyebrow: 'Receiving',
                    title: 'Receipt backlog',
                    description: 'See where delivered orders still need receiving action so procurement bottlenecks stay visible.',
                },
            ],
        },
        {
            title: 'Finance & control',
            description: 'Keep invoices, payments, and budget variance under control with one procurement view.',
            items: [
                isAdmin ? {
                    eyebrow: 'Financial close',
                    title: 'Invoices & payments',
                    description: 'Register invoices, track due dates, and mark supplier payments when they are cleared.',
                    href: route('invoices.index'),
                    cta: 'Open invoices',
                } : {
                    eyebrow: 'Financial close',
                    title: 'Payment exposure',
                    description: 'Monitor overdue and unpaid invoices to understand procurement cash pressure.',
                },
                isAdmin ? {
                    eyebrow: 'Control tower',
                    title: 'Budget vs actual',
                    description: 'Compare approved spend, order value, and invoiced totals against department budgets.',
                    href: route('admin.budget-tracking'),
                    cta: 'Open budget controls',
                } : {
                    eyebrow: 'Control tower',
                    title: 'Budget posture',
                    description: 'Use the live metrics below to understand whether procurement execution is staying inside approved spend.',
                },
            ],
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Procurement Hub" />

            <div className="space-y-6">
                <Tile style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #f4f4f4 0%, #e8f3ff 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ maxWidth: '48rem' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>Procurement workspace</p>
                            <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0 0' }}>Procurement Hub</h1>
                            <p style={{ margin: '0.75rem 0 0', color: 'var(--cds-text-secondary)', lineHeight: 1.6 }}>
                                Run the full purchasing lifecycle from one place. This workspace gives leadership a clean view of pipeline pressure and gives admins direct access to the operational tools needed to move work from approval to payment.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <Button as={Link} prefetch={['hover', 'click']} href={route('procurement.pending')} kind="primary" size="sm">Open pending queue</Button>
                            {isAdmin && <Button as={Link} prefetch={['hover', 'click']} href={route('purchase-orders.index')} kind="tertiary" size="sm">Go to purchase orders</Button>}
                        </div>
                    </div>
                </Tile>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1rem' }}>
                    {metricCards.map((card) => (
                        <Tile key={card.label}>
                            <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>{card.label}</p>
                            <p style={{ margin: '0.75rem 0 0', fontSize: '1.75rem', fontWeight: 600 }}>{card.value}</p>
                        </Tile>
                    ))}
                </div>

                {workflowGroups.map((group) => (
                    <section key={group.title} className="space-y-3">
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>{group.title}</h2>
                            <p style={{ margin: '0.5rem 0 0', color: 'var(--cds-text-secondary)' }}>{group.description}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', gap: '1rem' }}>
                            {group.items.map((item) => (
                                <ActionCard key={item.title} {...item} />
                            ))}
                        </div>
                    </section>
                ))}

                <Tile>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Recent Purchase Orders</h2>
                        {isAdmin && <Button as={Link} prefetch={['hover', 'click']} href={route('purchase-orders.index')} kind="ghost" size="sm">Manage Purchase Orders</Button>}
                    </div>

                    <Table size="sm" useZebraStyles>
                        <TableHead>
                            <TableRow>
                                <TableHeader>PO</TableHeader>
                                <TableHeader>Vendor</TableHeader>
                                <TableHeader>Department</TableHeader>
                                <TableHeader>Delivery</TableHeader>
                                <TableHeader>Invoice</TableHeader>
                                <TableHeader>Total</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {recent_orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.po_number}</TableCell>
                                    <TableCell>{order.vendor_name}</TableCell>
                                    <TableCell>{order.department}</TableCell>
                                    <TableCell><Tag type={statusTone[order.delivery_status] ?? 'gray'}>{order.delivery_status}</Tag></TableCell>
                                    <TableCell><Tag type={order.invoice_status === 'pending' ? 'yellow' : 'green'}>{order.invoice_status}</Tag></TableCell>
                                    <TableCell>{currency(order.total_amount)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Tile>
            </div>
        </AuthenticatedLayout>
    );
}