import { useForm } from '@inertiajs/react';

export default function EditAssetModal({ asset, onClose, categories, locations }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: asset?.name || '',
        serial_number: asset?.serial_number || '',
        category_id: asset?.category_id || '',
        location_id: asset?.location_id || '',
        purchase_cost: asset?.purchase_cost || '',
        purchase_date: asset?.purchase_date || '',
        condition: asset?.condition || 'New',
        status: asset?.status || 'Purchased',
        description: asset?.description || ''
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('assets.update', asset.id), {
            onSuccess: () => {
                reset();
                onClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity">
            <div className="bg-white w-[600px] shadow-2xl rounded-xl flex flex-col overflow-hidden">
                {/* Title Bar */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Edit Asset: {asset?.barcode}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 text-sm text-gray-700">
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
