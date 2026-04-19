<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->foreignId('owner_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('property_type', ['villa', 'apartment', 'land', 'house', 'duplex', 'studio']);
            $table->enum('offer_type', ['rent', 'sale', 'both'])->default('sale');
            $table->decimal('sale_price', 15, 2)->nullable();
            $table->decimal('monthly_rent', 12, 2)->nullable();
            $table->decimal('surface_area', 10, 2)->nullable();
            $table->integer('rooms')->nullable();
            $table->integer('bedrooms')->nullable();
            $table->integer('bathrooms')->nullable();
            $table->integer('floors')->nullable();
            $table->boolean('has_pool')->default(false);
            $table->boolean('has_garage')->default(false);
            $table->boolean('has_garden')->default(false);
            $table->boolean('is_furnished')->default(false);
            $table->string('location');
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->enum('status', ['available', 'rented', 'sold', 'unavailable'])->default('available');
            $table->boolean('is_featured')->default(false);
            $table->json('features')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
