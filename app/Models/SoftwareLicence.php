<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoftwareLicence extends Model
{
    protected $fillable = [
        'software_name',
        'vendor_name',
        'licence_key',
        'licence_type',
        'seat_count',
        'seats_used',
        'purchase_date',
        'expiry_date',
        'purchase_cost',
        'annual_cost',
        'status',
        'notes',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'expiry_date'   => 'date',
        'purchase_cost' => 'decimal:2',
        'annual_cost'   => 'decimal:2',
    ];

    public function getExpiryStatusAttribute(): string
    {
        if (!$this->expiry_date) return 'no_expiry';
        $days = now()->diffInDays($this->expiry_date, false);
        if ($days < 0)  return 'expired';
        if ($days <= 30) return 'expiring_soon';
        return 'active';
    }

    public function getSeatsAvailableAttribute(): ?int
    {
        if ($this->seat_count === null) return null;
        return max(0, $this->seat_count - $this->seats_used);
    }
}
