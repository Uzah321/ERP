<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Invoice;
use App\Models\MaintenanceRecord;
use App\Models\PurchaseOrder;
use App\Support\ProcurementOverviewService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(ProcurementOverviewService $procurementOverviewService)
    {
        return Inertia::render('Reports/Index', [
            'procurement_metrics' => $procurementOverviewService->metrics(),
            'recent_procurement_orders' => $procurementOverviewService->recentOrders(6),
            'procurement_last_updated_at' => now()->toDateTimeString(),
        ]);
    }

    public function generate(Request $request)
    {
        $query = Asset::with($this->assetRelations());

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
        $query = Asset::with($this->assetRelations());

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
                    $asset->location_label,
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

    private function assetRelations(): array
    {
        $relations = ['department', 'category', 'location'];

        if (Schema::hasColumns('locations', ['type', 'parent_id'])
            && Schema::hasColumns('assets', ['complex_id', 'store_id'])) {
            $relations[] = 'complex';
            $relations[] = 'store';
        }

        return $relations;
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

    public function depreciationCsv()
    {
        $assets = Asset::with(['department', 'category'])
            ->whereNotNull('purchase_cost')
            ->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="Depreciation_Schedule.csv"',
        ];

        $callback = function () use ($assets) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Barcode', 'Name', 'Category', 'Department', 'Purchase Date', 'Purchase Cost', 'Method', 'Rate (%)', 'Life (yrs)', 'Salvage Value', 'Current Book Value', 'Annual Depreciation']);

            foreach ($assets as $asset) {
                $life = (float) ($asset->asset_life_years ?: 5);
                $cost = (float) ($asset->purchase_cost ?: 0);
                $salvage = (float) ($asset->salvage_value ?: 0);
                $rate = (float) ($asset->annual_depreciation_rate ?: 25);
                $annualDep = $rate > 0 ? round($cost * ($rate / 100), 2) : ($life > 0 ? round(($cost - $salvage) / $life, 2) : 0);

                fputcsv($file, [
                    $asset->barcode,
                    $asset->name,
                    $asset->category?->name,
                    $asset->department?->name,
                    $asset->purchase_date?->format('Y-m-d'),
                    number_format($cost, 2),
                    $asset->depreciation_method,
                    number_format($rate, 2),
                    $life,
                    number_format($salvage, 2),
                    number_format($asset->book_value ?? $cost, 2),
                    number_format($annualDep, 2),
                ]);
            }

            fclose($file);
        };

        activity()->causedBy(Auth::user())->log('Downloaded Depreciation Schedule CSV');

        return response()->stream($callback, 200, $headers);
    }

    public function poHistoryCsv()
    {
        $pos = PurchaseOrder::with('capexForm')->orderByDesc('created_at')->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="PO_History.csv"',
        ];

        $callback = function () use ($pos) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['PO Number', 'Vendor', 'CAPEX Ref', 'Total Amount', 'VAT', 'Delivery Status', 'Invoice Status', 'Created Date']);

            foreach ($pos as $po) {
                fputcsv($file, [
                    $po->po_number,
                    $po->vendor_name,
                    $po->capexForm?->rtp_reference ?? '',
                    number_format((float) $po->total_amount, 2),
                    number_format((float) $po->vat_amount, 2),
                    $po->delivery_status,
                    $po->invoice_status,
                    $po->created_at?->format('Y-m-d'),
                ]);
            }

            fclose($file);
        };

        activity()->causedBy(Auth::user())->log('Downloaded PO History CSV');

        return response()->stream($callback, 200, $headers);
    }

    public function vendorSpendCsv()
    {
        $pos = PurchaseOrder::orderByDesc('created_at')->get();
        $grouped = $pos->groupBy('vendor_name')->map(fn ($g) => [
            'vendor'    => $g->first()->vendor_name,
            'po_count'  => $g->count(),
            'total_net' => $g->sum(fn ($p) => (float) $p->total_amount - (float) $p->vat_amount),
            'total_vat' => $g->sum(fn ($p) => (float) $p->vat_amount),
            'total_inc' => $g->sum(fn ($p) => (float) $p->total_amount),
        ])->sortByDesc('total_inc')->values();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="Vendor_Spend.csv"',
        ];

        $callback = function () use ($grouped) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Vendor', 'PO Count', 'Total Net (USD)', 'Total VAT (USD)', 'Total Incl. VAT (USD)']);

            foreach ($grouped as $row) {
                fputcsv($file, [
                    $row['vendor'],
                    $row['po_count'],
                    number_format($row['total_net'], 2),
                    number_format($row['total_vat'], 2),
                    number_format($row['total_inc'], 2),
                ]);
            }

            fclose($file);
        };

        activity()->causedBy(Auth::user())->log('Downloaded Vendor Spend CSV');

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Sage-compatible CSV export (paid invoices).
     * Columns: Type, Reference, Date, AccountCode, Description, NetAmount, VATCode, VATAmount, TotalAmount
     */
    public function sageExportCsv(Request $request)
    {
        $invoices = Invoice::with(['purchaseOrder'])
            ->where('status', 'paid')
            ->when($request->filled('date_from'), fn ($q) => $q->whereDate('paid_at', '>=', $request->date_from))
            ->when($request->filled('date_to'),   fn ($q) => $q->whereDate('paid_at', '<=', $request->date_to))
            ->orderBy('paid_at')
            ->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="Sage_Export.csv"',
        ];

        $callback = function () use ($invoices) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Type', 'Reference', 'Date', 'AccountCode', 'Description', 'NetAmount', 'VATCode', 'VATAmount', 'TotalAmount']);

            foreach ($invoices as $inv) {
                fputcsv($file, [
                    'PI',                          // Purchase Invoice
                    $inv->invoice_number,
                    $inv->paid_at?->format('d/m/Y'),
                    'PURCHASES',                   // Chart-of-accounts code – customise per Sage setup
                    'PO #' . ($inv->purchaseOrder?->po_number ?? '') . ' — ' . ($inv->purchaseOrder?->vendor_name ?? ''),
                    number_format((float) $inv->amount, 2),
                    'T1',                          // Standard VAT code
                    number_format((float) $inv->vat_amount, 2),
                    number_format((float) $inv->amount + (float) $inv->vat_amount, 2),
                ]);
            }

            fclose($file);
        };

        activity()->causedBy(Auth::user())->log('Downloaded Sage Accounting Export CSV');

        return response()->stream($callback, 200, $headers);
    }
}
