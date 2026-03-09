<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Asset extends Model
{
    use SoftDeletes, LogsActivity;

    protected $fillable = [
        'name', 'serial_number', 'barcode', 'department_id', 'category_id', 
        'location_id', 'assigned_to', 'purchase_cost', 'purchase_date', 
        'order_number', 'condition', 'status', 'description'
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
}
