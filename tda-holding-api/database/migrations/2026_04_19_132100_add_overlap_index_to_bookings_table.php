<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * TDA-D05 : index composite pour accélérer la détection d'overlap des bookings.
 * Champs concernés : bookable_type, bookable_id, status, start_date, end_date.
 */
return new class extends Migration
{
    private const INDEX_NAME = 'bookings_overlap_idx';

    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->index(
                ['bookable_type', 'bookable_id', 'status', 'start_date', 'end_date'],
                self::INDEX_NAME,
            );
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(self::INDEX_NAME);
        });
    }
};
