import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CreateAssetModal from '@/Components/CreateAssetModal';
import EditAssetModal from '@/Components/EditAssetModal';
import AssetRequestModal from '@/Components/AssetRequestModal';
import {
    Button, Tag, Pagination, Select, SelectItem,
    TableToolbar, TableToolbarContent, TableToolbarSearch,
    TableBatchActions, TableBatchAction,
    Table, TableHead, TableRow, TableHeader, TableBody, TableCell,
    TableSelectAll, TableSelectRow,
    ComposedModal, ModalHeader, ModalBody, ModalFooter,
    TextArea, Modal,
    InlineNotification,
} from '@carbon/react';
import {
    Add, ArrowsHorizontal, ShoppingCart, Renew, TrashCan,
    Time, QrCode, Edit, WarningAlt,
} from '@carbon/icons-react';

const STATUS_TAG = {
    'Active Use': 'green', 'Available': 'green', 'Deployed': 'green',
    'Allocated': 'blue', 'Registered': 'blue', 'Purchased': 'teal',
    'Under Maintenance': 'yellow', 'Maintenance': 'yellow', 'Audit': 'yellow',
    'Retired': 'gray', 'Archived': 'gray',
    'Decommissioned': 'red', 'Disposed': 'red',
};
const WARRANTY_TAG = { active: 'green', expiring_soon: 'yellow', expired: 'red' };

const STATUSES = ['Available','Allocated','Active Use','Deployed','Purchased','Registered','Under Maintenance','Audit','Retired','Decommissioned','Disposed','Archived'];
const CONDITIONS = ['New','Good','Fair','Poor'];

