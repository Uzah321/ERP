<?php

namespace App\Console\Commands;

use App\Models\Asset;
use App\Models\MaintenanceRecord;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SchedulePreventiveMaintenance extends Command
{
    protected $signature = 'assets:schedule-maintenance';
    protected $description = 'Auto-create scheduled preventive maintenance records for assets with a maintenance interval';

    public function handle(): void
    {
        $today = Carbon::today();

        $assets = Asset::whereNotNull('maintenance_interval_days')
            ->where(function ($q) use ($today) {
                $q->whereNull('next_maintenance_date')
                  ->orWhereDate('next_maintenance_date', '<=', $today);
            })
            ->whereNull('deleted_at')
            ->get();

        $count = 0;
        foreach ($assets as $asset) {
            // Only create one pending scheduled record if none exists for today's cycle
            $alreadyScheduled = MaintenanceRecord::where('asset_id', $asset->id)
                ->where('maintenance_type', 'Preventive')
                ->where('status', 'scheduled')
                ->whereDate('scheduled_date', '>=', $today)
                ->exists();

            if (!$alreadyScheduled) {
                $scheduledDate = $asset->next_maintenance_date ?? $today;

                MaintenanceRecord::create([
                    'asset_id'         => $asset->id,
                    'maintenance_type' => 'Preventive',
                    'description'      => 'Scheduled preventive maintenance (auto-generated)',
                    'scheduled_date'   => $scheduledDate,
                    'status'           => 'scheduled',
                ]);

                // Advance next maintenance date
                $nextDate = Carbon::parse($scheduledDate)->addDays($asset->maintenance_interval_days);
                $asset->update(['next_maintenance_date' => $nextDate]);

                $count++;
                $this->info("Scheduled maintenance for asset: [{$asset->name}] on {$scheduledDate->format('Y-m-d')}");
            }
        }

        $this->info("{$count} preventive maintenance record(s) created.");
    }
}
