<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        font-family: Arial, sans-serif;
        width: 80mm;
        padding: 6mm;
        background: #fff;
    }
    .label-container {
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 5mm;
        text-align: center;
    }
    .company {
        font-size: 8pt;
        font-weight: bold;
        color: #1e3a5f;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 3mm;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 2mm;
    }
    .qr-img {
        width: 45mm;
        height: 45mm;
        margin: 2mm auto;
        display: block;
    }
    .asset-name {
        font-size: 10pt;
        font-weight: bold;
        color: #111;
        margin: 3mm 0 1mm;
    }
    .barcode-text {
        font-size: 8pt;
        font-family: 'Courier New', monospace;
        color: #374151;
        background: #f3f4f6;
        padding: 1mm 3mm;
        border-radius: 3px;
        display: inline-block;
        margin: 1mm 0;
    }
    .info-row {
        font-size: 7.5pt;
        color: #6b7280;
        margin: 1mm 0;
    }
    .info-label {
        font-weight: bold;
        color: #374151;
    }
    .footer {
        font-size: 6.5pt;
        color: #9ca3af;
        margin-top: 3mm;
        border-top: 1px solid #e5e7eb;
        padding-top: 2mm;
    }
</style>
</head>
<body>
<div class="label-container">
    <div class="company">Simbisa Brands — Asset Label</div>

    <img class="qr-img" src="data:image/png;base64,{{ $qrBase64 }}" alt="QR Code" />

    <div class="asset-name">{{ $asset->name }}</div>
    <div class="barcode-text">{{ $asset->barcode ?? 'ASSET-'.$asset->id }}</div>

    @if($asset->serial_number)
    <div class="info-row"><span class="info-label">S/N:</span> {{ $asset->serial_number }}</div>
    @endif

    @if($asset->category)
    <div class="info-row"><span class="info-label">Category:</span> {{ $asset->category->name }}</div>
    @endif

    @if($asset->department)
    <div class="info-row"><span class="info-label">Dept:</span> {{ $asset->department->name }}</div>
    @endif

    @if($asset->location)
    <div class="info-row"><span class="info-label">Location:</span> {{ $asset->location->name }}</div>
    @endif

    @if($asset->warranty_expiry_date)
    <div class="info-row"><span class="info-label">Warranty:</span> {{ $asset->warranty_expiry_date->format('d M Y') }}</div>
    @endif

    <div class="footer">Printed: {{ now()->format('d M Y') }} · ID: {{ $asset->id }}</div>
</div>
</body>
</html>
