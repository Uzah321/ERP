import { useEffect, useState } from 'react';
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
    OverflowMenu, OverflowMenuItem,
} from '@carbon/react';
import {
    Add, ArrowsHorizontal, ShoppingCart, Renew, TrashCan,
    Time, QrCode, Edit,
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

export default function Dashboard({ auth, assets, department, categories, locations, all_departments, vendor_categories, request_categories, selected_department_id, filters, supports_location_hierarchy, page_permissions }) {
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
    const [filterComplex,    setFilterComplex]    = useState(filters?.complex_id ?? '');
    const [filterStore,      setFilterStore]      = useState(filters?.store_id ?? '');
    const [bulkData,         setBulkData]         = useState({ target_department_id: '', reason: '' });
    const [bulkErrors,       setBulkErrors]       = useState({});
    const [bulkProcessing,   setBulkProcessing]   = useState(false);

    const effectiveRole = page_permissions?.effective_role ?? auth.user.role;
    const isSuperUser = page_permissions?.is_super_user ?? auth.user.is_super_user ?? auth.permissions?.is_super_user ?? false;
    const isAdmin = effectiveRole === 'admin';
    const isExecutive = effectiveRole === 'executive';
    const privilegedFallback = isSuperUser || isAdmin || isExecutive;
    const canManageAssets = page_permissions?.can_manage_assets ?? auth.permissions?.can_manage_assets ?? privilegedFallback;
    const canViewAllDepartments = page_permissions?.can_view_all_departments ?? auth.permissions?.can_view_all_departments ?? privilegedFallback;
    const canRequestAssets = true;
    const rows = assets?.data ?? [];
    const currentPage = assets?.current_page ?? 1;
    const totalAssets = assets?.total ?? 0;
    const pageSize = assets?.per_page ?? 25;
    const selectedComplex = (locations ?? []).find((complex) => String(complex.id) === String(filterComplex));
    const availableStores = selectedComplex?.stores ?? [];

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (canRequestAssets && params.get('request') === '1') {
            setShowRequestModal(true);
            params.delete('request');
            const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
            window.history.replaceState({}, '', nextUrl);
        }
    }, [canRequestAssets]);

    const applyFilters = (page = 1, overrides = {}) => {
        router.get(route('asset-management.index'), {
            department_id: pendingDepartment,
            complex_id: filterComplex,
            store_id: filterStore,
            search: searchQuery,
            status: filterStatus,
            condition: filterCondition,
            page,
            ...overrides,
        }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearchQuery(''); setFilterStatus(''); setFilterCondition(''); setFilterComplex(''); setFilterStore('');
        applyFilters(1, { search: '', status: '', condition: '', complex_id: '', store_id: '' });
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

    const openTransferForAssets = (assetIds) => {
        setSelectedAssets(assetIds);
        setShowTransferModal(true);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Asset Master" />

            {/* Page actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1rem 0.5rem' }}>
                <div>
                    <div style={{ color: 'var(--cds-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Asset Management
                    </div>
                    <span style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                        {totalAssets.toLocaleString()} asset{totalAssets !== 1 ? 's' : ''}
                    </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                    <span style={{ color: 'var(--cds-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Asset Actions</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {canManageAssets && (
                        <Button kind="secondary" renderIcon={ArrowsHorizontal} size="sm"
                            disabled={selectedAssets.length === 0}
                            onClick={() => setShowTransferModal(true)}>
                            {selectedAssets.length > 0 ? `Transfer (${selectedAssets.length})` : 'Transfer'}
                        </Button>
                    )}
                    {canRequestAssets && (
                        <Button kind="tertiary" renderIcon={ShoppingCart} size="sm" onClick={() => setShowRequestModal(true)}>
                            Request Asset
                        </Button>
                    )}
                    {canManageAssets && (
                        <Button kind="primary" renderIcon={Add} size="sm" onClick={() => setShowCreateModal(true)}>
                            Add Asset
                        </Button>
                    )}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <TableToolbar>
                {canManageAssets && (
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
                )}

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
                    {canViewAllDepartments && (
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
                    {supports_location_hierarchy && (
                        <Select
                            id="filter-complex"
                            labelText=""
                            hideLabel
                            value={filterComplex}
                            onChange={e => {
                                setFilterComplex(e.target.value);
                                setFilterStore('');
                                applyFilters(1, { complex_id: e.target.value, store_id: '' });
                            }}
                            style={{ width: '200px' }}
                        >
                            <SelectItem value="" text="All Complexes" />
                            {(locations ?? []).map(complex => <SelectItem key={complex.id} value={String(complex.id)} text={complex.name} />)}
                        </Select>
                    )}
                    {supports_location_hierarchy && (
                        <Select
                            id="filter-store"
                            labelText=""
                            hideLabel
                            value={filterStore}
                            onChange={e => {
                                setFilterStore(e.target.value);
                                applyFilters(1, { store_id: e.target.value });
                            }}
                            style={{ width: '220px' }}
                        >
                            <SelectItem value="" text={filterComplex ? 'All Stores' : 'Select Complex First'} />
                            {availableStores.map(store => <SelectItem key={store.id} value={String(store.id)} text={store.name} />)}
                        </Select>
                    )}
                    <Button kind="ghost" renderIcon={Renew} iconDescription="Refresh" hasIconOnly
                        onClick={() => router.reload({ only: ['assets'] })} />
                </TableToolbarContent>
            </TableToolbar>

            {/* Data Table */}
            <Table size="sm" useZebraStyles>
                <TableHead>
                    <TableRow>
                        {canManageAssets && (
                            <TableSelectAll
                                checked={allSelected}
                                indeterminate={selectedAssets.length > 0 && !allSelected}
                                onSelect={toggleAll}
                                name="select-all"
                                id="select-all"
                                ariaLabel="Select all rows"
                            />
                        )}
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
                            <TableCell colSpan={canManageAssets ? 11 : 10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--cds-text-secondary)' }}>
                                {totalAssets === 0 ? (canManageAssets ? 'No assets found. Click "Add Asset" to create your first item.' : 'No assets found for your current access level.') : 'No assets match your filters.'}
                                {(searchQuery || filterStatus || filterCondition || filterComplex || filterStore) && (
                                    <Button kind="ghost" size="sm" onClick={clearFilters} style={{ marginLeft: '0.5rem' }}>Clear filters</Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ) : rows.map((asset) => (
                        <TableRow key={asset.id} onDoubleClick={() => canManageAssets && setEditingAsset(asset)}>
                            {canManageAssets && (
                                <TableSelectRow
                                    checked={selectedAssets.includes(asset.id)}
                                    onSelect={() => toggleSelect(asset.id)}
                                    name={`select-${asset.id}`}
                                    id={`select-${asset.id}`}
                                    ariaLabel={`Select ${asset.name}`}
                                />
                            )}
                            <TableCell><code style={{ fontSize: '0.75rem', fontFamily: 'var(--cds-font-family)' }}>{asset.barcode}</code></TableCell>
                            <TableCell><code style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', fontFamily: 'var(--cds-font-family)' }}>{asset.serial_number || '—'}</code></TableCell>
                            <TableCell style={{ fontWeight: 500 }}>{asset.name}</TableCell>
                            <TableCell>{asset.category?.name || '—'}</TableCell>
                            <TableCell>{asset.location_label || '—'}</TableCell>
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
                                <OverflowMenu flipped iconDescription={`Actions for ${asset.name}`}>
                                    <OverflowMenuItem itemText="View asset history" onClick={() => window.open(route('activity-log.asset', asset.id), '_blank')} />
                                    <OverflowMenuItem itemText="Print QR label" onClick={() => window.open(route('assets.qr-label', asset.id), '_blank')} />
                                    {canManageAssets && <OverflowMenuItem itemText="Edit asset" onClick={() => setEditingAsset(asset)} />}
                                    {canManageAssets && <OverflowMenuItem itemText="Transfer this asset" onClick={() => openTransferForAssets([asset.id])} />}
                                    {canManageAssets && <OverflowMenuItem hasDivider isDelete itemText="Archive asset" onClick={() => { setDeletingAsset(asset); setShowDeleteConfirm(true); }} />}
                                </OverflowMenu>
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
            {canManageAssets && (
            <ComposedModal open={showTransferModal} onClose={() => setShowTransferModal(false)} size="sm">
                <ModalHeader title={`Transfer ${selectedAssets.length} Assets`} />
                <ModalBody>
                    <Select id="bulk-dept" labelText="Target Department"
                        value={bulkData.target_department_id}
                        onChange={e => setBulkData((current) => ({ ...current, target_department_id: e.target.value }))}
                        required invalid={!!bulkErrors.target_department_id} invalidText={bulkErrors.target_department_id}>
                        <SelectItem value="" text="Select Department" />
                        {(all_departments ?? []).map(d => <SelectItem key={d.id} value={String(d.id)} text={d.name} />)}
                    </Select>
                    <div style={{ marginTop: '1rem' }}>
                        <TextArea id="bulk-reason" labelText="Reason for Transfer"
                            value={bulkData.reason}
                            onChange={e => setBulkData((current) => ({ ...current, reason: e.target.value }))}
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
            )}

            {/* Delete Confirmation Modal */}
            {canManageAssets && (
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
            )}

            {canManageAssets && editingAsset && (
                <EditAssetModal asset={editingAsset} onClose={() => setEditingAsset(null)} categories={categories} complexes={locations} />
            )}
            {canManageAssets && showCreateModal && (
                <CreateAssetModal onClose={() => setShowCreateModal(false)} categories={categories} complexes={locations} />
            )}
            {canRequestAssets && showRequestModal && (
                <AssetRequestModal
                    show={showRequestModal}
                    onClose={() => setShowRequestModal(false)}
                    departments={all_departments ?? []}
                    vendorCategories={vendor_categories ?? []}
                    assetCategories={request_categories ?? []}
                />
            )}
        </AuthenticatedLayout>
    );
}
