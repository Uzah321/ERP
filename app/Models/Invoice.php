<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Invoice extends Model
{
    protected $fillable = [
        'purchase_order_id',
        'invoice_number',
        'invoice_date',
        'due_date',
        'amount',
        'vat_amount',
        'status',
        'paid_at',
        'payment_reference',
        'payment_method',
        'notes',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'due_date'     => 'date',
        'paid_at'      => 'date',
        'amount'       => 'decimal:2',
        'vat_amount'   => 'decimal:2',
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    /**
     * Auto-mark as overdue when reading status if due_date has passed and still pending.
     */
    public function getStatusAttribute($value): string
    {
        if ($value === 'pending' && $this->due_date && $this->due_date->isPast()) {
            return 'overdue';
        }
        return $value;
    }
}
