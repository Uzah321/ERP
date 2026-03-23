<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('capex_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('capex_form_id')->constrained()->cascadeOnDelete();
            $table->string('approval_position'); // it_manager | finance_operations | it_head | finance_director
            $table->foreignId('approver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('approver_name')->nullable();  // snapshot at time of approval
            $table->string('status')->default('pending'); // pending | approved | declined
            $table->string('token')->unique();            // secure email link token
            $table->timestamp('signed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('capex_approvals');
    }
};
