<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    protected $fillable = [
        'po_number',
        'capex_form_id',
        'vendor_name',
        'vendor_tin',
        'vendor_vat_number',
        'requisition_no',
        'items',
        'vat_amount',
        'total_amount',
        'manager_name',
        'allocation',
        'authorised_by',
    ];

    protected $casts = [
        'items'        => 'array',
        'vat_amount'   => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Generate the next sequential PO number, starting at 1000.
     */
    public static function nextPoNumber(): int
    {
        $max = static::max('po_number');
        return $max ? $max + 1 : 1000;
    }

    public function capexForm()
    {
        return $this->belongsTo(CapexForm::class);
    }
}
