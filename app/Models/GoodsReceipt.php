<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GoodsReceipt extends Model
{
    protected $fillable = [
        'purchase_order_id',
        'received_by',
        'received_at',
        'delivery_note_no',
        'status',
        'items',
        'condition_notes',
        'notes',
    ];

    protected $casts = [
        'items'       => 'array',
        'received_at' => 'date',
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function assets()
    {
        return $this->hasMany(Asset::class);
    }
}
