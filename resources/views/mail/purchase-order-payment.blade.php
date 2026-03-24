<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #222; background: #f4f6f8; margin: 0; padding: 0; }
        .wrap { max-width: 650px; margin: 30px auto; background: #fff; border: 1px solid #d1d5db; border-radius: 8px; overflow: hidden; }
        .header { background: #dc2626; color: #fff; padding: 22px 32px; }
        .header h1 { margin: 0; font-size: 20px; }
        .sub { font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 4px; }
        .body { padding: 28px 32px; }
        .body p { margin: 0 0 14px; line-height: 1.6; }
        .action-banner { background: #fee2e2; border: 1px solid #f87171; border-radius: 6px; padding: 16px 20px; margin: 16px 0; }
        .action-banner .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; color: #991b1b; font-weight: bold; margin-bottom: 6px; }
        .action-banner .msg { font-size: 14px; color: #7f1d1d; font-weight: bold; line-height: 1.5; }
        .po-box { background: #eff6ff; border-left: 4px solid #1a3a8f; border-radius: 4px; padding: 16px 20px; margin: 18px 0; }
        .po-number { font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 1px; }
        .table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px; }
        .table th { background: #1a3a8f; color: #fff; padding: 8px 12px; text-align: left; }
        .table td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
        .table tr:last-child td { border-bottom: none; }
        .total-row td { background: #f0f4ff; }
        .steps { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px 20px; margin: 18px 0; }
        .steps ol { margin: 8px 0 0 20px; padding: 0; }
        .steps li { margin-bottom: 8px; font-size: 13px; line-height: 1.5; }
        .notice { background: #fefce8; border: 1px solid #fde047; border-radius: 6px; padding: 12px 16px; font-size: 12px; color: #713f12; margin: 18px 0; }
        .footer { background: #f3f4f6; padding: 14px 32px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
<div class="wrap">
    <div class="header">
        <h1>&#9888; Action Required: Process Payment</h1>
        <div class="sub">Simbisa Brands Zimbabwe (Pvt) Ltd &mdash; {{ now()->format('d M Y') }}</div>
    </div>
    <div class="body">
        <p>Dear <strong>{{ $po->payment_person_name ?? 'Finance / Payments Officer' }}</strong>,</p>

        <div class="action-banner">
            <div class="label">Urgent Action Required</div>
            <div class="msg">
                Please process the payment of <span style="font-size:18px;">${{ number_format($po->total_amount, 2) }}</span>
                to <strong>{{ $po->vendor_name }}</strong> for Purchase Order <strong>#{{ $po->po_number }}</strong>.
            </div>
        </div>

        <p>
            A Purchase Order has been formally created following a fully approved CAPEX request.
            You are requested to make payment to the vendor as per the details below and then notify
            them so they can proceed with the delivery of goods/services.
        </p>

        <div class="po-box">
            <div style="font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Purchase Order Number</div>
            <div class="po-number">PO # {{ $po->po_number }}</div>
            <div style="font-size: 12px; color: #374151; margin-top: 8px;">
                CAPEX Reference: <strong>{{ $po->capexForm->rtp_reference }}</strong>
            </div>
        </div>

        <table class="table">
            <tr><th colspan="2">Payment Details</th></tr>
            <tr>
                <td style="color: #6b7280; width: 220px;">Vendor / Supplier</td>
                <td><strong>{{ $po->vendor_name }}</strong></td>
            </tr>
            @if($po->vendor_tin)
            <tr>
                <td style="color: #6b7280;">Vendor TIN</td>
                <td>{{ $po->vendor_tin }}</td>
            </tr>
            @endif
            @if($po->vendor_vat_number)
            <tr>
                <td style="color: #6b7280;">VAT Reg. No.</td>
                <td>{{ $po->vendor_vat_number }}</td>
            </tr>
            @endif
            @if($po->vendor_email)
            <tr>
                <td style="color: #6b7280;">Vendor Email</td>
                <td><a href="mailto:{{ $po->vendor_email }}" style="color:#1a3a8f;">{{ $po->vendor_email }}</a></td>
            </tr>
            @endif
            <tr>
                <td style="color: #6b7280;">Department</td>
                <td>{{ $po->capexForm->assetRequest->department?->name ?? '—' }}</td>
            </tr>
            <tr>
                <td style="color: #6b7280;">Requested By</td>
                <td>{{ $po->capexForm->assetRequest->user?->name ?? '—' }}</td>
            </tr>
            @if($po->requisition_no)
            <tr>
                <td style="color: #6b7280;">Requisition No.</td>
                <td>{{ $po->requisition_no }}</td>
            </tr>
            @endif
            @if($po->allocation)
            <tr>
                <td style="color: #6b7280;">Cost Allocation</td>
                <td>{{ $po->allocation }}</td>
            </tr>
            @endif
            @if(floatval($po->vat_amount) > 0)
            <tr>
                <td style="color: #6b7280;">VAT Amount</td>
                <td>${{ number_format($po->vat_amount, 2) }}</td>
            </tr>
            @endif
            <tr class="total-row">
                <td style="font-weight: bold;">Total Amount to Pay</td>
                <td style="font-size: 17px; font-weight: bold; color: #dc2626;">${{ number_format($po->total_amount, 2) }}</td>
            </tr>
        </table>

        @if(count($po->items ?? []) > 0)
        <table class="table">
            <tr>
                <th style="width: 40px; text-align: center;">Qty</th>
                <th>Description of Goods / Services</th>
                <th style="width: 120px; text-align: right;">Unit Price</th>
                <th style="width: 120px; text-align: right;">Total</th>
            </tr>
            @foreach($po->items as $item)
            <tr>
                <td style="text-align: center;">{{ $item['qty'] ?? 1 }}</td>
                <td>{{ $item['description'] ?? '—' }}</td>
                <td style="text-align: right;">${{ number_format($item['unit_price'] ?? 0, 2) }}</td>
                <td style="text-align: right; font-weight: bold;">${{ number_format($item['total'] ?? 0, 2) }}</td>
            </tr>
            @endforeach
        </table>
        @endif

        <div class="steps">
            <strong style="font-size: 13px;">Steps to complete:</strong>
            <ol>
                <li>Review the attached Purchase Order PDF for full item specifications.</li>
                <li>Process the bank transfer of <strong>${{ number_format($po->total_amount, 2) }}</strong> to <strong>{{ $po->vendor_name }}</strong>.</li>
                <li>Once payment is sent, notify the vendor (<strong>{{ $po->vendor_name }}</strong>{{ $po->vendor_email ? ' at ' . $po->vendor_email : '' }}) that payment has been made so they can proceed with delivery.</li>
                <li>Update the invoice/payment status in the AssetLinq system once confirmed.</li>
            </ol>
        </div>

        <div class="notice">
            <strong>Note:</strong> The official Purchase Order PDF is attached to this email. Please keep it for your records and attach it to the payment documentation.
        </div>

        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">This is an automated notification from the AssetLinq ERP system. Please do not reply to this email.</p>
    </div>
    <div class="footer">Simbisa Brands Zimbabwe (Pvt) Ltd | AssetLinq ERP | &copy; {{ now()->format('Y') }}</div>
</div>
</body>
</html>
