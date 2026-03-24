import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const EMPTY_FORM = {
    software_name: '', vendor_name: '', licence_key: '', licence_type: 'subscription',
    seat_count: '', seats_used: '', purchase_date: '', expiry_date: '',
    purchase_cost: '', annual_cost: '', status: 'active', notes: '',
};

export default function SoftwareLicences({ licences, filters, flash }) {
    const [search, setSearch]     = useState(filters?.search ?? '');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing]   = useState(null);
    const [form, setForm]         = useState(EMPTY_FORM);

    function openNew() { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }
    function openEdit(lic) {
        setEditing(lic);
        setForm({
            software_name: lic.software_name ?? '',
            vendor_name:   lic.vendor_name ?? '',
            licence_key:   '', // don't pre-fill sensitive key
            licence_type:  lic.licence_type ?? 'subscription',
            seat_count:    lic.seat_count ?? '',
            seats_used:    lic.seats_used ?? '',
            purchase_date: lic.purchase_date ?? '',
            expiry_date:   lic.expiry_date ?? '',
            purchase_cost: lic.purchase_cost ?? '',
            annual_cost:   lic.annual_cost ?? '',
            status:        lic.status ?? 'active',
            notes:         lic.notes ?? '',
        });
        setShowForm(true);
    }

    function doSearch(q) {
        setSearch(q);
        router.get(route('admin.software-licences.index'), { search: q }, {
            only: ['licences', 'filters'], preserveState: true, replace: true,
        });
    }

    function submitForm(e) {
        e.preventDefault();
        if (editing) {
            router.put(route('admin.software-licences.update', editing.id), form, {
                onSuccess: () => { setShowForm(false); setEditing(null); },
            });
        } else {
            router.post(route('admin.software-licences.store'), form, {
                onSuccess: () => { setShowForm(false); setForm(EMPTY_FORM); },
            });
        }
    }

    function deleteLicence(lic) {
        if (confirm(`Delete licence for "${lic.software_name}"?`)) {
            router.delete(route('admin.software-licences.destroy', lic.id));
        }
    }

    const expiryBadge = (s) => {
        if (s === 'expired')       return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Expired</span>;
        if (s === 'expiring_soon') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Expiring Soon</span>;
        if (s === 'active')        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>;
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">No Expiry</span>;
    };

    const statusBadge = (s) => {
        const map = { active: 'bg-green-100 text-green-700', expired: 'bg-red-100 text-red-700', cancelled: 'bg-gray-100 text-gray-600' };
        return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[s] ?? 'bg-gray-100 text-gray-600'}`}>{s}</span>;
    };

    const F = (label, key, type = 'text', opts = {}) => (
        <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
            <input type={type} value={form[key]} placeholder={opts.placeholder ?? ''}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                required={opts.required} />
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Software Licences" />
            <div className="p-6 space-y-6">

                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">{flash.success}</div>
                )}

                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">Software Licence Tracking</h1>
                    <button onClick={openNew}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                        + Add Licence
                    </button>
                </div>

                {/* Expiry alerts */}
                {licences.filter(l => l.expiry_status === 'expiring_soon').length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
                        ⚠ <strong>{licences.filter(l => l.expiry_status === 'expiring_soon').length}</strong> licence(s) expiring within 30 days: {licences.filter(l => l.expiry_status === 'expiring_soon').map(l => l.software_name).join(', ')}
                    </div>
                )}
                {licences.filter(l => l.expiry_status === 'expired').length > 0 && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                        ✕ <strong>{licences.filter(l => l.expiry_status === 'expired').length}</strong> expired licence(s): {licences.filter(l => l.expiry_status === 'expired').map(l => l.software_name).join(', ')}
                    </div>
                )}

                {/* Form */}
                {showForm && (
                    <div className="bg-white border border-blue-200 rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-blue-800">{editing ? 'Edit Licence' : 'Add Software Licence'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                        </div>
                        <form onSubmit={submitForm} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {F('Software Name *', 'software_name', 'text', { required: true })}
                                {F('Vendor / Publisher', 'vendor_name')}
                                {F('Licence Key', 'licence_key', 'text', { placeholder: editing ? '(leave blank to keep unchanged)' : '' })}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Licence Type *</label>
                                    <select value={form.licence_type} onChange={e => setForm(f => ({ ...f, licence_type: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" required>
                                        <option value="subscription">Subscription</option>
                                        <option value="perpetual">Perpetual</option>
                                        <option value="per-seat">Per-Seat</option>
                                    </select>
                                </div>
                                {F('Total Seats', 'seat_count', 'number', { placeholder: 'leave blank if unlimited' })}
                                {F('Seats In Use', 'seats_used', 'number')}
                                {F('Purchase Date', 'purchase_date', 'date')}
                                {F('Expiry Date', 'expiry_date', 'date')}
                                {F('Purchase Cost ($)', 'purchase_cost', 'number')}
                                {F('Annual Renewal Cost ($)', 'annual_cost', 'number')}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Status *</label>
                                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" required>
                                        <option value="active">Active</option>
                                        <option value="expired">Expired</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
                                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none" />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="px-5 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit"
                                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
                                    {editing ? 'Save Changes' : 'Add Licence'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Search */}
                <div className="flex gap-3">
                    <input type="text" placeholder="Search software or vendor…" value={search}
                        onChange={e => doSearch(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-72 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
                </div>

                {/* Table */}
                {licences.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No software licences recorded yet.</p>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {['Software', 'Vendor', 'Type', 'Seats', 'Expiry', 'Expiry Status', 'Cost / Year', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {licences.map(lic => (
                                    <tr key={lic.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900">{lic.software_name}</td>
                                        <td className="px-4 py-3 text-gray-600">{lic.vendor_name || '—'}</td>
                                        <td className="px-4 py-3 text-gray-600 capitalize">{lic.licence_type}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {lic.seat_count
                                                ? <span>{lic.seats_used}/{lic.seat_count} <span className="text-xs text-gray-400">({lic.seats_available} free)</span></span>
                                                : <span className="text-gray-400">Unlimited</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{lic.expiry_date || '—'}</td>
                                        <td className="px-4 py-3">{expiryBadge(lic.expiry_status)}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {lic.annual_cost ? `$${Number(lic.annual_cost).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                                        </td>
                                        <td className="px-4 py-3">{statusBadge(lic.status)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button onClick={() => openEdit(lic)}
                                                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                                                <button onClick={() => deleteLicence(lic)}
                                                    className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
