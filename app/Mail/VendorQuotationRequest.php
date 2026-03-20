<?php

namespace App\Mail;

use App\Models\AssetRequest;
use App\Models\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use App\Services\AssetRequestPDFService;
use Illuminate\Queue\SerializesModels;

class VendorQuotationRequest extends Mailable
{
    use Queueable, SerializesModels;

    public $assetRequest;
    public $vendor;

    public function __construct(AssetRequest $assetRequest, Vendor $vendor)
    {
        $this->assetRequest = $assetRequest;
        $this->vendor = $vendor;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Quotation Request for ' . $this->assetRequest->asset_category,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.vendor-quotation',
        );
    }

    public function attachments(): array
    {
        // Generate PDF with asset request details
        $pdfData = [
            'user_name' => $this->assetRequest->user?->name ?? '-',
            'department_name' => $this->assetRequest->department?->name ?? '-',
            'target_department_name' => $this->assetRequest->targetDepartment?->name ?? '-',
            'asset_category' => $this->assetRequest->asset_category,
            'asset_type' => $this->assetRequest->asset_type,
            'for_whom' => $this->assetRequest->for_whom,
            'position' => $this->assetRequest->position ?? '-',
            'requirements' => $this->assetRequest->requirements,
            'created_at' => $this->assetRequest->created_at?->format('Y-m-d') ?? '-',
        ];
        $pdf = AssetRequestPDFService::generate($pdfData);
        $tmpPath = sys_get_temp_dir() . '/asset-request-' . uniqid() . '.pdf';
        file_put_contents($tmpPath, $pdf);
        return [
            [
                'path' => $tmpPath,
                'as' => 'AssetRequestDetails.pdf',
                'mime' => 'application/pdf',
            ]
        ];
    }
}

