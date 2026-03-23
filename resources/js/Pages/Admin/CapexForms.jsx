import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

// Compute a badge from the form's current_stage_label and status
const getStatusBadge = (f) => {
    if (f.status === 'approved') return { label: 'Fully Approved', cls: 'bg-green-100 text-green-700' };
    if (f.status === 'declined') return { label: 'Declined', cls: 'bg-red-100 text-red-700' };
    // Determine colour intensity by chain progress
    const colours = [
        'bg-yellow-100 text-yellow-800',
        'bg-orange-100 text-orange-800',
        'bg-blue-100 text-blue-800',
        'bg-purple-100 text-purple-800',
        'bg-indigo-100 text-indigo-800',
    ];
    const idx = f.chain_length > 0 ? Math.min(f.current_stage_index ?? 0, colours.length - 1) : 0;
    return { label: f.current_stage_label || 'Pending', cls: colours[idx] };
};

export default function CapexForms({ auth, forms, assetRequests, users = [], flash }) {
    const [quotationFiles, setQuotationFiles] = useState([null, null, null]);

    // Approval chain state—each entry: { user_id, label }
    const [approvalChain, setApprovalChain] = useState([
        { user_id: '', label: 'IT Manager' },
    ]);

    const updateChainItem = (index, field, value) => {
        setApprovalChain(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const addChainStage = () => {
        setApprovalChain(prev => [...prev, { user_id: '', label: '' }]);
    };

    const removeChainStage = (index) => {
        if (approvalChain.length <= 1) return;
        setApprovalChain(prev => prev.filter((_, i) => i !== index));
    };

    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const { data, setData, reset } = useForm({
        asset_request_id:    '',
        request_type:        'New Employee Onboarding',
        asset_life:          '4 Years',
        cost_allocation:     '',
        insurance_status:    true,
        reason_for_purchase: '',
        total_amount:        '',
    });

    const addQuotationSlot = () => {
        setQuotationFiles(prev => [...prev, null]);
    };

    const handleQuotationChange = (index, file) => {
        setQuotationFiles(prev => {
            const updated = [...prev];
            updated[index] = file;
            return updated;
        });
        // Sync all non-null files to form data
        setData(d => ({
            ...d,
            quotations: quotationFiles
                .map((f, i) => i === index ? file : f)
                .filter(Boolean),
        }));
    };

    const handleCreate = (e) => {
        e.preventDefault();
        const filled = quotationFiles.filter(Boolean);
        if (filled.length < 3) {
            alert('Please upload at least 3 vendor quotations before submitting.');
            return;
        }
        // Validate approval chain
        if (approvalChain.some(s => !s.user_id || !s.label.trim())) {
            alert('Please fill in every stage in the Approval Chain (select a user and enter a role label).');
            return;
        }
        // Build FormData manually so files are included
        const fd = new FormData();
        fd.append('asset_request_id', data.asset_request_id);
        fd.append('request_type', data.request_type);
        fd.append('asset_life', data.asset_life);
        fd.append('cost_allocation', data.cost_allocation);
        fd.append('insurance_status', data.insurance_status ? '1' : '0');
        fd.append('reason_for_purchase', data.reason_for_purchase);
        fd.append('total_amount', data.total_amount);
        filled.forEach(file => fd.append('quotations[]', file));
        fd.append('approval_chain', JSON.stringify(approvalChain));
        setSubmitting(true);
        setFormErrors({});
        router.post(route('capex.store'), fd, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setQuotationFiles([null, null, null]);
                setApprovalChain([{ user_id: '', label: 'IT Manager' }]);
                setFormErrors({});
            },
            onError: (errs) => setFormErrors(errs),
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="text-2xl font-bold text-gray-800">CAPEX Forms</h2>}>
            <Head title="CAPEX Forms" />
            <div className="p-6 space-y-6">

                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {flash.error}
                    </div>
                )}

                {/* Create CAPEX Form */}
                {assetRequests?.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">Create New CAPEX Form</h3>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Request *</label>
                                <select
                                    value={data.asset_request_id}
                                    onChange={e => setData('asset_request_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    required
                                >
                                    <option value="">Select an approved asset request…</option>
                                    {assetRequests.map(r => (
                                        <option key={r.id} value={r.id}>
                                            SRQ-{new Date().getFullYear()}-{String(r.id).padStart(4,'0')} — {r.asset_type} ({r.department_name})
                                        </option>
                                    ))}
                                </select>
                                {formErrors.asset_request_id && <p className="text-red-500 text-xs mt-1">{formErrors.asset_request_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Request Type *</label>
                                <input
                                    type="text"
                                    value={data.request_type}
                                    onChange={e => setData('request_type', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Life *</label>
                                <input
                                    type="text"
                                    value={data.asset_life}
                                    onChange={e => setData('asset_life', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    placeholder="e.g. 4 Years"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department / Cost Allocation</label>
                                <input
                                    type="text"
                                    value={data.cost_allocation}
                                    onChange={e => setData('cost_allocation', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    placeholder="e.g. Central Kitchen Bulawayo"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-5">
                                <input
                                    type="checkbox"
                                    id="insurance_status"
                                    checked={data.insurance_status}
                                    onChange={e => setData('insurance_status', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                />
                                <label htmlFor="insurance_status" className="text-sm font-medium text-gray-700">
                                    Insurance Status — Yes
                                </label>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Asset Purchase</label>
                                <textarea
                                    value={data.reason_for_purchase}
                                    onChange={e => setData('reason_for_purchase', e.target.value)}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    placeholder="Describe why these assets are needed…"
                                />
                            </div>

                            {/* Approval Chain Builder */}
                            <div className="md:col-span-2">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Approval Chain
                                        <span className="ml-2 text-xs text-gray-400 font-normal">Who approves this CAPEX, in order</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addChainStage}
                                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                    >
                                        + Add Stage
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {approvalChain.map((stage, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 w-16 shrink-0">Stage {i + 1}</span>
                                            <select
                                                value={stage.user_id}
                                                onChange={e => updateChainItem(i, 'user_id', e.target.value)}
                                                className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                                                required
                                            >
                                                <option value="">Select approver…</option>
                                                {users.map(u => (
                                                    <option key={u.id} value={u.id}>{u.name}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="text"
                                                value={stage.label}
                                                onChange={e => updateChainItem(i, 'label', e.target.value)}
                                                placeholder="Role label (e.g. IT Manager)"
                                                className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                                                required
                                            />
                                            {approvalChain.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeChainStage(i)}
                                                    className="text-red-500 hover:text-red-700 text-lg leading-none px-1"
                                                    title="Remove stage"
                                                >
                                                    &times;
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {formErrors.approval_chain && (
                                    <p className="text-red-500 text-xs mt-1">{formErrors.approval_chain}</p>
                                )}
                            </div>

                            {/* Vendor Quotations */}
                            <div className="md:col-span-2">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Vendor Quotations
                                        <span className="ml-1 text-red-500">*</span>
                                        <span className="ml-2 text-xs text-gray-400 font-normal">minimum 3 required (PDF, Word, or image)</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addQuotationSlot}
                                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                    >
                                        + Add another
                                    </button>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-2 text-xs text-green-800">
                                    <strong>Quotation 1</strong> must be the <strong>cheapest / recommended</strong> quote — it will be marked as the selected quotation on the CAPEX PDF.
                                </div>
                                <div className="space-y-2">
                                    {quotationFiles.map((file, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500 w-24 shrink-0">Quotation {i + 1}{i < 3 ? ' *' : ''}</span>
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                onChange={e => handleQuotationChange(i, e.target.files[0] || null)}
                                                className="flex-1 text-xs border border-gray-300 rounded-md px-2 py-1.5 file:mr-2 file:text-xs file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded file:px-2 file:py-1"
                                                required={i < 3}
                                            />
                                            {file && (
                                                <span className="text-green-600 text-xs shrink-0">✓ {file.name}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {formErrors.quotations && <p className="text-red-500 text-xs mt-1">{formErrors.quotations}</p>}
                                {[...Array(quotationFiles.length)].map((_, i) =>
                                    formErrors[`quotations.${i}`] ? (
                                        <p key={i} className="text-red-500 text-xs mt-0.5">Quotation {i + 1}: {formErrors[`quotations.${i}`]}</p>
                                    ) : null
                                )}
                            </div>

                            {/* Total Order Amount */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Total Order Amount (from cheapest quotation) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.total_amount}
                                        onChange={e => setData('total_amount', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 text-sm"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                {formErrors.total_amount && <p className="text-red-500 text-xs mt-1">{formErrors.total_amount}</p>}
                            </div>

                            <div className="md:col-span-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
                                >
                                    {submitting ? 'Creating…' : 'Create & Send for Approval'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* CAPEX Forms Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Reference</th>
                                <th className="px-4 py-3">Department</th>
                                <th className="px-4 py-3">Requested By</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Items</th>
                                <th className="px-4 py-3">Order Total</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3 text-right">PDF</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {forms.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="px-4 py-8 text-center text-gray-400">
                                        No CAPEX forms yet.
                                    </td>
                                </tr>
                            )}
                            {forms.map(f => (
                                <tr key={f.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono font-medium text-blue-700">{f.rtp_reference}</td>
                                    <td className="px-4 py-3 text-gray-700">{f.department}</td>
                                    <td className="px-4 py-3 text-gray-700">{f.requested_by}</td>
                                    <td className="px-4 py-3 text-gray-600">{f.request_type}</td>
                                    <td className="px-4 py-3 text-gray-600">{f.items_count}</td>
                                    <td className="px-4 py-3 font-semibold text-gray-800">
                                        {f.total_amount ? `$${parseFloat(f.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(f).cls}`}>
                                            {getStatusBadge(f).label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{f.created_at}</td>
                                    <td className="px-4 py-3 text-right">
                                        <a
                                            href={route('capex.pdf', f.id)}
                                            target="_blank"
                                            className="text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                                        >
                                            Download PDF
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
