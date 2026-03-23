<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #222; margin: 0; padding: 0; background: #f4f6f8; }
        .wrap { max-width: 650px; margin: 30px auto; background: #fff; border: 1px solid #d1d5db; border-radius: 8px; overflow: hidden; }
        .header { background: #1e40af; color: #fff; padding: 22px 32px; }
        .header h1 { margin: 0; font-size: 20px; }
        .header .sub { font-size: 12px; color: #93c5fd; margin-top: 4px; }
        .body { padding: 28px 32px; }
        .body p { margin: 0 0 14px; line-height: 1.6; }
        .info-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px 18px; margin: 18px 0; font-size: 13px; }
        .info-box table { width: 100%; border-collapse: collapse; }
        .info-box td { padding: 4px 8px; }
        .info-box .label { font-weight: bold; color: #374151; width: 160px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
        .items-table thead th { background: #1e40af; color: #fff; padding: 8px 12px; text-align: left; }
        .items-table tbody td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
        .items-table tbody tr:nth-child(even) { background: #f9fafb; }
        .btn-wrap { text-align: center; margin: 28px 0 10px; }
        .btn-approve { display: inline-block; background: #16a34a; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; margin-right: 12px; }
        .btn-decline { display: inline-block; background: #dc2626; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; }
        .note { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 10px 16px; font-size: 12px; color: #92400e; margin: 16px 0; }
        .footer { background: #f3f4f6; padding: 14px 32px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
<div class="wrap">
    <div class="header">
        <h1>CAPEX Approval Required</h1>
        <div class="sub">
            Ref: {{ $approval->capexForm->rtp_reference }} &nbsp;|&nbsp;
            Stage: {{ $approval->positionLabel() }} &nbsp;|&nbsp;
            Date: {{ now()->format('d M Y') }}
        </div>
    </div>
    <div class="body">
        <p>Dear <strong>{{ $approval->approver_name ?? $approval->positionLabel() }}</strong>,</p>
        <p>
            A Capital Expenditure (CAPEX) request requires your approval. Please review the details below
            and click <strong>Approve</strong> or <strong>Decline</strong> to record your decision.
        </p>

        <div class="info-box">
            <table>
                <tr>
                    <td class="label">RTP Reference:</td>
                    <td>{{ $approval->capexForm->rtp_reference }}</td>
                </tr>
                <tr>
                    <td class="label">Department:</td>
                    <td>{{ $approval->capexForm->assetRequest->department?->name ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Requested By:</td>
                    <td>{{ $approval->capexForm->assetRequest->user?->name ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Request Type:</td>
                    <td>{{ $approval->capexForm->request_type }}</td>
                </tr>
                <tr>
                    <td class="label">Asset Life:</td>
                    <td>{{ $approval->capexForm->asset_life }}</td>
                </tr>
                <tr>
                    <td class="label">Cost Allocation:</td>
                    <td>{{ $approval->capexForm->cost_allocation ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Insurance Status:</td>
                    <td>{{ $approval->capexForm->insurance_status ? 'Yes' : 'No' }}</td>
                </tr>
                <tr>
                    <td class="label">Reason:</td>
                    <td>{{ $approval->capexForm->reason_for_purchase ?? '-' }}</td>
                </tr>
                @if($approval->capexForm->total_amount)
                <tr>
                    <td class="label" style="color:#16a34a; font-size:14px;">Order Total:</td>
                    <td style="font-size:16px; font-weight:bold; color:#16a34a;">
                        ${{ number_format($approval->capexForm->total_amount, 2) }}
                        <span style="font-size:11px; color:#6b7280; font-weight:normal;"> &nbsp;(from recommended quotation)</span>
                    </td>
                </tr>
                @endif
            </table>
        </div>

        @if(!empty($approval->capexForm->items))
        <table class="items-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Description</th>
                    <th>Specifications</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($approval->capexForm->items as $i => $item)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td><strong>{{ $item['asset_type'] ?? '-' }}</strong></td>
                    <td>{{ $item['requirements'] ?? '-' }}</td>
                    <td>{{ $item['quantity'] ?? 1 }}</td>
                    <td>{{ isset($item['unit_price']) ? '$'.number_format($item['unit_price'], 2) : '—' }}</td>
                    <td>{{ (isset($item['unit_price']) && isset($item['quantity'])) ? '$'.number_format($item['unit_price'] * $item['quantity'], 2) : '—' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        <div class="note">
            <strong>Important:</strong> Clicking the button below will take you to a secure page where you
            must enter your system password to confirm your decision. Your name and timestamp will be
            recorded as your digital signature.
        </div>

        <div class="btn-wrap">
            <a href="{{ route('capex.approve.show', $approval->token) }}" class="btn-approve">Review &amp; Sign</a>
        </div>

        <p style="font-size:12px; color:#6b7280; text-align:center;">
            This link is unique to you. Do not forward this email to others.
        </p>
    </div>
    <div class="footer">
        &copy; {{ now()->format('Y') }} {{ config('app.name') }}. Confidential CAPEX approval workflow.
    </div>
</div>
</body>
</html>
