<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #222; background: #f4f6f8; margin: 0; padding: 0; }
        .wrap { max-width: 650px; margin: 30px auto; background: #fff; border: 1px solid #d1d5db; border-radius: 8px; overflow: hidden; }
        .header { background: #1a3a8f; color: #fff; padding: 22px 32px; }
        .header h1 { margin: 0; font-size: 20px; }
        .sub { font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 4px; }
        .body { padding: 28px 32px; }
        .body p { margin: 0 0 14px; line-height: 1.6; }
        .po-box { background: #eff6ff; border-left: 4px solid #1a3a8f; border-radius: 4px; padding: 16px 20px; margin: 18px 0; }
        .po-number { font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 1px; }
        .table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px; }
        .table th { background: #1a3a8f; color: #fff; padding: 8px 12px; text-align: left; }
        .table td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
        .table tr:last-child td { border-bottom: none; }
        .total-row td { background: #f0f4ff; }
        .status-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 16px 20px; margin: 18px 0; }
        .status-box h3 { color: #166534; font-size: 14px; margin: 0 0 8px; }
        .status-box p { color: #166534; font-size: 13px; margin: 0; line-height: 1.6; }
        .notice { background: #fefce8; border: 1px solid #fde047; border-radius: 6px; padding: 12px 16px; font-size: 12px; color: #713f12; margin: 18px 0; }
        .footer { background: #f3f4f6; padding: 14px 32px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
<div class="wrap">
    <div class="header">
        <h1>Purchase Order Notification</h1>
        <div class="sub">Simbisa Brands Zimbabwe (Pvt) Ltd &mdash; {{ now()->format('d M Y') }}</div>
    </div>
    <div class="body">
        <p>Dear <strong>{{ $po->vendor_name }}</strong>,</p>
        <p>
            We are pleased to inform you that a Purchase Order has been formally raised for goods/services to be procured from your organisation.
            Please find the full Purchase Order details attached to this email as a PDF document.
        </p>

        <div class="po-box">
            <div style="font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Purchase Order Number</div>
            <div class="po-number">PO # {{ $po->po_number }}</div>
            <div style="font-size: 12px; color: #374151; margin-top: 8px;">
                CAPEX Reference: <strong>{{ $po->capexForm->rtp_reference }}</strong>
            </div>
        </div>

        <table class="table">
            <tr><th colspan="2">Order Summary</th></tr>
            <tr>
                <td style="color: #6b7280; width: 220px;">Ordered By</td>
                <td><strong>Simbisa Brands Zimbabwe (Pvt) Ltd</strong></td>
            </tr>
            <tr>
                <td style="color: #6b7280;">Department</td>
                <td>{{ $po->capexForm->assetRequest->department?->name ?? '—' }}</td>
            </tr>
            <tr>
                <td style="color: #6b7280;">Number of Items</td>
                <td>{{ collect($po->items ?? [])->sum('qty') }} unit(s) across {{ count($po->items ?? []) }} line item(s)</td>
            </tr>
            @if(floatval($po->vat_amount) > 0)
            <tr>
                <td style="color: #6b7280;">VAT Amount</td>
                <td>${{ number_format($po->vat_amount, 2) }}</td>
            </tr>
            @endif
            <tr class="total-row">
                <td style="font-weight: bold;">Total Order Amount</td>
                <td style="font-size: 17px; font-weight: bold; color: #1a3a8f;">${{ number_format($po->total_amount, 2) }}</td>
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

        <div class="status-box">
            <h3>&#10003; Payment Is Being Processed</h3>
            <p>
                Please be assured that payment for the above Purchase Order is currently being processed by our Finance team.
                You will receive the transfer within the agreed payment terms.<br><br>
                <strong>Once you have confirmed receipt of payment, you are authorised to proceed with the delivery of the goods/services
                as specified in the attached Purchase Order.</strong>
            </p>
        </div>

        <div class="notice">
            <strong>Delivery Address:</strong> Fort Street / 11th Avenue, Bulawayo, Zimbabwe.<br>
            Please ensure all goods are delivered in accordance with the specifications outlined in the Purchase Order PDF attached.
            A signed copy of the delivery note will be required upon delivery.
        </div>

        <p>If you have any queries regarding this Purchase Order, please contact us at
            <a href="mailto:procurement@simbisa.co.zw" style="color: #1a3a8f;">procurement@simbisa.co.zw</a>.
        </p>

        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">This is an automated notification from the AssetLinq ERP system. Please do not reply to this email.</p>
    </div>
    <div class="footer">Simbisa Brands Zimbabwe (Pvt) Ltd | AssetLinq ERP | &copy; {{ now()->format('Y') }}</div>
</div>
</body>
</html>
