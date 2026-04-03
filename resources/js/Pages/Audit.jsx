import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Form,
    TextInput,
    Button,
    Tag,
    InlineNotification,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    TableSelectAll,
    TableSelectRow,
    TableToolbar,
    TableToolbarContent,
    TableToolbarSearch,
    Tile,
    Select,
    SelectItem,
    SelectSkeleton,
    DataTableSkeleton,
    InlineLoading,
    Checkbox,
} from '@carbon/react';

export default function Audit({ recent_audits, locations, complexes }) {
    // ── Barcode scan form ──────────────────────────────────────────────
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        barcode: '',
        location_id: '',
    });
    const [successMsg, setSuccessMsg] = useState('');
    const inputRef = useRef();

    useEffect(() => { inputRef.current?.focus(); }, []);

    const submitBarcode = (e) => {
        e.preventDefault();
        post(route('audit.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMsg('Successfully audited: ' + data.barcode);
                reset('barcode');
                clearErrors();
                setTimeout(() => setSuccessMsg(''), 3000);
                inputRef.current?.focus();
            },
        });
    };

    // ── Browse by location ─────────────────────────────────────────────
    const [selectedComplex, setSelectedComplex] = useState('');
    const [selectedStore, setSelectedStore] = useState('');
    const [storeAssets, setStoreAssets] = useState([]);
    const [loadingAssets, setLoadingAssets] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkProcessing, setBulkProcessing] = useState(false);
    const [browseSuccess, setBrowseSuccess] = useState('');
    const [assetSearch, setAssetSearch] = useState('');

    const stores = complexes?.find(c => String(c.id) === String(selectedComplex))?.stores ?? [];

    const fetchStoreAssets = useCallback(async (storeId) => {
        if (!storeId) { setStoreAssets([]); return; }
        setLoadingAssets(true);
        setSelectedIds(new Set());
        try {
            const res = await fetch(route('audit.assets-by-store', { store: storeId }), {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            const json = await res.json();
            setStoreAssets(json);
        } catch {
            setStoreAssets([]);
        } finally {
            setLoadingAssets(false);
        }
    }, []);

    const handleComplexChange = (e) => {
        setSelectedComplex(e.target.value);
        setSelectedStore('');
        setStoreAssets([]);
        setSelectedIds(new Set());
        setAssetSearch('');
    };

    const handleStoreChange = (e) => {
        const storeId = e.target.value;
        setSelectedStore(storeId);
        setAssetSearch('');
        fetchStoreAssets(storeId);
    };

    const filteredAssets = storeAssets.filter(a => {
        if (!assetSearch) return true;
        const q = assetSearch.toLowerCase();
        return (
            a.name?.toLowerCase().includes(q) ||
            a.serial_number?.toLowerCase().includes(q) ||
            a.barcode?.toLowerCase().includes(q) ||
            a.category?.name?.toLowerCase().includes(q)
        );
    });

    const allSelected = filteredAssets.length > 0 && filteredAssets.every(a => selectedIds.has(a.id));
    const someSelected = filteredAssets.some(a => selectedIds.has(a.id));

    const toggleAll = () => {
        if (allSelected) {
            setSelectedIds(prev => {
                const next = new Set(prev);
                filteredAssets.forEach(a => next.delete(a.id));
                return next;
            });
        } else {
            setSelectedIds(prev => {
                const next = new Set(prev);
                filteredAssets.forEach(a => next.add(a.id));
                return next;
            });
        }
    };

    const toggleOne = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleVerifySelected = () => {
        if (selectedIds.size === 0) return;
        setBulkProcessing(true);
        router.post(route('audit.bulk'), { asset_ids: Array.from(selectedIds) }, {
            preserveScroll: true,
            onSuccess: () => {
                setBrowseSuccess(`${selectedIds.size} asset(s) verified successfully!`);
                setSelectedIds(new Set());
                fetchStoreAssets(selectedStore);
                setTimeout(() => setBrowseSuccess(''), 4000);
            },
            onFinish: () => setBulkProcessing(false),
        });
    };

    const handleVerifyOne = (assetId) => {
        setBulkProcessing(true);
        router.post(route('audit.bulk'), { asset_ids: [assetId] }, {
            preserveScroll: true,
            onSuccess: () => {
                setBrowseSuccess('Asset verified successfully!');
                fetchStoreAssets(selectedStore);
                setTimeout(() => setBrowseSuccess(''), 4000);
            },
            onFinish: () => setBulkProcessing(false),
        });
    };

    const wasAuditedToday = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr);
        const today = new Date();
        return d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate();
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Physical Asset Audit</h2>}
        >
            <Head title="Asset Audit" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 flex flex-col gap-6">

                    {/* ── Top row: barcode scan + audited today ── */}
                    <div className="flex flex-col md:flex-row gap-6">

                        {/* Barcode scan */}
                        <div className="w-full md:w-1/3">
                            <Tile>
                                <h3 className="text-lg font-bold mb-2">Scan Barcode / Serial Number</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Use a barcode scanner or manually type the asset barcode or serial number to verify physical presence.
                                </p>

                                {successMsg && (
                                    <InlineNotification
                                        kind="success"
                                        title={successMsg}
                                        lowContrast
                                        hideCloseButton
                                        className="mb-4"
                                    />
                                )}

                                <Form onSubmit={submitBarcode}>
                                    <Select
                                        id="location_id"
                                        labelText="Verify/Update Location (Optional)"
                                        value={data.location_id}
                                        onChange={(e) => setData('location_id', e.target.value)}
                                        className="mb-4"
                                    >
                                        <SelectItem value="" text="Keep Existing Location" />
                                        {locations && locations.map(loc => (
                                            <SelectItem key={loc.id} value={loc.id} text={loc.name} />
                                        ))}
                                    </Select>

                                    <TextInput
                                        id="barcode"
                                        labelText="Asset Barcode or Serial Number"
                                        value={data.barcode}
                                        onChange={(e) => setData('barcode', e.target.value)}
                                        ref={inputRef}
                                        autoComplete="off"
                                        placeholder="Scan or type barcode / serial number"
                                        invalid={!!errors.barcode}
                                        invalidText={errors.barcode}
                                        className="mb-4"
                                    />
                                    <Button type="submit" disabled={processing} className="w-full">
                                        Verify Asset
                                    </Button>
                                </Form>
                            </Tile>
                        </div>

                        {/* Audited today */}
                        <div className="w-full md:w-2/3">
                            <Tile>
                                <h3 className="text-lg font-bold mb-4 border-b pb-2">Audited Today</h3>
                                {recent_audits.length > 0 ? (
                                    <Table size="sm">
                                        <TableHead>
                                            <TableRow>
                                                <TableHeader>Serial Number</TableHeader>
                                                <TableHeader>Barcode</TableHeader>
                                                <TableHeader>Name</TableHeader>
                                                <TableHeader>Location</TableHeader>
                                                <TableHeader>Status</TableHeader>
                                                <TableHeader>Time</TableHeader>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {recent_audits.map((asset) => (
                                                <TableRow key={asset.id}>
                                                    <TableCell>
                                                        <span className="font-mono font-bold text-blue-700">
                                                            {asset.serial_number || '-'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell><span className="font-mono">{asset.barcode}</span></TableCell>
                                                    <TableCell>{asset.name}</TableCell>
                                                    <TableCell>{asset.location?.name}</TableCell>
                                                    <TableCell><Tag type="green">Verified</Tag></TableCell>
                                                    <TableCell>{new Date(asset.last_audited_at).toLocaleTimeString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No assets have been audited today.</p>
                                )}
                            </Tile>
                        </div>
                    </div>

                    {/* ── Browse by Location ── */}
                    <Tile>
                        <h3 className="text-lg font-bold mb-1">Browse &amp; Verify by Location</h3>
                        <p className="text-sm text-gray-600 mb-5">
                            Select a complex, then a store to see all assets. You can verify one or multiple assets at once.
                        </p>

                        {browseSuccess && (
                            <InlineNotification
                                kind="success"
                                title={browseSuccess}
                                lowContrast
                                hideCloseButton
                                className="mb-4"
                            />
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <Select
                                    id="complex_select"
                                    labelText="Complex"
                                    value={selectedComplex}
                                    onChange={handleComplexChange}
                                >
                                    <SelectItem value="" text="— Select a complex —" />
                                    {(complexes ?? []).map(c => (
                                        <SelectItem key={c.id} value={c.id} text={c.name} />
                                    ))}
                                </Select>
                            </div>

                            <div className="flex-1">
                                {selectedComplex ? (
                                    <Select
                                        id="store_select"
                                        labelText="Store"
                                        value={selectedStore}
                                        onChange={handleStoreChange}
                                        disabled={stores.length === 0}
                                    >
                                        <SelectItem value="" text={stores.length === 0 ? '— No stores found —' : '— Select a store —'} />
                                        {stores.map(s => (
                                            <SelectItem key={s.id} value={s.id} text={s.name} />
                                        ))}
                                    </Select>
                                ) : (
                                    <Select id="store_select_placeholder" labelText="Store" disabled>
                                        <SelectItem value="" text="— Select a complex first —" />
                                    </Select>
                                )}
                            </div>
                        </div>

                        {/* Asset list */}
                        {loadingAssets && (
                            <DataTableSkeleton columnCount={5} rowCount={5} />
                        )}

                        {!loadingAssets && selectedStore && storeAssets.length === 0 && (
                            <p className="text-gray-500 text-center py-8">No assets found in this store.</p>
                        )}

                        {!loadingAssets && storeAssets.length > 0 && (
                            <>
                                <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span className="text-sm text-gray-600">
                                            {storeAssets.length} asset(s) &nbsp;·&nbsp; {selectedIds.size} selected
                                        </span>
                                        {selectedIds.size > 0 && (
                                            <Button
                                                size="sm"
                                                onClick={handleVerifySelected}
                                                disabled={bulkProcessing}
                                            >
                                                {bulkProcessing
                                                    ? <InlineLoading description="Verifying…" />
                                                    : `Verify Selected (${selectedIds.size})`}
                                            </Button>
                                        )}
                                    </div>
                                    <div style={{ maxWidth: '280px', width: '100%' }}>
                                        <TextInput
                                            id="asset_search"
                                            labelText=""
                                            placeholder="Search assets…"
                                            value={assetSearch}
                                            onChange={(e) => setAssetSearch(e.target.value)}
                                            size="sm"
                                        />
                                    </div>
                                </div>

                                <Table size="sm">
                                    <TableHead>
                                        <TableRow>
                                            <TableHeader style={{ width: '2.5rem' }}>
                                                <Checkbox
                                                    id="select-all"
                                                    labelText=""
                                                    hideLabel
                                                    checked={allSelected}
                                                    indeterminate={someSelected && !allSelected}
                                                    onChange={toggleAll}
                                                />
                                            </TableHeader>
                                            <TableHeader>Name</TableHeader>
                                            <TableHeader>Serial Number</TableHeader>
                                            <TableHeader>Category</TableHeader>
                                            <TableHeader>Status</TableHeader>
                                            <TableHeader>Last Audited</TableHeader>
                                            <TableHeader></TableHeader>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredAssets.map((asset) => {
                                            const auditedToday = wasAuditedToday(asset.last_audited_at);
                                            return (
                                                <TableRow
                                                    key={asset.id}
                                                    style={auditedToday ? { background: 'var(--cds-support-success-background, #defbe6)' } : {}}
                                                >
                                                    <TableCell>
                                                        <Checkbox
                                                            id={`select-${asset.id}`}
                                                            labelText=""
                                                            hideLabel
                                                            checked={selectedIds.has(asset.id)}
                                                            onChange={() => toggleOne(asset.id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{asset.name}</TableCell>
                                                    <TableCell>
                                                        <span className="font-mono text-sm">{asset.serial_number || asset.barcode || '—'}</span>
                                                    </TableCell>
                                                    <TableCell>{asset.category?.name ?? '—'}</TableCell>
                                                    <TableCell>{asset.status}</TableCell>
                                                    <TableCell>
                                                        {auditedToday
                                                            ? <Tag type="green">Today</Tag>
                                                            : asset.last_audited_at
                                                                ? new Date(asset.last_audited_at).toLocaleDateString()
                                                                : <Tag type="red">Never</Tag>}
                                                    </TableCell>
                                                    <TableCell>
                                                        {!auditedToday && (
                                                            <Button
                                                                size="sm"
                                                                kind="ghost"
                                                                onClick={() => handleVerifyOne(asset.id)}
                                                                disabled={bulkProcessing}
                                                            >
                                                                Verify
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </>
                        )}
                    </Tile>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
