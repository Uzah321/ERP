<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CapexApproval extends Model
{
    protected $fillable = [
        'capex_form_id',
        'approval_position',
        'approver_id',
        'approver_name',
        'status',
        'token',
        'signed_at',
    ];

    protected $casts = [
        'signed_at' => 'datetime',
    ];

    public const POSITION_LABELS = [
        'it_manager'         => 'IT Manager',
        'finance_operations' => 'Finance Operations',
        'it_head'            => 'IT Head of Technology',
        'finance_director'   => 'Finance Director',
    ];

    public function capexForm()
    {
        return $this->belongsTo(CapexForm::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function positionLabel(): string
    {
        // For dynamic chains, approval_position is already a human-readable label.
        // Fall back to the legacy map for old fixed-position keys.
        return self::POSITION_LABELS[$this->approval_position] ?? $this->approval_position;
    }
}
