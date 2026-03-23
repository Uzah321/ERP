<?php

namespace App\Mail;

use App\Models\PurchaseOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PurchaseOrderCreated extends Mailable
{
    use Queueable, SerializesModels;

    public PurchaseOrder $po;

    public function __construct(PurchaseOrder $po)
    {
        $this->po = $po->loadMissing([
            'capexForm.assetRequest.user',
            'capexForm.assetRequest.department',
        ]);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Purchase Order #' . $this->po->po_number . ' Created — Ref: ' . $this->po->capexForm->rtp_reference,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.purchase-order-created',
            with: ['po' => $this->po],
        );
    }
}
