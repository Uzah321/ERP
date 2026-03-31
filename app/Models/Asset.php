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
            // UNLESS the user has elevated access across departments.
            if (Auth::check() && !Auth::user()->canViewAllDepartments()) {
                $builder->where('department_id', Auth::user()->department_id);
            }
        });
    }

    protected $appends = ['book_value', 'warranty_status', 'location_label'];

    protected $fillable = [
        'name', 'serial_number', 'barcode', 'department_id', 'category_id',
        'location_id', 'complex_id', 'store_id', 'assigned_to', 'purchase_cost', 'purchase_date',
        'order_number', 'condition', 'status', 'description', 'last_audited_at',
        'depreciation_method', 'annual_depreciation_rate', 'asset_life_years', 'salvage_value',
        'warranty_expiry_date', 'warranty_provider', 'warranty_notes',
        'goods_receipt_id', 'photo_path', 'current_value', 'last_depreciated_at',
        'maintenance_interval_days', 'next_maintenance_date',
    ];

    protected $casts = [
        'purchase_date'            => 'date',
        'warranty_expiry_date'     => 'date',
        'next_maintenance_date'    => 'date',
        'last_depreciated_at'      => 'datetime',
        'purchase_cost'            => 'decimal:2',
        'annual_depreciation_rate' => 'decimal:2',
        'salvage_value'            => 'decimal:2',
        'current_value'            => 'decimal:2',
        'maintenance_interval_days'=> 'integer',
    ];

    /**
     * Book value: returns the stored current_value (maintained by the
     * DepreciateAssets command at 25% of purchase cost per year).
     * Falls back to purchase_cost if current_value is not yet set.
     */
    public function getBookValueAttribute(): ?float
    {
        if (!$this->purchase_cost) {
            return null;
        }
        return round((float) ($this->current_value ?? $this->purchase_cost), 2);
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

    public function complex() {
        return $this->belongsTo(Location::class, 'complex_id');
    }

    public function store() {
        return $this->belongsTo(Location::class, 'store_id');
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

    public function getLocationLabelAttribute(): string
    {
        if ($this->store?->name && $this->complex?->name) {
            return $this->complex->name . ' / ' . $this->store->name;
        }

        if ($this->complex?->name) {
            return $this->complex->name;
        }

        return $this->location?->name ?? '—';
    }
}
