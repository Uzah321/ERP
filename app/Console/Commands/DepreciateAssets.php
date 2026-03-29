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
    protected $description = 'Apply annual depreciation to eligible assets using configured asset settings (rate/method/life/salvage).';

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

            // Current stored value (falls back to purchase_cost if never set)
            $purchaseCost = (float) $asset->purchase_cost;
            $currentValue = (float) ($asset->current_value ?? $purchaseCost);
            $salvageValue = max(0.0, (float) ($asset->salvage_value ?? 0));
            $salvageFloor = min($purchaseCost, $salvageValue);

            // Use user-defined exact rate first; fallback to life-based or 25% default.
            $annualRate = $asset->annual_depreciation_rate;
            $assetLife = (int) ($asset->asset_life_years ?? 0);

            $method = $asset->depreciation_method ?: 'straight_line';
            $annualDeduction = 0.0;
            $newValue = $currentValue;
            $reduced = 0.0;

            if ($method === 'reducing_balance') {
                $rate = $annualRate > 0 ? (float) $annualRate : ($assetLife > 0 ? 100 / $assetLife : 25.0);

                for ($i = 0; $i < $yearsToApply; $i++) {
                    $deduction = $newValue * ($rate / 100);
                    $target = max($salvageFloor, $newValue - $deduction);
                    $reduced += $newValue - $target;
                    $newValue = $target;

                    if ($newValue <= $salvageFloor) {
                        break;
                    }
                }

                $annualDeduction = $rate;
            } else {
                // Straight-line historic default with optional life span and salvage
                if ($assetLife > 0) {
                    $baseAmount = max(0, $purchaseCost - $salvageFloor);
                    $annualDeduction = $baseAmount / $assetLife;
                } elseif ($annualRate > 0) {
                    $annualDeduction = $purchaseCost * ((float) $annualRate / 100);
                } else {
                    $annualDeduction = $purchaseCost * 0.25;
                }

                $newValue = max($salvageFloor, $currentValue - ($annualDeduction * $yearsToApply));
                $reduced = $currentValue - $newValue;
            }

            if ($dryRun) {
                $desc = $method === 'reducing_balance'
                    ? sprintf('Reducing balance %.2f%%', $annualDeduction)
                    : sprintf('Straight-line %s', $assetLife > 0 ? "{$assetLife}yr" : ($annualRate > 0 ? "{$annualRate}%" : '25%'));

                $this->line(sprintf(
                    '[DRY-RUN] %s (%s) | Method: %s | Current: $%.2f → New: $%.2f | Years applied: %d',
                    $asset->name,
                    $asset->barcode,
                    $desc,
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
                        'Annual depreciation applied: -$%.2f (%s) New value: $%.2f',
                        $reduced,
                        $method === 'reducing_balance'
                            ? sprintf('reducing_balance %.2f%%', $annualDeduction)
                            : sprintf('straight_line %.2f/yr', $annualDeduction),
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
