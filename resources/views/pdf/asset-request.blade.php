<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #222; margin: 0; padding: 0; }
        .container { padding: 30px 40px; }
        .header-bar { background: #1e40af; color: #fff; padding: 20px 40px; margin: -30px -40px 24px -40px; }
        .header-bar h1 { margin: 0; font-size: 20px; }
        .header-bar .ref { font-size: 11px; color: #93c5fd; margin-top: 4px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-table td { padding: 5px 10px; font-size: 12px; border-bottom: 1px solid #e5e7eb; }
        .info-table .label { font-weight: bold; color: #374151; width: 170px; background: #f9fafb; }
        .spec-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        .spec-table thead th { background: #1e40af; color: #fff; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .spec-table tbody td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
        .spec-table tbody tr:nth-child(even) { background: #f9fafb; }
        .spec-table tfoot td { padding: 8px 12px; font-size: 10px; color: #6b7280; background: #f3f4f6; border-top: 2px solid #1e40af; }
        .summary-row { background: #eff6ff !important; }
        .note { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 10px 14px; margin: 16px 0; font-size: 11px; color: #92400e; }
        .footer { text-align: center; font-size: 10px; color: #9ca3af; margin-top: 30px; padding-top: 12px; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header-bar">
            <h1>Supply Request Quotation</h1>
            <div class="ref">Ref: SRQ-{{ date('Y') }}-{{ str_pad($request_id ?? '0', 4, '0', STR_PAD_LEFT) }} &nbsp;|&nbsp; Date: {{ $created_at ?? date('d M Y') }}</div>
        </div>

        @php
            $displayItems = (!empty($items) && is_array($items))
                ? $items
                : [[
                    'asset_type'   => $asset_type ?? '-',
                    'for_whom'     => $for_whom ?? '-',
                    'position'     => $position ?? '-',
                    'requirements' => $requirements ?? '-',
                    'quantity'     => 1,
                ]];
            $totalQuantity = collect($displayItems)->sum(fn($i) => (int)($i['quantity'] ?? 1));
        @endphp

        <table class="info-table">
            <tr><td class="label">Requested By:</td><td>{{ $user_name ?? '-' }}</td></tr>
            <tr><td class="label">Department:</td><td>{{ $department_name ?? '-' }}</td></tr>
            <tr><td class="label">Target Department:</td><td>{{ $target_department_name ?? '-' }}</td></tr>
            <tr><td class="label">Asset Category:</td><td>{{ $asset_category ?? '-' }}</td></tr>
            <tr><td class="label">Total Quantity:</td><td>{{ $totalQuantity }}</td></tr>
        </table>

        <table class="spec-table">
            <thead>
                <tr>
                    <th style="width: 30px;">No.</th>
                    <th>Description</th>
                    <th>Specifications</th>
                    <th style="width: 40px;">Qty</th>
                    <th style="width: 90px;">Unit Price (Excl. VAT)</th>
                    <th style="width: 90px;">Total (Excl. VAT)</th>
                    <th style="width: 90px;">Expected Delivery</th>
                </tr>
            </thead>
            <tbody>
                @foreach($displayItems as $i => $item)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>
                        <strong>{{ $item['asset_type'] }}</strong><br>
                        <small style="color:#6b7280;">Preferred Brands: HP / Dell</small>
                    </td>
                    <td>{{ $item['requirements'] }}</td>
                    <td>{{ $item['quantity'] ?? 1 }}</td>
                    <td></td>
                    <td></td>
                    <td>3 – 7 working days</td>
                </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="7">* All prices excluding VAT. Expected delivery: 3 – 7 working days from order confirmation.</td>
                </tr>
            </tfoot>
        </table>

        <div class="note">
            <strong>Instructions:</strong> Complete pricing columns and return. Include delivery lead time, warranty terms, and volume discounts if applicable. Quotations valid for 30 days.
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} {{ config('app.name') }}. Confidential — do not distribute.
        </div>
    </div>
</body>
</html>
