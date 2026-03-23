import { Head, Link } from '@inertiajs/react';

export default function ApproveResult({ result, rtp_reference, position, fully_approved }) {
    const isApproved = result === 'approved';

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Head title={`CAPEX ${isApproved ? 'Approved' : 'Declined'}`} />
            <div className="bg-white rounded-xl shadow-md w-full max-w-md text-center overflow-hidden">
                <div className={`px-8 py-6 ${isApproved ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                    <div className="text-5xl mb-3">{isApproved ? '✓' : '✗'}</div>
                    <h1 className="text-xl font-bold">
                        {isApproved ? 'Decision Recorded: Approved' : 'Decision Recorded: Declined'}
                    </h1>
                </div>
                <div className="px-8 py-6 space-y-3 text-sm text-gray-700">
                    <p><strong>Reference:</strong> {rtp_reference}</p>
                    <p><strong>Your Role:</strong> {position}</p>
                    <p><strong>Decision:</strong> <span className={isApproved ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{isApproved ? 'Approved' : 'Declined'}</span></p>

                    {isApproved && fully_approved && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-xs mt-2">
                            This CAPEX has been <strong>fully approved</strong> by all signatories. The requester has been notified and may now raise a Purchase Order.
                        </div>
                    )}
                    {isApproved && !fully_approved && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 text-xs mt-2">
                            Your approval has been recorded. The request has been forwarded to the next approver.
                        </div>
                    )}
                    {!isApproved && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-xs mt-2">
                            The request has been declined. The requester has been notified.
                        </div>
                    )}

                    <p className="text-gray-400 text-xs pt-2">You may close this window.</p>
                </div>
            </div>
        </div>
    );
}
