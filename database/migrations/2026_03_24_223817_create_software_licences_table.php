<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('software_licences', function (Blueprint $table) {
            $table->id();
            $table->string('software_name');
            $table->string('vendor_name')->nullable();
            $table->string('licence_key')->nullable();
            $table->enum('licence_type', ['perpetual', 'subscription', 'per-seat'])->default('subscription');
            $table->unsignedInteger('seat_count')->nullable();
            $table->unsignedInteger('seats_used')->default(0);
            $table->date('purchase_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->decimal('purchase_cost', 12, 2)->nullable();
            $table->decimal('annual_cost', 12, 2)->nullable();
            $table->enum('status', ['active', 'expired', 'cancelled'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('software_licences');
    }
};
