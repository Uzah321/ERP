<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $fillable = ['name', 'address'];

    public function assets() {
        return $this->hasMany(Asset::class);
    }
}
