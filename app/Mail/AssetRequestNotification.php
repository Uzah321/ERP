<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\AssetRequest;

class AssetRequestNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $assetRequest;

    public function __construct(AssetRequest $assetRequest)
    {
        $this->assetRequest = $assetRequest;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Asset Request Required',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.asset.requested',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
