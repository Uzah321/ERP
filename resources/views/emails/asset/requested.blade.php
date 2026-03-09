<x-mail::message>
# New Asset Request

A new asset request has been submitted and assigned to your department for processing.

**Requested By:** {{ $assetRequest->user->name }} ({{ $assetRequest->department->name }})  
**Asset Category Needed:** {{ $assetRequest->asset_category }}  

**Specific Requirements:**  
{{ $assetRequest->requirements }}

<x-mail::button :url="route('dashboard')">
Review Request in Dashboard
</x-mail::button>

Thanks,<br>
{{ config('app.name') }} Automated System
</x-mail::message>
