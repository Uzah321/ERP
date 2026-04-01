<?php

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
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\PositionSpecificationController;
use App\Http\Controllers\CapexController;
use App\Http\Controllers\GoodsReceiptController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExecutiveDashboardController;
use App\Http\Controllers\ProcurementDashboardController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\StoreManagementController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ── Public CAPEX approval links (token-based, approver enters password on the page) ──
Route::get('/capex/approve/{token}', [CapexController::class, 'showApprove'])->name('capex.approve.show');
Route::post('/capex/approve/{token}', [CapexController::class, 'processApprove'])
    ->middleware('throttle:5,1')
    ->name('capex.approve.process');

// ── 2FA routes (auth required, exempt from 2FA challenge middleware) ──
Route::middleware('auth')->group(function () {
    Route::get('/two-factor/setup', [App\Http\Controllers\TwoFactorController::class, 'setup'])->name('two-factor.setup');
    Route::post('/two-factor/enable', [App\Http\Controllers\TwoFactorController::class, 'enable'])->name('two-factor.enable');
    Route::post('/two-factor/disable', [App\Http\Controllers\TwoFactorController::class, 'disable'])->name('two-factor.disable');
    Route::get('/two-factor/challenge', [App\Http\Controllers\TwoFactorController::class, 'challenge'])->name('two-factor.challenge');
    Route::post('/two-factor/verify', [App\Http\Controllers\TwoFactorController::class, 'verify'])
        ->middleware('throttle:5,1')
        ->name('two-factor.verify');
});

// ── Asset request approval links (privileged access, email link clicks) ──
Route::middleware(['auth', 'role:admin,executive'])->group(function () {
    Route::get('/asset-requests/{assetRequest}/approve', [AssetRequestController::class, 'approveViaEmail'])->name('asset-requests.approve');
    Route::get('/asset-requests/{assetRequest}/decline', [AssetRequestController::class, 'declineViaEmail'])->name('asset-requests.decline');
});

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified', 'two-factor'])->name('dashboard');
Route::get('/asset-management', [AssetController::class, 'index'])->middleware(['auth', 'verified', 'two-factor'])->name('asset-management.index');

Route::post('/assets', [AssetController::class, 'store'])->middleware(['auth', 'verified', 'two-factor', 'role:admin,executive'])->name('assets.store');
Route::put('/assets/{asset}', [AssetController::class, 'update'])->middleware(['auth', 'verified', 'two-factor', 'role:admin,executive'])->name('assets.update');

Route::middleware(['auth', 'two-factor'])->group(function () {
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::get('/operations/store-management', [StoreManagementController::class, 'index'])->name('store-management.index');
    Route::get('/operations/store-management/complexes/{complex}/stores', [StoreManagementController::class, 'stores'])->name('store-management.stores');
    Route::get('/operations/store-management/stores/{store}/assets', [StoreManagementController::class, 'assets'])->name('store-management.assets');
    Route::post('/asset-requests', [AssetRequestController::class, 'store'])->name('asset-requests.store');

    Route::middleware('role:executive')->group(function () {
        Route::get('/executive/dashboard', [ExecutiveDashboardController::class, 'index'])->name('executive.dashboard');
        Route::get('/executive/users', [UserManagementController::class, 'index'])->name('users.index');
        Route::post('/executive/users', [UserManagementController::class, 'store'])->name('users.store');
        Route::put('/executive/users/{user}', [UserManagementController::class, 'update'])->name('users.update');
        Route::delete('/executive/users/{user}', [UserManagementController::class, 'destroy'])->name('users.destroy');
        Route::patch('/executive/users/{user}/toggle', [UserManagementController::class, 'toggleActive'])->name('users.toggle');
    });

    Route::middleware('role:admin,executive')->group(function () {
        Route::get('/procurement/dashboard', [ProcurementDashboardController::class, 'index'])->name('procurement.dashboard');
        Route::get('/procurement/pending', [ProcurementDashboardController::class, 'pending'])->name('procurement.pending');
    });

    // Fetch position specs for the asset request modal (all authenticated users)
    Route::get('/api/position-specifications', [PositionSpecificationController::class, 'all'])->name('position-specs.all');

    // Admin and executive routes
    Route::middleware('role:admin,executive')->group(function () {
        Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

        // Admin: Department Management
        Route::get('/admin/departments', [DepartmentController::class, 'index'])->name('admin.departments.index');
        Route::post('/admin/departments', [DepartmentController::class, 'store'])->name('admin.departments.store');
        Route::put('/admin/departments/{department}', [DepartmentController::class, 'update'])->name('admin.departments.update');
        Route::delete('/admin/departments/{department}', [DepartmentController::class, 'destroy'])->name('admin.departments.destroy');

                // Admin: Categories
        Route::get('/admin/categories', [CategoryController::class, 'index'])->name('admin.categories.index');
        Route::post('/admin/categories', [CategoryController::class, 'store'])->name('admin.categories.store');
        Route::put('/admin/categories/{category}', [CategoryController::class, 'update'])->name('admin.categories.update');
        Route::delete('/admin/categories/{category}', [CategoryController::class, 'destroy'])->name('admin.categories.destroy');

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

    Route::middleware('role:admin,executive')->group(function () {
        Route::get('/admin/locations', [LocationController::class, 'index'])->name('admin.locations.index');
        Route::post('/admin/locations', [LocationController::class, 'store'])->name('admin.locations.store');
        Route::put('/admin/locations/{location}', [LocationController::class, 'update'])->name('admin.locations.update');
        Route::delete('/admin/locations/{location}', [LocationController::class, 'destroy'])->name('admin.locations.destroy');
    });

    Route::get('/transfers', fn () => redirect()->route('admin.allocations.index'))->name('transfers.index');
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

    Route::post('/assets/{asset}/decommission', [AssetLifecycleController::class, 'decommission'])->middleware('role:admin,executive')->name('assets.decommission');
    Route::post('/assets/{asset}/dispose', [AssetLifecycleController::class, 'dispose'])->middleware('role:admin,executive')->name('assets.dispose');
    Route::post('/assets/{asset}/archive', [AssetLifecycleController::class, 'archive'])->middleware('role:admin,executive')->name('assets.archive');
    Route::get('/assets/{asset}/qr-label', [AssetController::class, 'qrLabel'])->name('assets.qr-label');
    
    Route::get('/decommission-log', [DecommissionLogController::class, 'index'])->name('decommission.log');
    Route::get('/disposal-log', [DisposalController::class, 'index'])->name('disposal.log');
    Route::get('/archive', [ArchiveController::class, 'index'])->name('archive.utilities');
    Route::post('/archive/{id}/restore', [ArchiveController::class, 'restore'])->name('archive.restore');
    
    Route::get('/activity-log', [ActivityLogController::class, 'index'])->name('activity-log.index');
    Route::get('/activity-log/export/csv', [ActivityLogController::class, 'export'])->name('activity-log.export.csv');
    Route::get('/activity-log/asset/{asset}', [ActivityLogController::class, 'forAsset'])->name('activity-log.asset');
    Route::get('/department-rollup', [DepartmentRollupController::class, 'index'])->name('department.rollup');
    Route::post('/system/sync', [SyncController::class, 'sync'])->name('system.sync');
    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';





