<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\MaintenanceRecord;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render('Reports/Index');
    }

    public function generate(Request $request)
    {
        $query = Asset::with(['department', 'category', 'location']);

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('date_from')) {
            $query->where('purchase_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->where('purchase_date', '<=', $request->date_to);
        }

        $assets = $query->get();

        $pdf = Pdf::loadView('reports.assets', compact('assets'));

        activity()
            ->causedBy(Auth::user())
            ->log('Downloaded the Master Asset PDF Report');

        return $pdf->download('AssetLinq_Master_Asset_Report.pdf');
    }

    public function exportCsv(Request $request)
    {
        $query = Asset::with(['department', 'category', 'location']);

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('date_from')) {
            $query->where('purchase_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->where('purchase_date', '<=', $request->date_to);
        }

        $assets = $query->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="AssetLinq_Asset_Report.csv"',
        ];

        $callback = function () use ($assets) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Name', 'Barcode', 'Serial Number', 'Department', 'Category', 'Location', 'Status', 'Condition', 'Purchase Cost', 'Purchase Date']);

            foreach ($assets as $asset) {
                fputcsv($file, [
                    $asset->name,
                    $asset->barcode,
                    $asset->serial_number,
                    $asset->department?->name,
                    $asset->category?->name,
                    $asset->location?->name,
                    $asset->status,
                    $asset->condition,
                    $asset->purchase_cost,
                    $asset->purchase_date,
                ]);
            }

            fclose($file);
        };

        activity()
            ->causedBy(Auth::user())
            ->log('Downloaded the Master Asset CSV Report');

        return response()->stream($callback, 200, $headers);
    }

    public function maintenance(Request $request)
    {
        $query = MaintenanceRecord::with(['asset', 'user']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('maintenance_type')) {
            $query->where('maintenance_type', $request->maintenance_type);
        }

        $records = $query->latest()->get();

        $totalCost = $records->sum('cost');
        $avgCost = $records->where('cost', '>', 0)->avg('cost');
        $mostRepaired = MaintenanceRecord::selectRaw('asset_id, count(*) as cnt')
            ->groupBy('asset_id')
            ->orderByDesc('cnt')
            ->limit(5)
            ->with('asset')
            ->get();

        return Inertia::render('Reports/Maintenance', [
            'records' => $records,
            'totalCost' => round($totalCost, 2),
            'avgCost' => round($avgCost ?? 0, 2),
            'mostRepaired' => $mostRepaired,
        ]);
    }
}
