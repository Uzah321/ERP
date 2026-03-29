<?php

namespace App\Mail;

use App\Models\CapexForm;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

use Illuminate\Contracts\Queue\ShouldQueue;

class CapexFullyApproved extends Mailable implements ShouldQueue
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
            subject: 'CAPEX Approved — Ref: ' . $this->capexForm->rtp_reference . ' — You may now raise a Purchase Order',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.capex-fully-approved',
            with: ['capexForm' => $this->capexForm],
        );
    }
}
