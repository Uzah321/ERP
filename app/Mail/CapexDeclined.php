<?php

namespace App\Mail;

use App\Models\CapexForm;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

use Illuminate\Contracts\Queue\ShouldQueue;

class CapexDeclined extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public CapexForm $capexForm;

    public function __construct(CapexForm $capexForm)
    {
        $this->capexForm = $capexForm->loadMissing(['assetRequest.user', 'assetRequest.department', 'approvals']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'CAPEX Declined — Ref: ' . $this->capexForm->rtp_reference,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.capex-declined',
            with: ['capexForm' => $this->capexForm],
        );
    }
}
