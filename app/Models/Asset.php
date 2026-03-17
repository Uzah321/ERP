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

    protected $fillable = [
        'name', 'serial_number', 'barcode', 'department_id', 'category_id', 
        'location_id', 'assigned_to', 'purchase_cost', 'purchase_date', 
        'order_number', 'condition', 'status', 'description', 'last_audited_at'
    ];

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
}
