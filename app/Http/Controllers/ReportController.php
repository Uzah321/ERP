<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    public function generate()
    {
        // Load relationships (department, category, location)
        $assets = Asset::with(['department', 'category', 'location'])->get();

        $pdf = Pdf::loadView('reports.assets', compact('assets'));

        // Log the download activity
        activity()
            ->causedBy(Auth::user())
            ->log('Downloaded the Master Asset PDF Report');

        return $pdf->download('Simbisa_Master_Asset_Report.pdf');
    }
}
