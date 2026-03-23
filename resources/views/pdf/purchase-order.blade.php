<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #000; background: #fff; }
        .page { padding: 22px 30px; }

        /* ── TOP HEADER ── */
        .top-header { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
        .top-header td { vertical-align: top; padding: 2px 4px; }
        .addr-block { font-size: 10px; line-height: 1.6; width: 200px; }
        .logo-block  { text-align: center; width: 250px; }
        .logo-name   { font-size: 14px; font-weight: bold; }
        .logo-sub    { font-size: 11px; }
        .logo-po     { font-size: 18px; font-weight: bold; letter-spacing: 1px; margin-top: 4px; }
        .contact-block { text-align: right; font-size: 10px; line-height: 1.6; }

        /* ── PO NUMBER BAND ── */
        .po-band { width: 100%; border-collapse: collapse; margin-bottom: 0; }
        .po-band td { border: 1px solid #000; padding: 5px 8px; vertical-align: middle; }
        .po-number-cell { color: #dc2626; font-size: 22px; font-weight: bold; text-align: center; width: 120px; border-left: none; }
        .vendor-label { font-size: 10px; color: #333; width: 55px; }
        .vendor-value { font-size: 13px; font-weight: bold; border-bottom: 1px solid #000; min-width: 200px; }
        .date-label  { font-size: 10px; width: 40px; }
        .date-value  { font-size: 11px; font-weight: bold; border-bottom: 1px solid #000; width: 130px; }
        .req-label   { font-size: 10px; width: 90px; }
        .req-value   { font-size: 11px; border-bottom: 1px solid #000; min-width: 100px; }

        /* ── TIN / VAT ROW ── */
        .tin-row { width: 100%; border-collapse: collapse; }
        .tin-row td { border: 1px solid #000; border-top: none; padding: 5px 10px; vertical-align: middle; font-size: 11px; }
        .tin-label { font-weight: bold; width: 40px; }
        .tin-value { font-weight: bold; font-size: 12px; width: 160px; }
        .vat-label { font-weight: bold; width: 80px; text-align: right; }
        .vat-value { font-weight: bold; font-size: 12px; width: 120px; text-align: right; padding-right: 18px; }
        .quote-note { font-size: 9px; color: #444; font-style: italic; border: 1px solid #000; border-top: none; padding: 3px 10px; }

        /* ── ITEMS TABLE ── */
        .items-table { width: 100%; border-collapse: collapse; margin-top: 0; }
        .items-table th { border: 1px solid #000; padding: 6px 8px; font-size: 10px; text-align: center; background: #f0f0f0; }
        .items-table td { border: 1px solid #000; padding: 6px 8px; font-size: 10px; vertical-align: top; }
        .items-table .col-qty   { width: 45px; text-align: center; }
        .items-table .col-desc  { width: auto; }
        .items-table .col-up    { width: 90px; text-align: right; }
        .items-table .col-total { width: 90px; text-align: right; }
        .items-table .total-label { text-align: right; font-weight: bold; background: #f0f0f0; }
        .items-table .total-value { text-align: right; font-weight: bold; }
        .grand-total-row td { font-size: 12px; font-weight: bold; }

        /* ── SIGNATURE AREA ── */
        .sig-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        .sig-table td { padding: 4px 6px; font-size: 10px; vertical-align: bottom; }
        .sig-line { border-bottom: 1px solid #000; display: inline-block; width: 260px; }

        /* ── NOTES ── */
        .notes { font-size: 9px; color: #333; line-height: 1.7; margin-top: 10px; }

        /* ── AUTHORISED ── */
        .auth-block { text-align: right; margin-top: -30px; }
        .auth-label { font-size: 10px; }
        .auth-sig-box { border: 1px solid #bbb; width: 160px; height: 50px; display: inline-block; margin-top: 4px; font-size: 10px; font-style: italic; color: #555; padding: 4px 8px; }
    </style>
</head>
<body>
<div class="page">

    {{-- ── TOP HEADER ── --}}
    <table class="top-header">
        <tr>
            <td class="addr-block">
                Fort Street / 11th Avenue<br>
                P.O. Box 1001<br>
                Bulawayo
            </td>
            <td class="logo-block">
                @if(file_exists(public_path('images/simbisa-logo.png')))
                <img src="{{ public_path('images/simbisa-logo.png') }}" style="height:48px; width:auto; margin-bottom:4px;" /><br>
                @else
                <div class="logo-name">Simbisa Brands Zimbabwe (Pvt) Ltd</div>
                @endif
                <div class="logo-po">PURCHASE ORDER</div>
            </td>
            <td class="contact-block">
                Tel: 78471, 66706,<br>
                60925, 74571<br>
                Fax: 66635
            </td>
        </tr>
    </table>

    {{-- ── PO NUMBER + VENDOR + DATE ── --}}
    <table class="po-band">
        <tr>
            <td style="border:1px solid #000; padding:5px 8px; width:55px; font-size:10px; border-right:none;">To:</td>
            <td style="border:1px solid #000; border-left:none; border-right:none; padding:5px 8px; font-size:13px; font-weight:bold;">
                {{ $po->vendor_name }}
            </td>
            <td style="border:1px solid #000; border-left:none; border-right:none; padding:5px 8px; font-size:10px; width:45px;">Date:</td>
            <td style="border:1px solid #000; border-left:none; border-right:none; padding:5px 8px; font-size:11px; font-weight:bold; width:130px;">
                {{ $po->created_at->format('d / m / y') }}
            </td>
            <td class="po-number-cell" style="border:1px solid #000;">
                {{ $po->po_number }}
            </td>
        </tr>
        <tr>
            <td style="border:1px solid #000; border-top:none; padding:5px 8px; font-size:10px; border-right:none;">&nbsp;</td>
            <td style="border:1px solid #000; border-top:none; border-left:none; border-right:none; padding:5px 8px;">&nbsp;</td>
            <td colspan="2" style="border:1px solid #000; border-top:none; border-left:none; border-right:none; padding:5px 8px; font-size:10px;">
                Requisition No. {{ $po->requisition_no ?? '_______________' }}
            </td>
            <td style="border:1px solid #000; border-top:none;">&nbsp;</td>
        </tr>
    </table>

    {{-- ── TIN / VAT ROW ── --}}
    <table class="tin-row">
        <tr>
            <td class="tin-label">TIN</td>
            <td class="tin-value">{{ $po->vendor_tin ?? '___________________' }}</td>
            <td style="width:auto;">&nbsp;</td>
            <td class="vat-label">VAT Number</td>
            <td class="vat-value">{{ $po->vendor_vat_number ?? '___________________' }}</td>
        </tr>
    </table>
    <table style="width:100%; border-collapse:collapse;">
        <tr>
            <td class="quote-note">
                Please quote the above Order No. on invoices and delivery notes.
            </td>
        </tr>
    </table>

    {{-- ── ITEMS TABLE ── --}}
    <table class="items-table">
        <thead>
            <tr>
                <th class="col-qty">Qty</th>
                <th class="col-desc">Description of Goods or Services</th>
                <th class="col-up">Unit Price</th>
                <th class="col-total">Total Cost</th>
            </tr>
        </thead>
        <tbody>
            @foreach($po->items as $item)
            <tr>
                <td class="col-qty">{{ $item['qty'] }}</td>
                <td class="col-desc">{{ $item['description'] }}</td>
                <td class="col-up">
                    {{ $item['unit_price'] > 0 ? number_format($item['unit_price'], 2) : '' }}
                </td>
                <td class="col-total">
                    {{ $item['total'] > 0 ? number_format($item['total'], 2) : '' }}
                </td>
            </tr>
            @endforeach
            {{-- Pad to at least 8 rows --}}
            @for($p = count($po->items); $p < 8; $p++)
            <tr>
                <td class="col-qty">&nbsp;</td>
                <td class="col-desc">&nbsp;</td>
                <td class="col-up">&nbsp;</td>
                <td class="col-total">&nbsp;</td>
            </tr>
            @endfor

            {{-- VAT Row --}}
            <tr>
                <td colspan="3" class="total-label">VAT</td>
                <td class="total-value">
                    {{ $po->vat_amount > 0 ? number_format($po->vat_amount, 2) : '' }}
                </td>
            </tr>
            {{-- TOTAL Row --}}
            <tr class="grand-total-row">
                <td colspan="3" class="total-label">TOTAL</td>
                <td class="total-value">{{ number_format($po->total_amount, 2) }}</td>
            </tr>
        </tbody>
    </table>

    {{-- ── SIGNATURES ── --}}
    <table class="sig-table">
        <tr>
            <td style="vertical-align:bottom; padding-top:14px;">
                Manager:<span class="sig-line">&nbsp;{{ $po->manager_name ?? '' }}</span>
            </td>
            <td style="text-align:right; vertical-align:bottom; padding-top:14px;">
                Authorised by:
                <span style="display:inline-block; border:1px solid #bbb; width:150px; min-height:40px; padding:4px 8px; font-style:italic; font-size:10px; color:#555; vertical-align:bottom;">
                    {{ $po->authorised_by ?? '' }}
                </span>
            </td>
        </tr>
        <tr>
            <td style="padding-top:8px;">
                Allocation:<span class="sig-line">&nbsp;{{ $po->allocation ?? '' }}</span>
            </td>
            <td>&nbsp;</td>
        </tr>
    </table>

    {{-- ── NOTES ── --}}
    <div class="notes" style="margin-top:12px;">
        *To deduct 10% withholding Tax from payment if without Tax Clearance<br>
        NB: This order may be cancelled if goods or services are not delivered as per agreement.<br>
        All payments in bank transfer or cheque.
    </div>

    {{-- ── FOOTER ── --}}
    <div style="text-align:center; font-size:8px; color:#888; margin-top:14px; border-top:1px solid #ddd; padding-top:6px;">
        PO-{{ $po->po_number }} &nbsp;&mdash;&nbsp; CAPEX Ref: {{ $po->capexForm->rtp_reference }}
        &nbsp;&mdash;&nbsp; Generated {{ now()->format('d M Y H:i') }}
    </div>

</div>
</body>
</html>
