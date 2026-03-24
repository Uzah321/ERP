import { useForm } from '@inertiajs/react';

export default function EditAssetModal({ asset, onClose, categories, locations }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        _method: 'put',
        name: asset?.name || '',
        serial_number: asset?.serial_number || '',
        category_id: asset?.category_id || '',
        location_id: asset?.location_id || '',
        purchase_cost: asset?.purchase_cost || '',
        purchase_date: asset?.purchase_date || '',
        condition: asset?.condition || 'New',
        status: asset?.status || 'Purchased',
        description: asset?.description || '',
        warranty_expiry_date: asset?.warranty_expiry_date || '',
        warranty_provider: asset?.warranty_provider || '',
        warranty_notes: asset?.warranty_notes || '',
        photo: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('assets.update', asset.id), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                onClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity p-4">
            <div className="bg-white w-[680px] max-h-[90vh] shadow-2xl rounded-xl flex flex-col overflow-hidden">
                {/* Title Bar */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
                    <h3 className="text-lg font-semibold text-gray-800">Edit Asset: {asset?.barcode}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 text-sm text-gray-700 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Column 1 */}
                        <div className="space-y-4">
                            <div className="flex flex-col">
                                <label className="mb-1.5 font-medium text-gray-700">Asset Name <span className="text-red-500">*</span></label>
                                <input required type="text" className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                    value={data.name} onChange={e => setData('name', e.target.value)} />
                                {errors.name && <div className="text-red-600 text-xs mt-1">{errors.name}</div>}
                            </div>
                            <div className="flex flex-col">
                                <label className="mb-1.5 font-medium text-gray-700">Serial Number</label>
                                <input type="text" className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                    value={data.serial_number} onChange={e => setData('serial_number', e.target.value)} />
                                {errors.serial_number && <div className="text-red-600 text-xs mt-1">{errors.serial_number}</div>}
                            </div>
                            <div className="flex flex-col">
                                <label className="mb-1.5 font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
                                <select required className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.category_id} onChange={e => setData('category_id', e.target.value)}>
                                    <option value="">-- Select Category --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {errors.category_id && <div className="text-red-600 text-xs mt-1">{errors.category_id}</div>}
                            </div>
                            <div className="flex flex-col">
                                <label className="mb-1.5 font-medium text-gray-700">Location <span className="text-red-500">*</span></label>
                                <select required className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.location_id} onChange={e => setData('location_id', e.target.value)}>
                                    <option value="">-- Select Location --</option>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                                {errors.location_id && <div className="text-red-600 text-xs mt-1">{errors.location_id}</div>}
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-4">
                            <div className="flex flex-col">
                                <label className="mb-1.5 font-medium text-gray-700">Purchase Cost</label>
                                <input type="number" step="0.01" className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                    value={data.purchase_cost} onChange={e => setData('purchase_cost', e.target.value)} />
                            </div>
                            <div className="flex flex-col">
                                <label className="mb-1.5 font-medium text-gray-700">Purchase Date</label>
                                <input type="date" className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                    value={data.purchase_date} onChange={e => setData('purchase_date', e.target.value)} />
                            </div>
                            <div className="flex flex-col">
                                <label className="mb-1.5 font-medium text-gray-700">Condition</label>
                                <select className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.condition} onChange={e => setData('condition', e.target.value)}>
                                    <option>New</option>
                                    <option>Good</option>
                                    <option>Fair</option>
                                    <option>Poor</option>
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label className="mb-1.5 font-medium text-gray-700">Status</label>
                                <select className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.status} onChange={e => setData('status', e.target.value)}>
                                    <option>Purchased</option>
                                    <option>Available</option>
                                    <option>Allocated</option>
                                    <option>Registered</option>
                                    <option>Deployed</option>
                                    <option>Active Use</option>
                                    <option>Under Maintenance</option>
                                    <option>Audit</option>
                                    <option>Retired</option>
                                    <option>Decommissioned</option>
                                    <option>Disposed</option>
                                    <option>Archived</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex flex-col">
                        <label className="mb-1.5 font-medium text-gray-700">Description</label>
                        <textarea rows="3" className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
                            value={data.description} onChange={e => setData('description', e.target.value)}></textarea>
                    </div>

                    {/* Photo Upload */}
                    <div className="mt-4">
                        <label className="mb-1.5 font-medium text-gray-700 block">Asset Photo <span className="text-gray-400 font-normal text-xs">(leave blank to keep existing)</span></label>
                        {asset?.photo_path && (
                            <div className="mb-2">
                                <img
                                    src={`/storage/${asset.photo_path}`}
                                    alt="Asset"
                                    className="h-24 w-auto rounded-lg border border-gray-200 object-cover shadow-sm"
                                />
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/webp"
                            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg cursor-pointer"
                            onChange={e => setData('photo', e.target.files[0] || null)}
                        />
                    </div>

                    {/* ── Depreciation ─────────────────────────────────────── */}
                    <div className="mt-6 border-t border-gray-100 pt-5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Depreciation</p>
                        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
                            <svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            <div className="text-xs text-blue-700 leading-relaxed">
                                <span className="font-semibold">Fixed rate: 25% of purchase cost per year.</span> Depreciation is applied automatically overnight by the system scheduler.
                                {asset?.book_value != null && (
                                    <span className="block mt-1">Current book value: <strong>${Number(asset.book_value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Warranty ─────────────────────────────────────────── */}
                    <div className="mt-4 border-t border-gray-100 pt-5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Warranty</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <label className="mb-1.5 font-medium text-gray-700">Warranty Expiry Date</label>
                                <input type="date" className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.warranty_expiry_date} onChange={e => setData('warranty_expiry_date', e.target.value)} />
                            </div>
                            <div className="flex flex-col">
                                <label className="mb-1.5 font-medium text-gray-700">Warranty Provider</label>
                                <input type="text" className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="e.g. Dell, HP, Logitech..."
                                    value={data.warranty_provider} onChange={e => setData('warranty_provider', e.target.value)} />
                            </div>
                        </div>
                        <div className="mt-3 flex flex-col">
                            <label className="mb-1.5 font-medium text-gray-700">Warranty Notes</label>
                            <textarea rows="2" className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
                                placeholder="Claim process, terms, etc."
                                value={data.warranty_notes} onChange={e => setData('warranty_notes', e.target.value)}></textarea>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-5 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing} className="px-5 py-2 font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50">
                            {processing ? 'Saving...' : 'Update Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
