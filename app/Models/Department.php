<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = ['name', 'manager_id'];

    public function users() {
        return $this->hasMany(User::class);
    }

    public function assets() {
        return $this->hasMany(Asset::class);
    }

    public function manager() {
        return $this->belongsTo(User::class, 'manager_id');
    }
}