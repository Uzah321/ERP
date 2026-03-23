import { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';

export default function Approve({ approval }) {
    const [decision, setDecision] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        password: '',
        decision: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('capex.approve.process', approval.token));
    };

    const chooseDecision = (val) => {
        setDecision(val);
        setData('decision', val);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Head title={`CAPEX Approval — ${approval.rtp_reference}`} />
            <div className="bg-white rounded-xl shadow-md w-full max-w-lg overflow-hidden">
                <div className="bg-blue-800 text-white px-8 py-6">
                    <h1 className="text-xl font-bold">CAPEX Approval</h1>
                    <p className="text-blue-200 text-sm mt-1">
                        Ref: {approval.rtp_reference} &nbsp;|&nbsp; Stage: {approval.position_label}
                    </p>
                </div>

                <div className="px-8 py-6 space-y-4">
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-sm space-y-1">
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Department:</span>
                            <span>{approval.department}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Request Type:</span>
                            <span>{approval.request_type}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Items:</span>
                            <span>{approval.items?.length ?? 0} item(s)</span>
                        </div>
                        {approval.total_amount && (
                            <div className="flex justify-between pt-2 mt-2 border-t border-gray-200">
                                <span className="font-semibold text-gray-700">Order Total (Cheapest Quote):</span>
                                <span className="font-bold text-green-700 text-base">
                                    ${parseFloat(approval.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        )}
                    </div>

                    {approval.items?.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="bg-blue-800 text-white">
                                        <th className="px-3 py-2 text-left">#</th>
                                        <th className="px-3 py-2 text-left">Description</th>
                                        <th className="px-3 py-2 text-left">Qty</th>
                                        <th className="px-3 py-2 text-left">Unit Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {approval.items.map((item, i) => (
                                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-3 py-2">{i + 1}</td>
                                            <td className="px-3 py-2 font-medium">{item.asset_type}</td>
                                            <td className="px-3 py-2">{item.quantity ?? 1}</td>
                                            <td className="px-3 py-2">
                                                {item.unit_price ? `$${parseFloat(item.unit_price).toFixed(2)}` : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4 pt-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Your Decision
                            </label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => chooseDecision('approved')}
                                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-colors ${
                                        decision === 'approved'
                                            ? 'border-green-600 bg-green-600 text-white'
                                            : 'border-green-300 text-green-700 hover:bg-green-50'
                                    }`}
                                >
                                    ✓ Approve
                                </button>
                                <button
                                    type="button"
                                    onClick={() => chooseDecision('declined')}
                                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-colors ${
                                        decision === 'declined'
                                            ? 'border-red-600 bg-red-600 text-white'
                                            : 'border-red-300 text-red-700 hover:bg-red-50'
                                    }`}
                                >
                                    ✗ Decline
                                </button>
                            </div>
                        </div>

                        {decision && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Enter your password to confirm
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    placeholder="Your system password"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    autoFocus
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                    Your name and timestamp will be recorded as your digital signature.
                                </p>
                            </div>
                        )}

                        {decision && (
                            <button
                                type="submit"
                                disabled={processing || !data.password}
                                className={`w-full py-2.5 rounded-lg text-white font-semibold text-sm disabled:opacity-50 transition-colors ${
                                    decision === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {processing
                                    ? 'Processing…'
                                    : decision === 'approved'
                                        ? 'Confirm Approval'
                                        : 'Confirm Decline'
                                }
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
