<?php

namespace App\Mail;

use App\Models\CapexApproval;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

use Illuminate\Contracts\Queue\ShouldQueue;

class CapexApprovalRequest extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public CapexApproval $approval;

    public function __construct(CapexApproval $approval)
    {
        $this->approval = $approval->loadMissing([
            'capexForm.assetRequest.department',
            'capexForm.assetRequest.user',
            'capexForm.approvals',
        ]);
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

        // ── 1. CAPEX form PDF (shows all previous approvals, dates, signatures) ──
        $capex = $this->approval->capexForm;

        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $dompdf = new Dompdf($options);

        $logoPath   = public_path('images/simbisa-logo.png');
        $logoBase64 = file_exists($logoPath)
            ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath))
            : null;

        $html = view('pdf.capex-form', ['capex' => $capex, 'logoBase64' => $logoBase64])->render();
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $attachments[] = Attachment::fromData(
            fn () => $dompdf->output(),
            $capex->rtp_reference . '.pdf'
        )->withMime('application/pdf');

        // ── 2. Vendor quotations ──
        foreach ($capex->quotations ?? [] as $index => $path) {
            if (Storage::disk('local')->exists($path)) {
                $extension     = pathinfo($path, PATHINFO_EXTENSION);
                $label         = 'Quotation-' . ($index + 1) . '.' . $extension;
                $attachments[] = Attachment::fromStorageDisk('local', $path)->as($label);
            }
        }

        return $attachments;
    }
}

