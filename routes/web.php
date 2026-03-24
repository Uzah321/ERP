
<?php

// Department management (non-admin, for demo)
Route::middleware('auth')->group(function () {
    Route::get('/departments', [App\Http\Controllers\DepartmentController::class, 'index'])->name('departments.index');
    Route::post('/departments', [App\Http\Controllers\DepartmentController::class, 'store'])->name('departments.store');
    Route::put('/departments/{department}', [App\Http\Controllers\DepartmentController::class, 'update'])->name('departments.update');
    Route::delete('/departments/{department}', [App\Http\Controllers\DepartmentController::class, 'destroy'])->name('departments.destroy');
});

// 2FA routes (auth required, but exempt from 2FA challenge middleware)
Route::middleware('auth')->group(function () {
    Route::get('/two-factor/setup', [App\Http\Controllers\TwoFactorController::class, 'setup'])->name('two-factor.setup');
    Route::post('/two-factor/enable', [App\Http\Controllers\TwoFactorController::class, 'enable'])->name('two-factor.enable');
    Route::post('/two-factor/disable', [App\Http\Controllers\TwoFactorController::class, 'disable'])->name('two-factor.disable');
    Route::get('/two-factor/challenge', [App\Http\Controllers\TwoFactorController::class, 'challenge'])->name('two-factor.challenge');
    Route::post('/two-factor/verify', [App\Http\Controllers\TwoFactorController::class, 'verify'])->name('two-factor.verify');
});

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TransferRequestController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\AssetLifecycleController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AssetRequestController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\DecommissionLogController;
use App\Http\Controllers\DisposalController;
use App\Http\Controllers\ArchiveController;
use App\Http\Controllers\DepartmentRollupController;
use App\Http\Controllers\SyncController;
use App\Http\Controllers\AssetAllocationController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\PositionSpecificationController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\CapexController;
use App\Http\Controllers\GoodsReceiptController;
use App\Http\Controllers\InvoiceController;

// CAPEX approval links — no auth required (token-based, approver enters password on the page)
Route::get('/capex/approve/{token}', [CapexController::class, 'showApprove'])->name('capex.approve.show');
Route::post('/capex/approve/{token}', [CapexController::class, 'processApprove'])->name('capex.approve.process');

// Asset request approval/decline links for IT admin
Route::middleware('auth')->group(function () {
    Route::get('/asset-requests/{assetRequest}/approve', [App\Http\Controllers\AssetRequestController::class, 'approveViaEmail'])->name('asset-requests.approve');
    Route::get('/asset-requests/{assetRequest}/decline', [App\Http\Controllers\AssetRequestController::class, 'declineViaEmail'])->name('asset-requests.decline');
});

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function (\Illuminate\Http\Request $request) {
    return app(\App\Http\Controllers\AssetController::class)->index($request);
})->middleware(['auth', 'verified', 'two-factor'])->name('dashboard');

Route::post('/assets', [AssetController::class, 'store'])->middleware(['auth', 'verified', 'two-factor'])->name('assets.store');
Route::put('/assets/{asset}', [AssetController::class, 'update'])->middleware(['auth', 'verified', 'two-factor'])->name('assets.update');

