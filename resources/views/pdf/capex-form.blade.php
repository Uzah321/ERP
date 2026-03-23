<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #000; background: #fff; }
        .page { padding: 20px 28px; }

        /* ── TOP HEADER ── */
        .top-header { width: 100%; border-collapse: collapse; margin-bottom: 0; }
        .top-header td { border: 1px solid #000; padding: 5px 8px; vertical-align: middle; }
        .ref-label { font-weight: bold; width: 120px; }
        .ref-value { font-size: 12px; font-weight: bold; color: #1a3a8f; width: 200px; }
        .dept-label { background: #1a3a8f; color: #fff; font-weight: bold; text-align: center; width: 80px; }
        .dept-value { font-weight: bold; width: 130px; }

        /* ── TITLE BAND ── */
        .title-band { width: 100%; border-collapse: collapse; }
        .title-band td { border: 1px solid #000; border-top: none; padding: 6px 8px; vertical-align: middle; }
        .title-main { font-weight: bold; font-size: 12px; text-align: center; background: #fff; }
        .date-label { font-weight: bold; text-align: center; font-size: 10px; width: 80px; background: #dce6f1; }
        .date-value { font-size: 10px; width: 130px; text-align: center; }

        /* ── SECTION HEADER ── */
        .section-header { width: 100%; border-collapse: collapse; margin-top: 0; }
        .section-header td { padding: 5px 8px; font-weight: bold; font-size: 10px; text-transform: uppercase;
                              letter-spacing: 0.5px; border: 1px solid #000; border-top: none; vertical-align: middle; }
        .section-blue { background: #1a3a8f; color: #fff; }
        .section-right { font-size: 10px; }

        /* ── ITEMS TABLE ── */
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th { background: #1a3a8f; color: #fff; padding: 6px 8px; font-size: 10px;
                          text-align: left; border: 1px solid #000; border-top: none; vertical-align: middle; }
        .items-table td { padding: 7px 8px; border: 1px solid #000; border-top: none;
                          font-size: 10px; vertical-align: top; }
        .items-table .col-desc  { width: 28%; }
        .items-table .col-spec  { width: 38%; }
        .items-table .col-qty   { width: 8%;  text-align: center; }
        .items-table .col-edt   { width: 26%; text-align: center; }
        .edt-label { font-size: 9px; font-weight: bold; text-transform: uppercase; }
        .edt-sub   { font-size: 8px; color: #555; }

        /* ── ASSET INFO TABLE ── */
        .info-table { width: 100%; border-collapse: collapse; margin-top: 18px; }
        .info-table td { border: 1px solid #000; padding: 6px 8px; font-size: 10px; vertical-align: top; }
        .info-section-hdr td { background: #1a3a8f; color: #fff; font-weight: bold;
                                font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; }
        .info-label { font-style: italic; font-size: 9.5px; color: #222; width: 210px; }
        .info-value { font-size: 10px; }

        /* ── AUTHORIZATIONS TABLE ── */
        .auth-table { width: 100%; border-collapse: collapse; margin-top: 18px; }
        .auth-table td { border: 1px solid #000; padding: 7px 8px; font-size: 10px; vertical-align: middle; }
        .auth-section-hdr { background: #1a3a8f; color: #fff; font-weight: bold;
                            font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; }
        .auth-official { font-size: 10px; font-weight: bold; text-align: center; }
        .auth-role     { font-size: 9.5px; color: #222; width: 200px; }
        .auth-sig      { font-weight: bold; font-size: 10px; width: 175px;
                         text-decoration: {{ 'none' }}; color: #1a3a8f; }
        .auth-date-lbl { font-size: 9px; color: #555; width: 100px; }
        .auth-date-val { font-size: 9.5px; font-weight: bold; width: 115px; }
        .sig-approved  { color: #16a34a; font-weight: bold; }
        .sig-declined  { color: #dc2626; font-weight: bold; }
        .sig-pending   { color: #9ca3af; font-style: italic; }

        /* ── QUOTATION SUMMARY TABLE ── */
        .quot-table { width: 100%; border-collapse: collapse; margin-top: 18px; }
        .quot-table td, .quot-table th { border: 1px solid #000; padding: 6px 8px; font-size: 10px; }
        .quot-table thead th { background: #1a3a8f; color: #fff; font-weight: bold; }
        .quot-selected { background: #dcfce7; font-weight: bold; color: #15803d; }
        .quot-total-row td { background: #1a3a8f; color: #fff; font-weight: bold; font-size: 11px; text-align: right; }

        /* ── FOOTER ── */
        .page-footer { text-align: center; font-size: 9px; color: #555; margin-top: 18px; }
    </style>
</head>
<body>
<div class="page">

    {{-- ── LETTERHEAD / LOGO HEADER ── --}}
    <table style="width:100%; border-collapse:collapse; margin-bottom:10px; border-bottom:2px solid #c0392b;">
        <tr>
            <td style="padding:6px 0; vertical-align:middle; width:220px;">
                @if(!empty($logoBase64))
                <img src="{{ $logoBase64 }}" style="height:55px; width:auto;" />
                @else
                <div style="font-size:14px; font-weight:bold; color:#c0392b;">Simbisa Brands Limited</div>
                @endif
            </td>
            <td style="text-align:right; padding:6px 0; vertical-align:middle;">
                <div style="font-size:9px; color:#555; line-height:1.7;">
                    Fort Street / 11th Avenue, P.O. Box 1001, Bulawayo<br>
                    Tel: 78471, 66706, 60925, 74571 &nbsp;&bull;&nbsp; Fax: 66635
                </div>
                <div style="margin-top:6px; background:#1a3a8f; color:#fff; font-size:9px; font-weight:bold; padding:4px 12px; display:inline-block; letter-spacing:0.8px;">CAPITAL EXPENDITURE &mdash; REQUEST TO PURCHASE FORM</div>
            </td>
        </tr>
    </table>

    {{-- ── TOP HEADER ── --}}
    <table class="top-header">
        <tr>
            <td class="ref-label">RTP REFERENCE:</td>
            <td class="ref-value">{{ $capex->rtp_reference }}</td>
            <td class="dept-label">Department</td>
            <td class="dept-value">{{ $capex->assetRequest->department?->name ?? '-' }}</td>
        </tr>
    </table>

    {{-- ── TITLE BAND ── --}}
    <table class="title-band">
        <tr>
            <td class="title-main">
                SIMBISA TECHNOLOGY SERVICES &mdash; REQUEST TO PROCURE &amp; SPECIFICATION SHEET
            </td>
            <td class="date-label">Request<br>Date</td>
            <td class="date-value">{{ $capex->created_at->format('F d, Y') }}</td>
        </tr>
    </table>

    {{-- ── ITEMS TABLE HEADER ── --}}
    <table class="items-table">
        <thead>
            <tr>
                <th class="col-desc">PRIMARY ITEM DESCRIPTION</th>
                <th class="col-spec">REQUIRED ITEM SPECIFICATIONS</th>
                <th class="col-qty">QUANTITY</th>
                <th class="col-edt">
                    <span class="edt-label">EDT (WORKING DAYS)</span><br>
                    <span class="edt-sub">EXPECTED DELIVERY TIME</span>
                </th>
            </tr>
        </thead>
        <tbody>
            @foreach($capex->items as $item)
            <tr>
                <td class="col-desc"><strong>{{ $item['asset_type'] ?? '-' }}</strong></td>
                <td class="col-spec">{{ $item['requirements'] ?? '-' }}</td>
                <td class="col-qty">{{ $item['quantity'] ?? 1 }}</td>
                <td class="col-edt">3 &ndash; 7</td>
            </tr>
            @endforeach
            {{-- Blank pad rows to fill space --}}
            @for($p = count($capex->items); $p < 5; $p++)
            <tr>
                <td class="col-desc">&nbsp;</td>
                <td class="col-spec">&nbsp;</td>
                <td class="col-qty">&nbsp;</td>
                <td class="col-edt">&nbsp;</td>
            </tr>
            @endfor
        </tbody>
    </table>

    {{-- ── ASSET INFO SECTION ── --}}
    <table class="info-table">
        <tr class="info-section-hdr">
            <td style="width:210px;">ASSET INFO, EVIDENCE &amp; REQUEST JUSTIFICATION</td>
            <td>Request Type: &nbsp; <span style="font-weight:normal;">{{ $capex->request_type }}</span></td>
        </tr>
        <tr>
            <td class="info-label">Asset Life <em>(If Procuring to Replace Existing Asset)</em></td>
            <td class="info-value">{{ $capex->asset_life }}</td>
        </tr>
        <tr>
            <td class="info-label">Department/Project/Cost Allocation</td>
            <td class="info-value">{{ $capex->cost_allocation ?? '-' }}</td>
        </tr>
        <tr>
            <td class="info-label">Insurance Status: <em>(If Procuring to Replace Existing Asset)</em></td>
            <td class="info-value">{{ $capex->insurance_status ? 'Yes' : 'No' }}</td>
        </tr>
        <tr>
            <td class="info-label">Reason for Asset Purchase</td>
            <td class="info-value">{{ $capex->reason_for_purchase ?? '-' }}</td>
        </tr>
    </table>

    {{-- ── QUOTATION SUMMARY SECTION ── --}}
    @if(!empty($capex->quotations))
    <table class="quot-table">
        <thead>
            <tr>
                <th style="width:40px;">#</th>
                <th>Quotation File</th>
                <th style="width:180px; text-align:center;">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($capex->quotations as $qi => $qPath)
            @php $isSelected = ($qi === 0); @endphp
            <tr class="{{ $isSelected ? 'quot-selected' : '' }}">
                <td style="text-align:center;">{{ $qi + 1 }}</td>
                <td>Quotation {{ $qi + 1 }}{{ $isSelected ? ' — Recommended (Lowest Quote)' : '' }}</td>
                <td style="text-align:center;">
                    @if($isSelected)
                        <span style="color:#15803d; font-weight:bold;">&#10003; SELECTED</span>
                    @else
                        <span style="color:#9ca3af;">Alternative Quote</span>
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @if($capex->total_amount)
    <table style="width:100%; border-collapse:collapse; margin-top:0;">
        <tr>
            <td colspan="2" style="border:1px solid #000; border-top:none; background:#1a3a8f; color:#fff; font-weight:bold; font-size:12px; padding:8px 12px; text-align:right;">
                TOTAL ORDER AMOUNT (RECOMMENDED QUOTATION): &nbsp;&nbsp;
                ${{ number_format($capex->total_amount, 2) }}
            </td>
        </tr>
    </table>
    @endif
    @endif

    {{-- ── AUTHORIZATION SECTION ── --}}
    @php
        // Build ordered approval list from the dynamic chain (or fall back to legacy fixed keys)
        $chainApprovals = $capex->approvals->sortBy('id')->values();
        $requester      = $capex->assetRequest->user;
        $chain          = $capex->approval_chain ?? [];

        if (empty($chain)) {
            // Legacy: map old fixed-position keys to labels
            $legacyMap = [
                'it_manager'         => 'IT Manager',
                'finance_operations' => 'Finance Operations',
                'it_head'            => 'IT Head of Technology',
                'finance_director'   => 'Finance Director',
            ];
            $chain = $capex->approvals->sortBy('id')->values()->map(function ($a) use ($legacyMap) {
                return ['label' => $legacyMap[$a->approval_position] ?? $a->approval_position];
            })->toArray();
        }
    @endphp

    <table class="auth-table">
        <tr>
            <td class="auth-section-hdr" style="width:210px;">REQUEST AUTHORIZATION &amp; APPROVALS</td>
            <td colspan="3" class="auth-official">FOR OFFICIAL USE ONLY</td>
        </tr>

        {{-- Requester row (always first) --}}
        <tr>
            <td class="auth-role">Request Raised</td>
            <td class="auth-sig"><span class="sig-approved">{{ $requester?->name ?? '—' }}</span></td>
            <td class="auth-date-lbl">Date Requested</td>
            <td class="auth-date-val">{{ $capex->assetRequest->created_at->format('F d, Y') }}</td>
        </tr>

        {{-- One row per chain stage --}}
        @foreach($chain as $i => $stage)
        @php
            $approval  = $chainApprovals[$i] ?? null;
            $status    = $approval ? $approval->status : 'pending';
            $sigName   = $approval?->approver_name;
            $sigDate   = ($approval && $approval->signed_at) ? $approval->signed_at->format('F d, Y') : null;
            $sigClass  = match($status) {
                'approved' => 'sig-approved',
                'declined' => 'sig-declined',
                default    => 'sig-pending',
            };
            $sigText   = match($status) {
                'approved' => $sigName ?? '—',
                'declined' => 'DECLINED',
                default    => '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
            };
            $dateLbl   = $i === 0 ? 'Date Authorised' : 'Date Approved';
        @endphp
        <tr>
            <td class="auth-role">{{ $stage['label'] }}</td>
            <td class="auth-sig"><span class="{{ $sigClass }}">{!! $sigText !!}</span></td>
            <td class="auth-date-lbl">{{ $dateLbl }}</td>
            <td class="auth-date-val">{!! $sigDate ? $sigDate : '&nbsp;' !!}</td>
        </tr>
        @endforeach
    </table>

    <div class="page-footer">
        {{ $capex->rtp_reference }} &nbsp;&mdash;&nbsp; Generated {{ now()->format('d M Y H:i') }} &nbsp;&mdash;&nbsp; {{ config('app.name') }}
    </div>

</div>
</body>
</html>
