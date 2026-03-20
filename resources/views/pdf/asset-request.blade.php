<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            margin: 0;
            padding: 0;
        }
        .container {
            padding: 40px;
        }
        .header {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .section {
            margin-bottom: 16px;
        }
        .label {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Asset Request Details</div>
        <div class="section"><span class="label">Requested By:</span> {{ $user_name ?? '-' }}</div>
        <div class="section"><span class="label">Department:</span> {{ $department_name ?? '-' }}</div>
        <div class="section"><span class="label">Target Department:</span> {{ $target_department_name ?? '-' }}</div>
        <div class="section"><span class="label">Asset Category:</span> {{ $asset_category ?? '-' }}</div>
        <div class="section"><span class="label">Asset Type:</span> {{ $asset_type ?? '-' }}</div>
        <div class="section"><span class="label">For Whom:</span> {{ $for_whom ?? '-' }}</div>
        <div class="section"><span class="label">Position:</span> {{ $position ?? '-' }}</div>
        <div class="section"><span class="label">Requirements:</span> {{ $requirements ?? '-' }}</div>
        <div class="section"><span class="label">Date:</span> {{ $created_at ?? '-' }}</div>
    </div>
</body>
</html>
