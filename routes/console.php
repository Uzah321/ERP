<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Run the asset depreciation command every day at 1:00 AM.
// The command itself only applies depreciation when a full year has elapsed
// since an asset was last depreciated (or since its purchase date).
Schedule::command('assets:depreciate')->dailyAt('01:00');

// Send warranty expiry reminders daily at 8:00 AM.
Schedule::command('assets:warranty-reminders')->dailyAt('08:00');

// Create scheduled preventive maintenance records daily at 6:00 AM.
Schedule::command('assets:schedule-maintenance')->dailyAt('06:00');
