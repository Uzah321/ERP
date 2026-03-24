<?php

namespace App\Mail;

use App\Models\PurchaseOrder;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PurchaseOrderVendorNotification extends Mailable
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
            subject: 'Purchase Order #' . $this->po->po_number . ' — Payment Being Processed',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.purchase-order-vendor',
            with: ['po' => $this->po],
        );
    }

    public function attachments(): array
    {
        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $dompdf = new Dompdf($options);

        $logoPath   = public_path('images/simbisa-logo.png');
        $logoBase64 = file_exists($logoPath)
            ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath))
            : null;

        $html = view('pdf.purchase-order', ['po' => $this->po, 'logoBase64' => $logoBase64])->render();
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        $output = $dompdf->output();

        return [
            Attachment::fromData(fn () => $output, 'PO-' . $this->po->po_number . '.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
