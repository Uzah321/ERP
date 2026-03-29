<?php

namespace App\Mail;

use App\Models\AssetRequest;
use App\Models\Vendor;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use App\Services\AssetRequestPDFService;
use Illuminate\Queue\SerializesModels;

class VendorQuotationRequest extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $assetRequest;
    public $vendor;
    public $approver;

    public function __construct(AssetRequest $assetRequest, Vendor $vendor, User $approver = null)
    {
        $this->assetRequest = $assetRequest->loadMissing(['user', 'department', 'targetDepartment']);
        $this->vendor = $vendor;
        $this->approver = $approver ?? auth()->user();
    }

    public function envelope(): Envelope
    {
        $ref = 'SRQ-' . now()->format('Y') . '-' . str_pad($this->assetRequest->id, 4, '0', STR_PAD_LEFT);

        $envData = [
            'subject' => $ref . ' — Quotation Request: ' . $this->assetRequest->asset_type . ' (' . $this->assetRequest->asset_category . ')',
        ];

        if ($this->approver) {
            $envData['replyTo'] = [
                new Address($this->approver->email, $this->approver->name)
            ];
        }

        return new Envelope(...$envData);
    }

    public function content(): Content
    {
        $ref = 'SRQ-' . now()->format('Y') . '-' . str_pad($this->assetRequest->id, 4, '0', STR_PAD_LEFT);
        return new Content(
            view: 'mail.vendor-quotation',
            with: [
                'ref' => $ref,
                'approver' => $this->approver
            ],
        );
    }

    public function attachments(): array
    {
        // Generate PDF with asset request details
        $pdfData = [
            'request_id' => $this->assetRequest->id,
            'user_name' => $this->assetRequest->user?->name ?? '-',
            'department_name' => $this->assetRequest->department?->name ?? '-',
            'target_department_name' => $this->assetRequest->targetDepartment?->name ?? '-',
            'asset_category' => $this->assetRequest->asset_category,
            'asset_type' => $this->assetRequest->asset_type,
            'for_whom' => $this->assetRequest->for_whom,
            'position' => $this->assetRequest->position ?? '-',
            'requirements' => $this->assetRequest->requirements,
            'items' => $this->assetRequest->items ?? [],
            'created_at' => $this->assetRequest->created_at?->format('d M Y') ?? '-',
        ];
        $pdf = AssetRequestPDFService::generate($pdfData);
        $tmpPath = sys_get_temp_dir() . '/asset-request-' . uniqid() . '.pdf';
        file_put_contents($tmpPath, $pdf);
        return [
            Attachment::fromPath($tmpPath)
                ->as('AssetRequestDetails.pdf')
                ->withMime('application/pdf'),
        ];
    }
}

