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
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
})->middleware(['auth', 'verified'])->name('dashboard');

Route::post('/assets', [AssetController::class, 'store'])->middleware(['auth', 'verified'])->name('assets.store');
Route::put('/assets/{asset}', [AssetController::class, 'update'])->middleware(['auth', 'verified'])->name('assets.update');

Route::middleware('auth')->group(function () {
    Route::post('/asset-requests', [AssetRequestController::class, 'store'])->name('asset-requests.store');

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
        Route::patch('/asset-requests/{assetRequest}', [AssetRequestController::class, 'update'])->name('asset-requests.update');

        // Admin: Asset Allocations
        Route::get('/admin/allocations', [AssetAllocationController::class, 'index'])->name('admin.allocations.index');
        Route::post('/admin/allocations', [AssetAllocationController::class, 'store'])->name('admin.allocations.store');
        Route::patch('/admin/allocations/{allocation}/return', [AssetAllocationController::class, 'returnAsset'])->name('admin.allocations.return');

        // IT Admin: View asset requests from other departments
        Route::get('/admin/it-asset-requests', [AssetRequestController::class, 'itRequests'])->name('admin.it-asset-requests');
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

    Route::post('/assets/{asset}/decommission', [AssetLifecycleController::class, 'decommission'])->name('assets.decommission');
    Route::post('/assets/{asset}/dispose', [AssetLifecycleController::class, 'dispose'])->name('assets.dispose');
    Route::post('/assets/{asset}/archive', [AssetLifecycleController::class, 'archive'])->name('assets.archive');
    
    Route::get('/decommission-log', [DecommissionLogController::class, 'index'])->name('decommission.log');
    Route::get('/disposal-log', [DisposalController::class, 'index'])->name('disposal.log');
    Route::get('/archive', [ArchiveController::class, 'index'])->name('archive.utilities');
    Route::post('/archive/{id}/restore', [ArchiveController::class, 'restore'])->name('archive.restore');
    
    Route::get('/activity-log', [ActivityLogController::class, 'index'])->name('activity-log.index');
    Route::get('/department-rollup', [DepartmentRollupController::class, 'index'])->name('department.rollup');
    Route::post('/system/sync', [SyncController::class, 'sync'])->name('system.sync');
    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';





