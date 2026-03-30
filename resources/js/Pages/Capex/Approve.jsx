import { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import {
    Form,
    PasswordInput,
    Button,
    Tag,
    Tile,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    InlineNotification,
} from '@carbon/react';
import { CheckmarkFilled, CloseFilled } from '@carbon/icons-react';

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
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--cds-layer-01)' }}>
            <Head title={`CAPEX Approval — ${approval.rtp_reference}`} />

            <div className="w-full max-w-lg">
                <div className="bg-blue-800 text-white px-8 py-6">
                    <h1 className="text-xl font-bold">CAPEX Approval</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--cds-text-inverse)' }}>
                        Ref: {approval.rtp_reference} &nbsp;|&nbsp; Stage: {approval.position_label}
                    </p>
                </div>

                <Tile>
                    <div className="space-y-4">
                        <div className="p-4 text-sm space-y-1" style={{ background: 'var(--cds-layer-01)', border: '1px solid var(--cds-border-subtle)' }}>
                            <div className="flex justify-between">
                                <span className="font-medium" style={{ color: 'var(--cds-text-secondary)' }}>Department:</span>
                                <span>{approval.department}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium" style={{ color: 'var(--cds-text-secondary)' }}>Request Type:</span>
                                <span>{approval.request_type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium" style={{ color: 'var(--cds-text-secondary)' }}>Items:</span>
                                <span>{approval.items?.length ?? 0} item(s)</span>
                            </div>
                            {approval.total_amount && (
                                <div className="flex justify-between pt-2 mt-2" style={{ borderTop: '1px solid var(--cds-border-subtle)' }}>
                                    <span className="font-semibold" style={{ color: 'var(--cds-text-secondary)' }}>Order Total (Cheapest Quote):</span>
                                    <span className="font-bold text-base" style={{ color: 'var(--cds-support-success)' }}>
                                        ${parseFloat(approval.total_amount).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>

                        {approval.items?.length > 0 && (
                            <Table size="sm">
                                <TableHead>
                                    <TableRow>
                                        <TableHeader>#</TableHeader>
                                        <TableHeader>Description</TableHeader>
                                        <TableHeader>Qty</TableHeader>
                                        <TableHeader>Unit Price</TableHeader>
                                        <TableHeader>Line Total</TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {approval.items.map((item, i) => {
                                        const qty = parseInt(item.quantity ?? 1, 10);
                                        const up = parseFloat(item.unit_price ?? 0);
                                        return (
                                            <TableRow key={i}>
                                                <TableCell>{i + 1}</TableCell>
                                                <TableCell className="font-medium">{item.asset_type}</TableCell>
                                                <TableCell>{qty}</TableCell>
                                                <TableCell>{up > 0 ? `$${up.toFixed(2)}` : '—'}</TableCell>
                                                <TableCell className="font-semibold">
                                                    {(qty * up) > 0 ? `$${(qty * up).toFixed(2)}` : '—'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}

                        <Form onSubmit={submit} className="space-y-4 pt-2">
                            <div>
                                <p className="text-sm font-medium mb-2" style={{ color: 'var(--cds-text-secondary)' }}>Your Decision</p>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => chooseDecision('approved')}
                                        className="flex-1 py-2 border-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                        style={decision === 'approved'
                                            ? { borderColor: 'var(--cds-support-success)', background: 'var(--cds-support-success)', color: 'var(--cds-text-inverse)' }
                                            : { borderColor: 'var(--cds-support-success)', color: 'var(--cds-support-success)' }
                                        }
                                    >
                                        <CheckmarkFilled size={16} />
                                        Approve
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => chooseDecision('declined')}
                                        className="flex-1 py-2 border-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                        style={decision === 'declined'
                                            ? { borderColor: 'var(--cds-support-error)', background: 'var(--cds-support-error)', color: 'var(--cds-text-inverse)' }
                                            : { borderColor: 'var(--cds-support-error)', color: 'var(--cds-support-error)' }
                                        }
                                    >
                                        <CloseFilled size={16} />
                                        Decline
                                    </button>
                                </div>
                            </div>

                            {decision && (
                                <>
                                    {errors.password && (
                                        <InlineNotification
                                            kind="error"
                                            title={errors.password}
                                            lowContrast
                                            hideCloseButton
                                        />
                                    )}

                                    <PasswordInput
                                        id="approve-password"
                                        labelText="Enter your password to confirm"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Your system password"
                                        required
                                        autoFocus
                                    />
                                    <p className="text-xs" style={{ color: 'var(--cds-text-placeholder)' }}>
                                        Your name and timestamp will be recorded as your digital signature.
                                    </p>

                                    <Button
                                        type="submit"
                                        kind={decision === 'approved' ? 'primary' : 'danger'}
                                        disabled={processing || !data.password}
                                        className="w-full"
                                    >
                                        {processing
                                            ? 'Processing…'
                                            : decision === 'approved'
                                                ? 'Confirm Approval'
                                                : 'Confirm Decline'}
                                    </Button>
                                </>
                            )}
                        </Form>
                    </div>
                </Tile>
            </div>
        </div>
    );
}
