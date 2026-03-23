<?php

namespace App\Mail;

use App\Models\CapexApproval;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class CapexApprovalRequest extends Mailable
{
    use Queueable, SerializesModels;

    public CapexApproval $approval;

    public function __construct(CapexApproval $approval)
    {
        $this->approval = $approval->loadMissing(['capexForm.assetRequest.department', 'capexForm.assetRequest.user']);
    }

    public function envelope(): Envelope
    {
        $ref = $this->approval->capexForm->rtp_reference;
        $label = $this->approval->positionLabel();
        return new Envelope(
            subject: "CAPEX Approval Required [{$label}] — Ref: {$ref}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.capex-approval-request',
            with: ['approval' => $this->approval],
        );
    }

    public function attachments(): array
    {
        $attachments = [];
        $quotations = $this->approval->capexForm->quotations ?? [];

        foreach ($quotations as $index => $path) {
            if (Storage::disk('local')->exists($path)) {
                $extension  = pathinfo($path, PATHINFO_EXTENSION);
                $label      = 'Quotation-' . ($index + 1) . '.' . $extension;
                $attachments[] = Attachment::fromStorageDisk('local', $path)->as($label);
            }
        }

        return $attachments;
    }
}
