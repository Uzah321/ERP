<x-mail::message>
# New Asset Request

A new asset request has been submitted and assigned to your department for processing.

**Requested By:** {{ $assetRequest->user->name }} ({{ $assetRequest->department->name }})  
**Asset Category Needed:** {{ $assetRequest->asset_category }}  

**Specific Requirements:**  
{{ $assetRequest->requirements }}


<x-mail::button :url="route('asset-requests.approve', $assetRequest->id)">
Approve Request
</x-mail::button>

<x-mail::button :url="route('asset-requests.decline', $assetRequest->id)" color="red">
Decline Request
</x-mail::button>

Thanks,<br>
{{ config('app.name') }} Automated System
</x-mail::message>