Route::middleware(['auth', 'two-factor'])->group(function () {
    Route::post('/asset-requests', [AssetRequestController::class, 'store'])->name('asset-requests.store');

    // Fetch position specs for the asset request modal (all authenticated users)
    Route::get('/api/position-specifications', [PositionSpecificationController::class, 'all'])->name('position-specs.all');

    // Admin-only routes
    Route::middleware('admin')->group(function () {
        Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

        // Admin: User Management
        Route::get('/admin/users', [UserManagementController::class, 'index'])->name('admin.users.index');
        Route::post('/admin/users', [UserManagementController::class, 'store'])->name('admin.users.store');
        Route::put('/admin/users/{user}', [UserManagementController::class, 'update'])->name('admin.users.update');
        Route::delete('/admin/users/{user}', [UserManagementController::class, 'destroy'])->name('admin.users.destroy');
        Route::patch('/admin/users/{user}/toggle', [UserManagementController::class, 'toggleActive'])->name('admin.users.toggle');

        // Admin: Department Management
        Route::get('/admin/departments', [DepartmentController::class, 'index'])->name('admin.departments.index');
        Route::post('/admin/departments', [DepartmentController::class, 'store'])->name('admin.departments.store');
        Route::put('/admin/departments/{department}', [DepartmentController::class, 'update'])->name('admin.departments.update');
        Route::delete('/admin/departments/{department}', [DepartmentController::class, 'destroy'])->name('admin.departments.destroy');

        // Admin: Vendor Management
        Route::get('/admin/vendors', [VendorController::class, 'index'])->name('admin.vendors.index');
        Route::post('/admin/vendors', [VendorController::class, 'store'])->name('admin.vendors.store');
        Route::put('/admin/vendors/{vendor}', [VendorController::class, 'update'])->name('admin.vendors.update');
        Route::delete('/admin/vendors/{vendor}', [VendorController::class, 'destroy'])->name('admin.vendors.destroy');

        // Admin: Asset Requests Review
        Route::get('/asset-requests', [AssetRequestController::class, 'index'])->name('asset-requests.index');
        Route::get('/asset-requests/export/csv', [AssetRequestController::class, 'exportCsv'])->name('asset-requests.export.csv');
        Route::patch('/asset-requests/{assetRequest}', [AssetRequestController::class, 'update'])->name('asset-requests.update');

        // Admin: Asset Allocations
        Route::get('/admin/allocations', [AssetAllocationController::class, 'index'])->name('admin.allocations.index');
        Route::post('/admin/allocations', [AssetAllocationController::class, 'store'])->name('admin.allocations.store');
        Route::patch('/admin/allocations/{allocation}/return', [AssetAllocationController::class, 'returnAsset'])->name('admin.allocations.return');

        // IT Admin: View asset requests from other departments
        Route::get('/admin/it-asset-requests', [AssetRequestController::class, 'itRequests'])->name('admin.it-asset-requests');

        // Admin: CAPEX Forms
        Route::get('/admin/capex', [CapexController::class, 'index'])->name('admin.capex.index');
        Route::post('/admin/capex', [CapexController::class, 'store'])->name('capex.store');
        Route::get('/admin/capex/{capexForm}/pdf', [CapexController::class, 'downloadPdf'])->name('capex.pdf');

        // Admin: Budget vs Actual Tracking
        Route::get('/admin/budget-tracking', [\App\Http\Controllers\BudgetTrackingController::class, 'index'])->name('admin.budget-tracking');

        // Admin: Purchase Orders
        Route::get('/admin/purchase-orders', [\App\Http\Controllers\PurchaseOrderController::class, 'index'])->name('purchase-orders.index');
        Route::post('/admin/purchase-orders', [\App\Http\Controllers\PurchaseOrderController::class, 'store'])->name('purchase-orders.store');
        Route::get('/admin/purchase-orders/{purchaseOrder}/pdf', [\App\Http\Controllers\PurchaseOrderController::class, 'downloadPdf'])->name('purchase-orders.pdf');

        // Admin: Goods Receipts
        Route::get('/admin/goods-receipts', [GoodsReceiptController::class, 'index'])->name('goods-receipts.index');
        Route::post('/admin/goods-receipts', [GoodsReceiptController::class, 'store'])->name('goods-receipts.store');

        // Admin: Invoices & Payments
        Route::get('/admin/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
        Route::post('/admin/invoices', [InvoiceController::class, 'store'])->name('invoices.store');
        Route::patch('/admin/invoices/{invoice}/mark-paid', [InvoiceController::class, 'markPaid'])->name('invoices.mark-paid');

        // Admin: Position Specifications Management
        Route::get('/admin/position-specifications', [PositionSpecificationController::class, 'index'])->name('admin.position-specs.index');
        Route::post('/admin/position-specifications', [PositionSpecificationController::class, 'store'])->name('admin.position-specs.store');
        Route::put('/admin/position-specifications/{positionSpecification}', [PositionSpecificationController::class, 'update'])->name('admin.position-specs.update');
        Route::delete('/admin/position-specifications/{positionSpecification}', [PositionSpecificationController::class, 'destroy'])->name('admin.position-specs.destroy');
    });

    Route::get('/transfers', [TransferRequestController::class, 'index'])->name('transfers.index');
    Route::post('/assets/{asset}/transfer', [TransferRequestController::class, 'store'])->name('transfers.store');
    Route::post('/assets/bulk-transfer', [TransferRequestController::class, 'bulkTransfer'])->name('assets.bulkTransfer');
    Route::patch('/transfers/{transferRequest}', [TransferRequestController::class, 'update'])->name('transfers.update');

    Route::get('/maintenance', [MaintenanceController::class, 'index'])->name('maintenance.index');
    Route::get('/maintenance/{asset}', [MaintenanceController::class, 'show'])->name('maintenance.show');
    Route::post('/assets/{asset}/maintenance', [MaintenanceController::class, 'store'])->name('maintenance.store');
    Route::patch('/assets/{asset}/maintenance', [MaintenanceController::class, 'update'])->name('maintenance.update');

    Route::get('/audit', [AuditController::class, 'index'])->name('audit.index');
    Route::post('/audit', [AuditController::class, 'store'])->name('audit.store');

    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/assets', [ReportController::class, 'generate'])->name('reports.assets');
    Route::get('/reports/assets/csv', [ReportController::class, 'exportCsv'])->name('reports.assets.csv');
    Route::get('/reports/maintenance', [ReportController::class, 'maintenance'])->name('reports.maintenance');
    Route::get('/reports/depreciation/csv', [ReportController::class, 'depreciationCsv'])->name('reports.depreciation.csv');
    Route::get('/reports/po-history/csv', [ReportController::class, 'poHistoryCsv'])->name('reports.po-history.csv');
    Route::get('/reports/vendor-spend/csv', [ReportController::class, 'vendorSpendCsv'])->name('reports.vendor-spend.csv');
    Route::get('/reports/sage-export/csv', [ReportController::class, 'sageExportCsv'])->name('reports.sage-export.csv');

    // Software Licence Tracking
    Route::get('/admin/software-licences', [\App\Http\Controllers\SoftwareLicenceController::class, 'index'])->name('admin.software-licences.index');
    Route::post('/admin/software-licences', [\App\Http\Controllers\SoftwareLicenceController::class, 'store'])->name('admin.software-licences.store');
    Route::put('/admin/software-licences/{softwareLicence}', [\App\Http\Controllers\SoftwareLicenceController::class, 'update'])->name('admin.software-licences.update');
    Route::delete('/admin/software-licences/{softwareLicence}', [\App\Http\Controllers\SoftwareLicenceController::class, 'destroy'])->name('admin.software-licences.destroy');

    Route::post('/assets/{asset}/decommission', [AssetLifecycleController::class, 'decommission'])->name('assets.decommission');
    Route::post('/assets/{asset}/dispose', [AssetLifecycleController::class, 'dispose'])->name('assets.dispose');
    Route::post('/assets/{asset}/archive', [AssetLifecycleController::class, 'archive'])->name('assets.archive');
    Route::get('/assets/{asset}/qr-label', [AssetController::class, 'qrLabel'])->name('assets.qr-label');
    
    Route::get('/decommission-log', [DecommissionLogController::class, 'index'])->name('decommission.log');
    Route::get('/disposal-log', [DisposalController::class, 'index'])->name('disposal.log');
    Route::get('/archive', [ArchiveController::class, 'index'])->name('archive.utilities');
    Route::post('/archive/{id}/restore', [ArchiveController::class, 'restore'])->name('archive.restore');
    
    Route::get('/activity-log', [ActivityLogController::class, 'index'])->name('activity-log.index');
    Route::get('/activity-log/asset/{asset}', [ActivityLogController::class, 'forAsset'])->name('activity-log.asset');
    Route::get('/department-rollup', [DepartmentRollupController::class, 'index'])->name('department.rollup');
    Route::post('/system/sync', [SyncController::class, 'sync'])->name('system.sync');
    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';





