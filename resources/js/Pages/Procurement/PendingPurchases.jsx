import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tag, Tile } from '@carbon/react';

const currency = (value) => `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusTone = {
    pending: 'blue',
    open: 'blue',
    partial: 'yellow',
    approved: 'green',
    overdue: 'red',
};

function QueueTable({ title, columns, rows, emptyText }) {
    return (
        <Tile>
            <h2 style={{ marginTop: 0, fontSize: '1rem', fontWeight: 600 }}>{title}</h2>
            {rows.length === 0 ? (
                <p style={{ color: 'var(--cds-text-secondary)', marginBottom: 0 }}>{emptyText}</p>
            ) : (
                <Table size="sm" useZebraStyles>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => <TableHeader key={column.key}>{column.label}</TableHeader>)}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={`${title}-${row.id}`}>
                                {columns.map((column) => (
                                    <TableCell key={column.key}>
                                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </Tile>
    );
}

export default function PendingPurchases({ auth, pending_capex, approved_waiting_po, open_receipts, awaiting_invoices, unpaid_invoices }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Pending Purchases" />

            <div className="space-y-6">
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0 }}>Pending Purchases</h1>
                    <p style={{ margin: '0.5rem 0 0', color: 'var(--cds-text-secondary)', maxWidth: '52rem' }}>
                        A single queue for work still moving through the purchasing lifecycle, from approval forms to unpaid invoices.
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    <QueueTable
                        title="Approval Forms Awaiting Approval"
                        emptyText="No approval forms are currently pending."
                        rows={pending_capex}
                        columns={[
                            { key: 'reference', label: 'Reference' },
                            { key: 'department', label: 'Department' },
                            { key: 'status', label: 'Status', render: (value) => <Tag type={statusTone[value] ?? 'gray'}>{value}</Tag> },
                            { key: 'total_amount', label: 'Total', render: (value) => currency(value) },
                            { key: 'created_at', label: 'Created' },
                            {
                                key: 'action',
                                label: 'Action',
                                render: (_, row) => row.asset_request_id ? (
                                    <Button
                                        as={Link}
                                        href={route('admin.capex.index', { create: 1, asset_request_id: row.asset_request_id })}
                                        kind="ghost"
                                        size="sm"
                                    >
                                        Open source request
                                    </Button>
                                ) : '—',
                            },
                        ]}
                    />

                    <QueueTable
                        title="Approved Forms Waiting for Purchase Orders"
                        emptyText="No approved forms are waiting for purchase orders."
                        rows={approved_waiting_po}
                        columns={[
                            { key: 'reference', label: 'Reference' },
                            { key: 'department', label: 'Department' },
                            { key: 'total_amount', label: 'Total', render: (value) => currency(value) },
                            { key: 'created_at', label: 'Approved' },
                            {
                                key: 'action',
                                label: 'Action',
                                render: (_, row) => (
                                    <Button
                                        as={Link}
                                        href={route('purchase-orders.index', { create: 1, capex_id: row.id })}
                                        kind="ghost"
                                        size="sm"
                                    >
                                        Generate PO
                                    </Button>
                                ),
                            },
                        ]}
                    />

                    <QueueTable
                        title="Open Deliveries Awaiting Receipt"
                        emptyText="No open purchase orders are awaiting receipts."
                        rows={open_receipts}
                        columns={[
                            { key: 'po_number', label: 'PO' },
                            { key: 'vendor_name', label: 'Vendor' },
                            { key: 'department', label: 'Department' },
                            { key: 'delivery_status', label: 'Delivery', render: (value) => <Tag type={statusTone[value] ?? 'gray'}>{value}</Tag> },
                            { key: 'total_amount', label: 'Total', render: (value) => currency(value) },
                            {
                                key: 'action',
                                label: 'Action',
                                render: (_, row) => (
                                    <Button
                                        as={Link}
                                        href={route('goods-receipts.index', { create: 1, po_id: row.id })}
                                        kind="ghost"
                                        size="sm"
                                    >
                                        Record receipt
                                    </Button>
                                ),
                            },
                        ]}
                    />

                    <QueueTable
                        title="Delivered Purchase Orders Awaiting Invoice"
                        emptyText="No delivered purchase orders are awaiting invoices."
                        rows={awaiting_invoices}
                        columns={[
                            { key: 'po_number', label: 'PO' },
                            { key: 'vendor_name', label: 'Vendor' },
                            { key: 'department', label: 'Department' },
                            { key: 'total_amount', label: 'Total', render: (value) => currency(value) },
                            { key: 'created_at', label: 'Delivered' },
                            {
                                key: 'action',
                                label: 'Action',
                                render: (_, row) => (
                                    <Button
                                        as={Link}
                                        href={route('invoices.index', { create: 1, po_id: row.id })}
                                        kind="ghost"
                                        size="sm"
                                    >
                                        Record invoice
                                    </Button>
                                ),
                            },
                        ]}
                    />

                    <QueueTable
                        title="Invoices Awaiting Payment"
                        emptyText="No unpaid invoices are currently queued."
                        rows={unpaid_invoices}
                        columns={[
                            { key: 'invoice_number', label: 'Invoice' },
                            { key: 'po_number', label: 'PO' },
                            { key: 'vendor_name', label: 'Vendor' },
                            { key: 'status', label: 'Status', render: (value) => <Tag type={statusTone[value] ?? 'gray'}>{value}</Tag> },
                            { key: 'amount', label: 'Amount', render: (value) => currency(value) },
                            { key: 'due_date', label: 'Due Date' },
                            {
                                key: 'action',
                                label: 'Action',
                                render: (_, row) => (
                                    <Button
                                        as={Link}
                                        href={route('invoices.index', { search: row.invoice_number })}
                                        kind="ghost"
                                        size="sm"
                                    >
                                        Review invoice
                                    </Button>
                                ),
                            },
                        ]}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}