<?php

namespace App\Console\Commands;

use App\Models\Asset;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DepreciateAssets extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'assets:depreciate {--dry-run : Preview which assets would be depreciated without saving}';

    /**
     * The console command description.
     */
    protected $description = 'Apply annual 25%-of-purchase-cost depreciation to eligible assets';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $now    = now();
        $count  = 0;
        $totalReduced = 0;

        // Fetch all active (non-disposed, non-archived) assets that have a purchase_cost and purchase_date
        $assets = Asset::withoutGlobalScopes()
            ->withoutTrashed()
            ->whereNotIn('status', ['Disposed', 'Archived', 'Decommissioned'])
            ->whereNotNull('purchase_cost')
            ->whereNotNull('purchase_date')
            ->get();

        foreach ($assets as $asset) {
            // Determine whether a full year has elapsed since the last depreciation
            // (or since purchase if never depreciated)
            $baseline = $asset->last_depreciated_at ?? $asset->purchase_date->startOfDay();
            $monthsElapsed = $baseline->diffInMonths($now);

            if ($monthsElapsed < 12) {
                continue; // Not yet a full year since last depreciation
            }

            // How many full years have elapsed since baseline?
            $yearsToApply = (int) floor($monthsElapsed / 12);

            // 25% of original purchase cost per year (straight-line downwards)
            $annualDeduction = (float) $asset->purchase_cost * 0.25;

            // Current stored value (falls back to purchase_cost if never set)
            $currentValue = (float) ($asset->current_value ?? $asset->purchase_cost);

            // Apply each year's portion, flooring at zero
            $newValue = max(0, $currentValue - ($annualDeduction * $yearsToApply));

            $reduced = $currentValue - $newValue;

            if ($dryRun) {
                $this->line(sprintf(
                    '[DRY-RUN] %s (%s) | Current: $%.2f → New: $%.2f | Years applied: %d',
                    $asset->name,
                    $asset->barcode,
                    $currentValue,
                    $newValue,
                    $yearsToApply
                ));
            } else {
                $asset->update([
                    'current_value'       => $newValue,
                    'last_depreciated_at' => $now,
                ]);

                activity()
                    ->performedOn($asset)
                    ->withProperties(['depreciation_applied' => $reduced, 'years_applied' => $yearsToApply])
                    ->log(sprintf(
                        'Annual depreciation applied: -$%.2f (25%%/yr × %d yr). New value: $%.2f',
                        $reduced,
                        $yearsToApply,
                        $newValue
                    ));
            }

            $count++;
            $totalReduced += $reduced;
        }

        $this->info(sprintf(
            '%s%d asset(s) depreciated. Total value reduced by $%.2f.',
            $dryRun ? '[DRY-RUN] ' : '',
            $count,
            $totalReduced
        ));

        return Command::SUCCESS;
    }
}