export default function Dashboard({ auth, assets, department, categories, locations, all_departments, vendor_categories, selected_department_id, filters }) {
    const [showCreateModal,  setShowCreateModal]  = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showTransferModal,setShowTransferModal]= useState(false);
    const [showDeleteConfirm,setShowDeleteConfirm]= useState(false);
    const [deletingAsset,    setDeletingAsset]    = useState(null);
    const [editingAsset,     setEditingAsset]     = useState(null);
    const [selectedAssets,   setSelectedAssets]   = useState([]);
    const [searchQuery,      setSearchQuery]      = useState(filters?.search ?? '');
    const [filterStatus,     setFilterStatus]     = useState(filters?.status ?? '');
    const [filterCondition,  setFilterCondition]  = useState(filters?.condition ?? '');
    const [pendingDepartment,setPendingDepartment]= useState(selected_department_id ?? '');
    const [bulkData,         setBulkData]         = useState({ target_department_id: '', reason: '' });
    const [bulkErrors,       setBulkErrors]       = useState({});
    const [bulkProcessing,   setBulkProcessing]   = useState(false);

    const isAdmin = auth.user.role === 'admin';
    const rows = assets?.data ?? [];
    const currentPage = assets?.current_page ?? 1;
    const totalAssets = assets?.total ?? 0;
    const pageSize = assets?.per_page ?? 25;

    const applyFilters = (page = 1, overrides = {}) => {
        router.get(route('dashboard'), {
            department_id: pendingDepartment,
            search: searchQuery,
            status: filterStatus,
            condition: filterCondition,
            page,
            ...overrides,
        }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearchQuery(''); setFilterStatus(''); setFilterCondition('');
        applyFilters(1, { search: '', status: '', condition: '' });
    };

    const toggleSelect = (id) => setSelectedAssets(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    const allSelected = rows.length > 0 && selectedAssets.length === rows.length;
    const toggleAll = () => setSelectedAssets(allSelected ? [] : rows.map(a => a.id));

    const bulkTransfer = () => {
        setBulkProcessing(true);
        router.post(route('assets.bulkTransfer'), {
            asset_ids: selectedAssets,
            ...bulkData,
        }, {
            onSuccess: () => { setShowTransferModal(false); setBulkData({ target_department_id: '', reason: '' }); setBulkProcessing(false); setSelectedAssets([]); },
            onError: (e) => { setBulkErrors(e); setBulkProcessing(false); },
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Asset Master" />

            {/* Toolbar */}
            <TableToolbar>
                <TableBatchActions
                    totalSelected={selectedAssets.length}
                    onCancel={() => setSelectedAssets([])}
                    shouldShowBatchActions={selectedAssets.length > 0}
                >
                    <TableBatchAction renderIcon={ArrowsHorizontal} onClick={() => setShowTransferModal(true)}>
                        Transfer
                    </TableBatchAction>
                    <TableBatchAction renderIcon={TrashCan} onClick={() => setShowDeleteConfirm(true)}>
                        Delete Selected
                    </TableBatchAction>
                </TableBatchActions>

                <TableToolbarContent>
                    <TableToolbarSearch
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters(1)}
                        placeholder="Search name, barcode, serial, category…"
                        persistent
                    />
                    <Select
                        id="filter-status"
                        labelText=""
                        hideLabel
                        value={filterStatus}
                        onChange={e => { setFilterStatus(e.target.value); applyFilters(1, { status: e.target.value }); }}
                        style={{ width: '180px' }}
                    >
                        <SelectItem value="" text="All Statuses" />
                        {STATUSES.map(s => <SelectItem key={s} value={s} text={s} />)}
                    </Select>
                    <Select
                        id="filter-condition"
                        labelText=""
                        hideLabel
                        value={filterCondition}
                        onChange={e => { setFilterCondition(e.target.value); applyFilters(1, { condition: e.target.value }); }}
                        style={{ width: '160px' }}
                    >
                        <SelectItem value="" text="All Conditions" />
                        {CONDITIONS.map(c => <SelectItem key={c} value={c} text={c} />)}
                    </Select>
                    {isAdmin && (
                        <Select
                            id="filter-dept"
                            labelText=""
                            hideLabel
                            value={pendingDepartment}
                            onChange={e => { setPendingDepartment(e.target.value); applyFilters(1, { department_id: e.target.value }); }}
                            style={{ width: '200px' }}
                        >
                            <SelectItem value="" text="All Departments" />
                            {(all_departments ?? []).map(d => <SelectItem key={d.id} value={String(d.id)} text={d.name} />)}
                        </Select>
                    )}
                    <Button kind="ghost" renderIcon={Renew} iconDescription="Refresh" hasIconOnly
                        onClick={() => router.reload({ only: ['assets'] })} />
                    <Button kind="primary" renderIcon={Add} onClick={() => setShowCreateModal(true)}>
                        New Asset
                    </Button>
                    <Button kind="tertiary" renderIcon={ShoppingCart} onClick={() => setShowRequestModal(true)}>
                        Request Order
                    </Button>
                </TableToolbarContent>
            </TableToolbar>

            {/* Data Table */}
            <Table size="sm" useZebraStyles>
                <TableHead>
                    <TableRow>
                        <TableSelectAll
                            checked={allSelected}
                            indeterminate={selectedAssets.length > 0 && !allSelected}
                            onSelect={toggleAll}
                            name="select-all"
                            id="select-all"
                            ariaLabel="Select all rows"
                        />
                        <TableHeader>Photo</TableHeader>
                        <TableHeader>Barcode</TableHeader>
                        <TableHeader>Serial #</TableHeader>
                        <TableHeader>Asset Name</TableHeader>
                        <TableHeader>Category</TableHeader>
                        <TableHeader>Location</TableHeader>
                        <TableHeader>Condition</TableHeader>
                        <TableHeader>Status</TableHeader>
                        <TableHeader>Book Value</TableHeader>
                        <TableHeader>Warranty</TableHeader>
                        <TableHeader />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={12} style={{ textAlign: 'center', padding: '3rem', color: 'var(--cds-text-secondary)' }}>
                                {totalAssets === 0 ? 'No assets found. Click "New Asset" to add your first item.' : 'No assets match your filters.'}
                                {(searchQuery || filterStatus || filterCondition) && (
                                    <Button kind="ghost" size="sm" onClick={clearFilters} style={{ marginLeft: '0.5rem' }}>Clear filters</Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ) : rows.map((asset) => (
                        <TableRow key={asset.id} onDoubleClick={() => setEditingAsset(asset)}>
                            <TableSelectRow
                                checked={selectedAssets.includes(asset.id)}
                                onSelect={() => toggleSelect(asset.id)}
                                name={`select-${asset.id}`}
                                id={`select-${asset.id}`}
                                ariaLabel={`Select ${asset.name}`}
                            />
                            <TableCell>
                                {asset.photo_path
                                    ? <img src={`/storage/${asset.photo_path}`} alt={asset.name}
                                        style={{ height: '2.25rem', width: '2.25rem', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--cds-border-subtle)' }} />
                                    : <div style={{ height: '2.25rem', width: '2.25rem', borderRadius: '4px', background: 'var(--cds-layer-02)', border: '1px solid var(--cds-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--cds-icon-disabled)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    </div>
                                }
                            </TableCell>
                            <TableCell><code style={{ fontSize: '0.75rem' }}>{asset.barcode}</code></TableCell>
                            <TableCell><code style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>{asset.serial_number || '—'}</code></TableCell>
                            <TableCell style={{ fontWeight: 500 }}>{asset.name}</TableCell>
                            <TableCell>{asset.category?.name || '—'}</TableCell>
                            <TableCell>{asset.location?.name || '—'}</TableCell>
                            <TableCell>{asset.condition}</TableCell>
                            <TableCell>
                                <Tag type={STATUS_TAG[asset.status] ?? 'gray'} size="sm">{asset.status}</Tag>
                            </TableCell>
                            <TableCell>
                                {asset.book_value != null
                                    ? <code style={{ fontSize: '0.75rem' }}>${Number(asset.book_value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</code>
                                    : <span style={{ color: 'var(--cds-text-disabled)' }}>—</span>
                                }
                            </TableCell>
                            <TableCell>
                                {asset.warranty_status && asset.warranty_status !== 'none'
                                    ? <Tag type={WARRANTY_TAG[asset.warranty_status] ?? 'gray'} size="sm">
                                        {asset.warranty_status === 'expiring_soon' ? 'Expiring' : asset.warranty_status.charAt(0).toUpperCase() + asset.warranty_status.slice(1)}
                                    </Tag>
                                    : <span style={{ color: 'var(--cds-text-disabled)' }}>—</span>
                                }
                            </TableCell>
                            <TableCell onClick={e => e.stopPropagation()}>
                                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                                    <Button kind="ghost" size="sm" hasIconOnly renderIcon={Time} iconDescription="View History"
                                        onClick={() => window.open(route('activity-log.asset', asset.id), '_blank')} />
                                    <Button kind="ghost" size="sm" hasIconOnly renderIcon={QrCode} iconDescription="Print QR Label"
                                        onClick={() => window.open(route('assets.qr-label', asset.id), '_blank')} />
                                    <Button kind="ghost" size="sm" hasIconOnly renderIcon={Edit} iconDescription="Edit"
                                        onClick={() => setEditingAsset(asset)} />
                                    <Button kind="danger--ghost" size="sm" hasIconOnly renderIcon={TrashCan} iconDescription="Archive"
                                        onClick={() => { setDeletingAsset(asset); setShowDeleteConfirm(true); }} />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Pagination */}
            <Pagination
                page={currentPage}
                pageSize={pageSize}
                totalItems={totalAssets}
                pageSizes={[25, 50, 100]}
                onChange={({ page }) => applyFilters(page)}
            />

            {/* Bulk Transfer Modal */}
            <ComposedModal open={showTransferModal} onClose={() => setShowTransferModal(false)} size="sm">
                <ModalHeader title={`Transfer ${selectedAssets.length} Assets`} />
                <ModalBody>
                    <Select id="bulk-dept" labelText="Target Department"
                        value={bulkData.target_department_id}
                        onChange={e => setBulkData({ ...bulkData, target_department_id: e.target.value })}
                        required invalid={!!bulkErrors.target_department_id} invalidText={bulkErrors.target_department_id}>
                        <SelectItem value="" text="Select Department" />
                        {(all_departments ?? []).map(d => <SelectItem key={d.id} value={String(d.id)} text={d.name} />)}
                    </Select>
                    <div style={{ marginTop: '1rem' }}>
                        <TextArea id="bulk-reason" labelText="Reason for Transfer"
                            value={bulkData.reason}
                            onChange={e => setBulkData({ ...bulkData, reason: e.target.value })}
                            rows={3} required
                            invalid={!!bulkErrors.reason} invalidText={bulkErrors.reason} />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button kind="secondary" onClick={() => setShowTransferModal(false)}>Cancel</Button>
                    <Button kind="primary" onClick={bulkTransfer} disabled={bulkProcessing}>
                        {bulkProcessing ? 'Transferring...' : 'Transfer'}
                    </Button>
                </ModalFooter>
            </ComposedModal>

            {/* Delete Confirmation Modal */}
            <Modal
                open={showDeleteConfirm}
                danger
                modalHeading={deletingAsset ? `Archive "${deletingAsset.name}"?` : `Delete ${selectedAssets.length} selected assets?`}
                primaryButtonText="Confirm"
                secondaryButtonText="Cancel"
                onRequestClose={() => { setShowDeleteConfirm(false); setDeletingAsset(null); }}
                onRequestSubmit={() => {
                    if (deletingAsset) {
                        router.post(route('assets.archive', deletingAsset.id));
                    } else {
                        router.post(route('assets.bulkDelete'), { asset_ids: selectedAssets });
                    }
                    setShowDeleteConfirm(false);
                    setDeletingAsset(null);
                    setSelectedAssets([]);
                }}
                size="sm"
            >
                <p>This action will archive the asset{selectedAssets.length > 1 ? 's' : ''}. It can be restored from Archive Utilities.</p>
            </Modal>

            {editingAsset && (
                <EditAssetModal asset={editingAsset} onClose={() => setEditingAsset(null)} categories={categories} locations={locations} />
            )}
            {showCreateModal && (
                <CreateAssetModal onClose={() => setShowCreateModal(false)} categories={categories} locations={locations} />
            )}
            {showRequestModal && (
                <AssetRequestModal show={showRequestModal} onClose={() => setShowRequestModal(false)}
                    departments={all_departments ?? []} vendorCategories={vendor_categories ?? []} />
            )}
        </AuthenticatedLayout>
    );
}
