<?php

namespace App\Console\Commands;

use App\Models\Asset;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class SendWarrantyReminders extends Command
{
    protected $signature = 'assets:warranty-reminders';
    protected $description = 'Send email reminders for assets with warranties expiring in 30 or 7 days';

    public function handle(): void
    {
        $thresholds = [30, 7];

        foreach ($thresholds as $days) {
            $target = Carbon::today()->addDays($days)->toDateString();

            $assets = Asset::with(['department', 'location'])
                ->whereDate('warranty_expiry_date', $target)
                ->whereNull('deleted_at')
                ->get();

            foreach ($assets as $asset) {
                // Find admins + department manager to notify
                $recipients = User::where('role', 'admin')
                    ->orWhere(function ($q) use ($asset) {
                        $q->where('role', 'manager')
                          ->where('department_id', $asset->department_id);
                    })
                    ->pluck('email')
                    ->unique()
                    ->filter();

                foreach ($recipients as $email) {
                    Mail::send([], [], function ($message) use ($email, $asset, $days) {
                        $message->to($email)
                            ->subject("⚠ Warranty Expiring in {$days} Days — {$asset->name}")
                            ->html("
                                <p>This is an automated reminder from the <strong>Simbisa Asset Management System</strong>.</p>
                                <p>The warranty for the following asset expires in <strong>{$days} days</strong>:</p>
                                <table style='border-collapse:collapse;font-size:14px;margin-top:12px;'>
                                    <tr><td style='padding:4px 12px 4px 0;color:#6b7280;'>Asset</td><td style='font-weight:bold'>{$asset->name}</td></tr>
                                    <tr><td style='padding:4px 12px 4px 0;color:#6b7280;'>Barcode</td><td>{$asset->barcode}</td></tr>
                                    <tr><td style='padding:4px 12px 4px 0;color:#6b7280;'>Serial</td><td>{$asset->serial_number}</td></tr>
                                    <tr><td style='padding:4px 12px 4px 0;color:#6b7280;'>Department</td><td>{$asset->department?->name}</td></tr>
                                    <tr><td style='padding:4px 12px 4px 0;color:#6b7280;'>Location</td><td>{$asset->location?->name}</td></tr>
                                    <tr><td style='padding:4px 12px 4px 0;color:#6b7280;'>Expiry Date</td><td style='color:#dc2626;font-weight:bold'>{$asset->warranty_expiry_date?->format('d F Y')}</td></tr>
                                    <tr><td style='padding:4px 12px 4px 0;color:#6b7280;'>Provider</td><td>{$asset->warranty_provider}</td></tr>
                                </table>
                                <p style='margin-top:16px;color:#6b7280;font-size:12px;'>Please take action to renew the warranty or update asset records accordingly.</p>
                            ");
                    });
                }

                $this->info("Notified {$recipients->count()} recipient(s) about asset [{$asset->name}] expiring in {$days} days.");
            }
        }

        $this->info('Warranty reminder emails sent.');
    }
}
