<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('po_number')->unique(); // e.g. 1931, 1932 ...
            $table->foreignId('capex_form_id')->constrained()->cascadeOnDelete();
            $table->string('vendor_name');
            $table->string('vendor_tin')->nullable();
            $table->string('vendor_vat_number')->nullable();
            $table->string('requisition_no')->nullable();
            $table->json('items');           // [{description, qty, unit_price, total}]
            $table->decimal('vat_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2);
            $table->string('manager_name')->nullable();
            $table->string('allocation')->nullable();
            $table->string('authorised_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
