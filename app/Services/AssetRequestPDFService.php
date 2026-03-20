<?php

namespace App\Services;

use Dompdf\Dompdf;
use Dompdf\Options;

class AssetRequestPDFService
{
    public static function generate(array $data)
    {
        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $dompdf = new Dompdf($options);

        // Use the PDF template as a background image
        $templatePath = base_path('app/SRQ-2026-10.pdf');
        // DomPDF does not natively support PDF backgrounds, so we use HTML/CSS
        // If you want to use the template as a background, convert it to an image (PNG/JPG)
        // For now, we'll use HTML overlay

        $html = view('pdf.asset-request', $data)->render();
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return $dompdf->output();
    }
}
