<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Support\Facades\Auth;

class Asset extends Model
{
    use SoftDeletes, LogsActivity;

    protected static function booted()
    {
        static::addGlobalScope('department', function (Builder $builder) {
            // Automatically filter assets by the current user's department
            // UNLESS the user is an 'admin'
            if (Auth::check() && Auth::user()->role !== 'admin') {
                $builder->where('department_id', Auth::user()->department_id);
            }
        });
    }

    protected $appends = ['book_value', 'warranty_status'];

    protected $fillable = [
        'name', 'serial_number', 'barcode', 'department_id', 'category_id',
        'location_id', 'assigned_to', 'purchase_cost', 'purchase_date',
        'order_number', 'condition', 'status', 'description', 'last_audited_at',
        'depreciation_method', 'asset_life_years', 'salvage_value',
        'warranty_expiry_date', 'warranty_provider', 'warranty_notes',
        'goods_receipt_id',
    ];

    protected $casts = [
        'purchase_date'        => 'date',
        'warranty_expiry_date' => 'date',
        'purchase_cost'        => 'decimal:2',
        'salvage_value'        => 'decimal:2',
    ];

    /**
     * Computed book value using straight-line or reducing-balance depreciation.
     */
    public function getBookValueAttribute(): ?float
    {
        if (!$this->purchase_cost || !$this->purchase_date || !$this->asset_life_years) {
            return null;
        }
        $cost     = (float) $this->purchase_cost;
        $salvage  = (float) ($this->salvage_value ?? 0);
        $life     = (int) $this->asset_life_years;
        $years    = max(0, $this->purchase_date->diffInYears(now()));

        if ($this->depreciation_method === 'reducing_balance') {
            $rate  = 1 - pow(($salvage ?: 1) / $cost, 1 / $life);
            $value = $cost * pow(1 - $rate, $years);
        } else {
            // Straight-line
            $annual = ($cost - $salvage) / $life;
            $value  = max($salvage, $cost - ($annual * $years));
        }
        return round($value, 2);
    }

    /**
     * Warranty status: active | expiring_soon (≤30 days) | expired | none
     */
    public function getWarrantyStatusAttribute(): string
    {
        if (!$this->warranty_expiry_date) {
            return 'none';
        }
        $days = now()->diffInDays($this->warranty_expiry_date, false);
        if ($days < 0)  return 'expired';
        if ($days <= 30) return 'expiring_soon';
        return 'active';
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable() // Automatically logs when any of these fields change!
            ->logOnlyDirty(); // Only logs what actually changed
    }

    public function department() {
        return $this->belongsTo(Department::class);
    }
    
    public function category() {
        return $this->belongsTo(Category::class);
    }
    
    public function location() {
        return $this->belongsTo(Location::class);
    }
    
    public function assignee() {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function maintenanceRecords() {
        return $this->hasMany(MaintenanceRecord::class);
    }

    public function allocations() {
        return $this->hasMany(AssetAllocation::class);
    }

    public function goodsReceipt() {
        return $this->belongsTo(GoodsReceipt::class);
    }
}
