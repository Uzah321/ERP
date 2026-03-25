<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CapexForm extends Model
{
    protected $fillable = [
        'asset_request_id',
        'rtp_reference',
        'request_type',
        'asset_life',
        'cost_allocation',
        'insurance_status',
        'reason_for_purchase',
        'items',
        'quotations',
        'approval_chain',
        'current_stage_index',
        'total_amount',
        'status',
    ];

    protected $casts = [
        'items'               => 'array',
        'quotations'          => 'array',
        'approval_chain'      => 'array',
        'insurance_status'    => 'boolean',
        'current_stage_index' => 'integer',
        'total_amount'        => 'decimal:2',
    ];

    // ── Legacy fixed-chain constants (kept for backward compatibility) ──
    public const STAGES = [
        'pending_it_manager',
        'pending_finance_operations',
        'pending_it_head',
        'pending_finance_director',
        'approved',
    ];

    public const STAGE_POSITIONS = [
        'pending_it_manager'          => 'it_manager',
        'pending_finance_operations'  => 'finance_operations',
        'pending_it_head'             => 'it_head',
        'pending_finance_director'    => 'finance_director',
    ];

    public function assetRequest()
    {
        return $this->belongsTo(AssetRequest::class);
    }

    public function approvals()
    {
        return $this->hasMany(CapexApproval::class);
    }

    public function purchaseOrders()
    {
        return $this->hasMany(\App\Models\PurchaseOrder::class);
    }

    public function currentApproval()
    {
        return $this->approvals()->where('status', 'pending')->latest()->first();
    }

    /**
     * Advance to the next stage in the approval chain, or mark fully approved.
     * Returns the next CapexApproval record if any remain, or null if fully approved.
     */
    public function advanceStage(): ?CapexApproval
    {
        // ── Dynamic chain (new behaviour) ────────────────────────────────────
        if (!empty($this->approval_chain)) {
            $chain     = $this->approval_chain;
            $nextIndex = ($this->current_stage_index ?? 0) + 1;

            if ($nextIndex >= count($chain)) {
                $this->update(['status' => 'approved']);
                return null;
            }

            $next     = $chain[$nextIndex];
            $nextUser = User::find($next['user_id']);

            $this->update(['current_stage_index' => $nextIndex]);

            return $this->approvals()->create([
                'approval_position' => $next['label'],
                'approver_id'       => $nextUser?->id,
                'approver_name'     => $nextUser?->name,
                'status'            => 'pending',
                'token'             => \Illuminate\Support\Str::random(64),
            ]);
        }

        // ── Legacy fixed chain (backward compatibility) ───────────────────────
        $stages       = self::STAGES;
        $currentIndex = array_search($this->status, $stages);

        // Guard: if status is not in the stages array (e.g. 'approved' or 'declined'), do not advance
        if ($currentIndex === false) {
            return null;
        }

        $nextStatus   = $stages[$currentIndex + 1] ?? 'approved';
        $this->update(['status' => $nextStatus]);

        if ($nextStatus === 'approved') {
            return null;
        }

        $nextPosition = self::STAGE_POSITIONS[$nextStatus];
        $approver     = User::where('approval_position', $nextPosition)->where('is_active', true)->first();

        return $this->approvals()->create([
            'approval_position' => $nextPosition,
            'approver_id'       => $approver?->id,
            'approver_name'     => $approver?->name,
            'status'            => 'pending',
            'token'             => \Illuminate\Support\Str::random(64),
        ]);
    }
}
