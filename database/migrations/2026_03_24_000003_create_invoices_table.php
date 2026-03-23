<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained()->cascadeOnDelete();
            $table->string('invoice_number')->unique();
            $table->date('invoice_date');
            $table->date('due_date')->nullable();
            $table->decimal('amount', 12, 2);
            $table->decimal('vat_amount', 12, 2)->default(0);
            $table->string('status')->default('pending');   // pending | paid | overdue | disputed
            $table->date('paid_at')->nullable();
            $table->string('payment_reference')->nullable();
            $table->string('payment_method')->nullable();   // EFT | Cheque | Cash | Card
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
