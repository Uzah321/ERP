<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('capex_forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_request_id')->constrained()->cascadeOnDelete();
            $table->string('rtp_reference');
            $table->string('request_type')->default('New Employee Onboarding');
            $table->string('asset_life')->default('4 Years');
            $table->string('cost_allocation')->nullable();
            $table->boolean('insurance_status')->default(true);
            $table->text('reason_for_purchase')->nullable();
            // Ordered items (sorted ascending by estimated price)
            $table->json('items');
            // Overall status of the CAPEX form
            $table->string('status')->default('pending_it_manager');
            // pending_it_manager → pending_finance_operations → pending_it_head → pending_finance_director → approved → declined
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('capex_forms');
    }
};
