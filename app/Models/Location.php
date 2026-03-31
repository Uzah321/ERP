<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Location extends Model
{
    protected $fillable = ['name', 'address', 'type', 'parent_id'];

    public function assets(): HasMany {
        return $this->hasMany(Asset::class);
    }

    public function assetsAsComplex(): HasMany
    {
        return $this->hasMany(Asset::class, 'complex_id');
    }

    public function assetsAsStore(): HasMany
    {
        return $this->hasMany(Asset::class, 'store_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function stores(): HasMany
    {
        return $this->children()->where('type', 'store');
    }

    public function scopeComplexes($query)
    {
        return $query->where('type', 'complex');
    }

    public function scopeStores($query)
    {
        return $query->where('type', 'store');
    }
}
