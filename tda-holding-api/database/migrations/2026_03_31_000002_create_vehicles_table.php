<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->foreignId('owner_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('brand');
            $table->string('model');
            $table->integer('year')->nullable();
            $table->string('color')->nullable();
            $table->string('plate_number')->unique()->nullable();
            $table->integer('seats')->default(5);
            $table->enum('transmission', ['manual', 'automatic'])->default('automatic');
            $table->enum('fuel_type', ['essence', 'diesel', 'electric', 'hybrid'])->default('essence');
            $table->integer('mileage')->nullable();
            $table->decimal('daily_rate', 12, 2)->nullable();
            $table->decimal('sale_price', 12, 2)->nullable();
            $table->enum('offer_type', ['rent', 'sale', 'both'])->default('rent');
            $table->enum('status', ['available', 'rented', 'sold', 'maintenance', 'unavailable'])->default('available');
            $table->text('description')->nullable();
            $table->string('location')->nullable();
            $table->string('city')->nullable();
            $table->boolean('has_ac')->default(true);
            $table->boolean('has_gps')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->json('features')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
