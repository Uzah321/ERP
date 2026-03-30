import { Head } from '@inertiajs/react';
import { InlineNotification, Tile, Tag } from '@carbon/react';
import { CheckmarkFilled, CloseFilled } from '@carbon/icons-react';

export default function ApproveResult({ result, rtp_reference, position, fully_approved }) {
    const isApproved = result === 'approved';

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Head title={`CAPEX ${isApproved ? 'Approved' : 'Declined'}`} />

            <div className="w-full max-w-md">
                <div className={`px-8 py-6 text-white text-center ${isApproved ? 'bg-green-600' : 'bg-red-600'}`}>
                    <div className="flex justify-center mb-3">
                        {isApproved
                            ? <CheckmarkFilled size={48} />
                            : <CloseFilled size={48} />
                        }
                    </div>
                    <h1 className="text-xl font-bold">
                        {isApproved ? 'Decision Recorded: Approved' : 'Decision Recorded: Declined'}
                    </h1>
                </div>

                <Tile className="space-y-3 text-sm text-gray-700">
                    <p><strong>Reference:</strong> {rtp_reference}</p>
                    <p><strong>Your Role:</strong> {position}</p>
                    <p>
                        <strong>Decision:</strong>{' '}
                        <Tag type={isApproved ? 'green' : 'red'}>
                            {isApproved ? 'Approved' : 'Declined'}
                        </Tag>
                    </p>

                    {isApproved && fully_approved && (
                        <InlineNotification
                            kind="success"
                            title="Fully Approved"
                            subtitle="This CAPEX has been fully approved by all signatories. The requester has been notified and may now raise a Purchase Order."
                            lowContrast
                            hideCloseButton
                        />
                    )}
                    {isApproved && !fully_approved && (
                        <InlineNotification
                            kind="info"
                            title="Approval Recorded"
                            subtitle="Your approval has been recorded. The request has been forwarded to the next approver."
                            lowContrast
                            hideCloseButton
                        />
                    )}
                    {!isApproved && (
                        <InlineNotification
                            kind="error"
                            title="Request Declined"
                            subtitle="The request has been declined. The requester has been notified."
                            lowContrast
                            hideCloseButton
                        />
                    )}

                    <p className="text-gray-400 text-xs pt-2">You may close this window.</p>
                </Tile>
            </div>
        </div>
    );
}
