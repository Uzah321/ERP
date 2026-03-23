<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('position_specifications', function (Blueprint $table) {
            $table->id();
            $table->string('position_name');       // e.g. Manager, HOD, Staff
            $table->string('asset_type');           // e.g. Laptop, Desktop, Printer
            $table->text('specifications');         // e.g. 32GB+ RAM, 1TB+ storage, Core i7 or better
            $table->timestamps();

            $table->unique(['position_name', 'asset_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('position_specifications');
    }
};
