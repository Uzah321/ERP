<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>AssetLinq ERP - Asset Report</title>
    <style>
        body { font-family: Helvetica, Arial, sans-serif; font-size: 12px; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ed1b24; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: bold; color: #ed1b24; }
        .subtitle { color: #555; font-size: 14px; margin-top: 5px; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f8f9fa; color: #333; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        
        .status-active { color: #15803d; font-weight: bold; }
        .status-maintenance { color: #b45309; font-weight: bold; }
        .status-disposed { color: #b91c1c; font-weight: bold; }
        .status-archived { color: #6b7280; font-weight: bold; }
        
        .footer { position: fixed; bottom: -20px; left: 0; right: 0; text-align: center; font-size: 10px; color: #888; border-top: 1px solid #ddd; padding-top: 10px; }
        .page-break { page-break-after: always; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">ASSETLINQ ERP</div>
        <div class="subtitle">MASTER ASSET REGISTRY REPORT</div>
        <div class="subtitle">Generated: {{ \Carbon\Carbon::now()->format('Y-m-d H:i') }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Barcode</th>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Department</th>
                <th>Location</th>
                <th>Status</th>
                <th>Cost</th>
            </tr>
        </thead>
        <tbody>
            @foreach($assets as $asset)
            <tr>
                <td style="font-family: monospace;">{{ $asset->barcode }}</td>
                <td>{{ $asset->name }}</td>
                <td>{{ $asset->category ? $asset->category->name : 'N/A' }}</td>
                <td>{{ $asset->department ? $asset->department->name : 'N/A' }}</td>
                <td>{{ $asset->location ? $asset->location->name : 'N/A' }}</td>
                <td>
                    <span class="
                        @if($asset->status == 'Active') status-active
                        @elseif($asset->status == 'Under Maintenance') status-maintenance
                        @elseif($asset->status == 'Disposed' || $asset->status == 'Decommissioned') status-disposed
                        @else status-archived @endif
                    ">
                        {{ $asset->status }}
                    </span>
                </td>
                <td>{{ $asset->purchase_cost ? '$'.number_format($asset->purchase_cost, 2) : 'N/A' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    
    <div class="footer">
        Confidential & Proprietary. Internal AssetLinq ERP operations only.
    </div>
</body>
</html>
