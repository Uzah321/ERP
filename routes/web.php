<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TransferRequestController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\AssetLifecycleController;
use App\Http\Controllers\AssetController;
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

Route::get('/dashboard', [AssetController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');
Route::post('/assets', [AssetController::class, 'store'])->middleware(['auth', 'verified'])->name('assets.store');

Route::middleware('auth')->group(function () {
    Route::get('/transfers', [TransferRequestController::class, 'index'])->name('transfers.index');
    Route::post('/assets/{asset}/transfer', [TransferRequestController::class, 'store'])->name('transfers.store');
    Route::patch('/transfers/{transferRequest}', [TransferRequestController::class, 'update'])->name('transfers.update');

    Route::post('/assets/{asset}/maintenance', [MaintenanceController::class, 'store'])->name('maintenance.store');
    Route::patch('/assets/{asset}/maintenance', [MaintenanceController::class, 'update'])->name('maintenance.update');

    Route::get('/audit', [AuditController::class, 'index'])->name('audit.index');
    Route::post('/audit', [AuditController::class, 'store'])->name('audit.store');

    Route::post('/assets/{asset}/decommission', [AssetLifecycleController::class, 'decommission'])->name('assets.decommission');
    Route::post('/assets/{asset}/dispose', [AssetLifecycleController::class, 'dispose'])->name('assets.dispose');
    Route::post('/assets/{asset}/archive', [AssetLifecycleController::class, 'archive'])->name('assets.archive');
    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';


