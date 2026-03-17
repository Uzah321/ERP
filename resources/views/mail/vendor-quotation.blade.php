<div>
    <h1>Quotation Request</h1>
    <p>Dear {{ $vendor->name }},</p>
    <p>We are looking to request a quotation for items in the <strong>{{ $assetRequest->asset_category }}</strong> category.</p>
    <p><strong>Requirements:</strong><br>
    {{ $assetRequest->requirements }}</p>
    <p>Please reply to this email with your proposed quotation or reach out for more details.</p>
    <br>
    <p>Thank you,</p>
    <p>{{ config('app.name') }}</p>
</div>
