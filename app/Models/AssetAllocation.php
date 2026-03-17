<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetAllocation extends Model
{
    protected $fillable = [
        'asset_id', 'department_id', 'user_id',
        'allocated_by', 'allocated_date', 'returned_date', 'notes',
    ];

    public function asset() { return $this->belongsTo(Asset::class); }
    public function department() { return $this->belongsTo(Department::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function allocator() { return $this->belongsTo(User::class, 'allocated_by'); }
}
