<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #222; margin: 0; padding: 0; background: #f4f6f8; }
        .wrap { max-width: 650px; margin: 30px auto; background: #fff; border: 1px solid #d1d5db; border-radius: 8px; overflow: hidden; }
        .header { background: {{ $capexForm->status === 'approved' ? '#16a34a' : '#dc2626' }}; color: #fff; padding: 22px 32px; }
        .header h1 { margin: 0; font-size: 20px; }
        .header .sub { font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 4px; }
        .body { padding: 28px 32px; }
        .body p { margin: 0 0 14px; line-height: 1.6; }
        .approvals { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px; }
        .approvals thead th { background: #1e40af; color: #fff; padding: 8px 12px; text-align: left; }
        .approvals tbody td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
        .badge-approved { background: #dcfce7; color: #16a34a; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
        .badge-declined { background: #fee2e2; color: #dc2626; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
        .badge-pending { background: #f3f4f6; color: #6b7280; padding: 2px 8px; border-radius: 12px; font-size: 11px; }
        .footer { background: #f3f4f6; padding: 14px 32px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
<div class="wrap">
    <div class="header">
        <h1>CAPEX {{ $capexForm->status === 'approved' ? 'Fully Approved' : 'Declined' }}</h1>
        <div class="sub">Ref: {{ $capexForm->rtp_reference }} &nbsp;|&nbsp; Date: {{ now()->format('d M Y') }}</div>
    </div>
    <div class="body">
        <p>Dear <strong>{{ $capexForm->assetRequest->user?->name ?? 'Requester' }}</strong>,</p>

        @if($capexForm->status === 'approved')
        <p>
            Great news! Your CAPEX request <strong>{{ $capexForm->rtp_reference }}</strong> has been
            <strong style="color:#16a34a;">fully approved</strong> by all required signatories.
            You may now proceed to raise a <strong>Purchase Order</strong>.
        </p>
        @else
        <p>
            Your CAPEX request <strong>{{ $capexForm->rtp_reference }}</strong> has been
            <strong style="color:#dc2626;">declined</strong> at one of the approval stages.
            Please contact your IT Manager for further guidance.
        </p>
        @endif

        <p><strong>Approval Summary:</strong></p>
        <table class="approvals">
            <thead>
                <tr>
                    <th>Stage</th>
                    <th>Approver</th>
                    <th>Decision</th>
                    <th>Signed At</th>
                </tr>
            </thead>
            <tbody>
                @foreach($capexForm->approvals as $a)
                <tr>
                    <td>{{ \App\Models\CapexApproval::POSITION_LABELS[$a->approval_position] ?? $a->approval_position }}</td>
                    <td>{{ $a->approver_name ?? '—' }}</td>
                    <td>
                        @if($a->status === 'approved')
                            <span class="badge-approved">Approved</span>
                        @elseif($a->status === 'declined')
                            <span class="badge-declined">Declined</span>
                        @else
                            <span class="badge-pending">Pending</span>
                        @endif
                    </td>
                    <td>{{ $a->signed_at?->format('d M Y H:i') ?? '—' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    <div class="footer">
        &copy; {{ now()->format('Y') }} {{ config('app.name') }}.
    </div>
</div>
</body>
</html>
