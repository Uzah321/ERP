<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransferRequest extends Model
{
    protected $fillable = [
        'asset_id', 'requested_by', 'target_user_id', 
        'target_location_id', 'target_department_id', 
        'status', 'document_path', 'reason'
    ];

    public function asset() { return $this->belongsTo(Asset::class); }
    public function requester() { return $this->belongsTo(User::class, 'requested_by'); }
    public function targetUser() { return $this->belongsTo(User::class, 'target_user_id'); }
    public function targetLocation() { return $this->belongsTo(Location::class, 'target_location_id'); }
    public function targetDepartment() { return $this->belongsTo(Department::class, 'target_department_id'); }
}
