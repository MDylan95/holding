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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('vehicle_id')->constrained()->onDelete('cascade');
            $table->date('appointment_date');
            $table->string('preferred_time')->nullable(); // e.g., "09:00-12:00", "14:00-17:00"
            $table->string('location')->nullable(); // where to meet
            $table->string('phone', 20);
            $table->string('email');
            $table->text('notes')->nullable(); // user's message/notes
            $table->text('admin_notes')->nullable(); // admin's internal notes
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');
            $table->boolean('reminder_sent')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null'); // admin who confirmed
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
