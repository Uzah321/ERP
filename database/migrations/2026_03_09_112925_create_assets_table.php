<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('serial_number')->nullable()->unique();
            $table->string('barcode')->nullable()->unique(); // Auto-generated for barcode labels
            
            // Relationships
            $table->foreignId('department_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('location_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null'); // The actual user holding it
            
            // Purchase Info
            $table->decimal('purchase_cost', 10, 2)->nullable();
            $table->date('purchase_date')->nullable();
            $table->string('order_number')->nullable();
            
            // State
            $table->string('condition')->default('New'); // New, Good, Fair, Poor
            $table->string('status')->default('Purchased'); // Purchased, Registered, Deployed, Active Use, Maintenance, Audit, Decommissioned, Disposed, Archived
            $table->text('description')->nullable();
            
            $table->timestamps();
            $table->softDeletes(); // For ARCHIVE - deleted assets stay in the DB for compliance
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
