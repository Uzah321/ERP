<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PositionSpecification extends Model
{
    protected $fillable = [
        'position_name',
        'asset_type',
        'specifications',
    ];
}
