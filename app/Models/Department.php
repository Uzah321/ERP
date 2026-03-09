<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = ['name']; // Security feature permitting mass-assignment

    public function users() {
        return $this->hasMany(User::class);
    }
    
    public function assets() {
        return $this->hasMany(Asset::class);
    }
}