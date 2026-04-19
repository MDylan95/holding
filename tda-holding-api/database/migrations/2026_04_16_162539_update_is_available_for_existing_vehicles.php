<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Initialiser is_available basé sur le statut existant
        DB::table('vehicles')->update([
            'is_available' => DB::raw("CASE WHEN status = 'available' THEN true ELSE false END")
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Pas besoin de rollback spécifique
    }
};
