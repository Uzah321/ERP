<?php

use App\Http\Controllers\Api\AssetApiController;
use App\Http\Controllers\Api\DepartmentApiController;
use App\Http\Controllers\Api\MaintenanceApiController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Assets
    Route::get('/assets', [AssetApiController::class, 'index']);
    Route::get('/assets/{asset}', [AssetApiController::class, 'show']);
    Route::post('/assets', [AssetApiController::class, 'store']);
    Route::put('/assets/{asset}', [AssetApiController::class, 'update']);
    Route::delete('/assets/{asset}', [AssetApiController::class, 'destroy']);

    // Departments
    Route::get('/departments', [DepartmentApiController::class, 'index']);
    Route::get('/departments/{department}', [DepartmentApiController::class, 'show']);

    // Maintenance Records
    Route::get('/assets/{asset}/maintenance', [MaintenanceApiController::class, 'index']);
    Route::post('/assets/{asset}/maintenance', [MaintenanceApiController::class, 'store']);
});
