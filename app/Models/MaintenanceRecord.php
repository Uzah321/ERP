<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaintenanceRecord extends Model
{
    protected $fillable = [
        'asset_id', 'user_id', 'maintenance_type', 'issue_description', 
        'vendor_name', 'cost', 'status', 
        'start_date', 'end_date', 'scheduled_date', 'notes'
    ];

    public function asset() { return $this->belongsTo(Asset::class); }
    public function user() { return $this->belongsTo(User::class); }
}
