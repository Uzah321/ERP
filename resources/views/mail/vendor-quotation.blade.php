<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #222; margin: 0; padding: 0; background: #f4f6f8; }
        .email-wrap { max-width: 700px; margin: 30px auto; background: #fff; border: 1px solid #d1d5db; border-radius: 8px; overflow: hidden; }
        .email-header { background: #1e40af; color: #fff; padding: 24px 32px; }
        .email-header h1 { margin: 0; font-size: 22px; letter-spacing: 0.5px; }
        .email-header .ref { font-size: 13px; color: #93c5fd; margin-top: 4px; }
        .email-body { padding: 28px 32px; }
        .email-body p { margin: 0 0 14px; line-height: 1.6; }
        .info-grid { margin: 18px 0 24px; }
        .info-grid table { width: 100%; border-collapse: collapse; }
        .info-grid td { padding: 6px 12px; font-size: 13px; }
        .info-grid .label { font-weight: 700; color: #374151; width: 180px; background: #f9fafb; }
        .info-grid .value { color: #111827; }
        .spec-table { width: 100%; border-collapse: collapse; margin: 16px 0 24px; }
        .spec-table thead th { background: #1e40af; color: #fff; padding: 10px 14px; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
        .spec-table tbody td { padding: 10px 14px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #374151; }
        .spec-table tbody tr:nth-child(even) { background: #f9fafb; }
        .spec-table tbody tr:hover { background: #eff6ff; }
        .spec-table tfoot td { padding: 10px 14px; font-size: 12px; color: #6b7280; background: #f3f4f6; border-top: 2px solid #1e40af; }
        .note-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #92400e; }
        .supplier-notice { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 20px 24px; margin: 24px 0; font-size: 13px; color: #0c4a6e; line-height: 1.7; }
        .supplier-notice h3 { margin: 0 0 10px; font-size: 14px; color: #0369a1; }
        .supplier-notice ol, .supplier-notice ul { margin: 8px 0 16px 20px; padding: 0; }
        .supplier-notice li { margin-bottom: 6px; }
        .supplier-notice strong { color: #0c4a6e; }
        .email-footer { background: #f3f4f6; padding: 18px 32px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="email-wrap">
        <div class="email-header">
            <h1>Supply Request Quotation</h1>
            <div class="ref">Ref: {{ $ref }} &nbsp;|&nbsp; Date: {{ now()->format('d M Y') }}</div>
        </div>

        <div class="email-body">
            <p>Dear <strong>{{ $vendor->name }}</strong>,</p>
            <p>We kindly request a quotation for the following IT asset requirements. Please review the specifications below and provide your best pricing.</p>

            @php
                $displayItems = (!empty($assetRequest->items) && is_array($assetRequest->items))
                    ? $assetRequest->items
                    : [[
                        'asset_type'   => $assetRequest->asset_type,
                        'for_whom'     => $assetRequest->for_whom,
                        'position'     => $assetRequest->position,
                        'requirements' => $assetRequest->requirements,
                        'quantity'     => 1,
                    ]];
                $totalQuantity = collect($displayItems)->sum(fn($i) => (int)($i['quantity'] ?? 1));
            @endphp

            {{-- Request Details --}}
            <div class="info-grid">
                <table>
                    <tr>
                        <td class="label">Requesting Department:</td>
                        <td class="value">{{ $assetRequest->department?->name ?? '-' }}</td>
                    </tr>
                    <tr>
                        <td class="label">Asset Category:</td>
                        <td class="value">{{ $assetRequest->asset_category }}</td>
                    </tr>
                    <tr>
                        <td class="label">Total Quantity:</td>
                        <td class="value">{{ $totalQuantity }}</td>
                    </tr>
                    <tr>
                        <td class="label">Request Date:</td>
                        <td class="value">{{ $assetRequest->created_at?->format('d M Y') ?? '-' }}</td>
                    </tr>
                </table>
            </div>

            {{-- Specification Table --}}
            <table class="spec-table">
                <thead>
                    <tr>
                        <th style="width: 40px;">No.</th>
                        <th>Description</th>
                        <th>Specifications</th>
                        <th style="width: 60px;">Qty</th>
                        <th style="width: 120px;">Unit Price (Excl. VAT)</th>
                        <th style="width: 120px;">Total (Excl. VAT)</th>
                        <th style="width: 120px;">Expected Delivery</th>
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
                        <td style="color: #9ca3af; font-style: italic;">To be quoted</td>
                        <td style="color: #9ca3af; font-style: italic;">To be quoted</td>
                        <td>3 – 7 working days</td>
                    </tr>
                    @endforeach
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="7">
                            * All prices excluding VAT. Vendor to provide pricing per item. Expected delivery: 3 – 7 working days from order confirmation.
                        </td>
                    </tr>
                </tfoot>
            </table>

            <div class="note-box">
                <strong>Instructions:</strong> Please complete the pricing columns and return this quotation via email. 
                Include delivery lead time, warranty terms, and any applicable volume discounts. 
                Quotations are valid for 30 days from date of submission.
            </div>

            <div class="supplier-notice">
                <p><strong>Dear Suppliers.</strong></p>
                <p>We invite you to kindly submit full quotations for the IT products/services as per attached spec-sheet by 13/03/2026.</p>

                <h3>How to Submit your Quotes:</h3>
                <ol>
                    <li>Send us an email with subject <strong>QUOTATION SUBMISSION - REF: {{ $ref }}</strong></li>
                    <li>Attach and send your quote as per spec-sheet within 3 days to <strong>quotes@zw-simbisa.com</strong> (replying with quotes to this email will automatically disqualify your submission)</li>
                    <li>Attach and send copies of your TAX and/or VAT Registration Certificates to <strong>compliance@zw-simbisa.com</strong> with subject <strong>REF: {{ $ref }}</strong></li>
                    <li>Please ensure that all requirements are sent to the appropriate emails to avoid delays/disqualification.</li>
                </ol>

                <h3>All Quotes must include the following information:</h3>
                <ul>
                    <li>Accurate billing information.</li>
                    <li>Simbisa Brands TAX and TIN Numbers.</li>
                    <li>Supplier&rsquo;s Address, Contacts, Email and TAX registration and TIN Numbers</li>
                    <li>Accurate quantities, prices, VAT, and quote totals.</li>
                    <li>Clear Payment Terms and Conditions.</li>
                    <li>Clear Expected Delivery Timelines &amp; Shipping Policy.</li>
                    <li>Clear Payment Account Information.</li>
                </ul>

                <p>Purchase orders will be tendered to the selected supplier(s) within <strong>48 Hours</strong> from the closure of submission.</p>
            </div>

            <p>If you have questions or require clarification, please reply directly to this email.</p>

            <p>
                Kind regards,<br>
                <strong>IT Procurement</strong><br>
                {{ config('app.name') }}
            </p>
        </div>

        <div class="email-footer">
            &copy; {{ now()->format('Y') }} {{ config('app.name') }}. This is an automated quotation request. Please do not share this document externally.
        </div>
    </div>
</body>
</html>
