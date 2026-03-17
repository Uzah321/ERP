<?php

namespace App\Mail;

use App\Models\AssetRequest;
use App\Models\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
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
        return [];
    }
}

