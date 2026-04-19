<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * TDA-C01 — convertir les morph types FQCN -> alias courts.
 *
 * Avant : bookable_type = 'App\Models\Vehicle'
 * Après  : bookable_type = 'vehicle'
 *
 * Concerne : bookings, favorites, media (colonnes *_type).
 */
return new class extends Migration
{
    private array $map = [
        'App\\Models\\Vehicle' => 'vehicle',
        'App\\Models\\Property' => 'property',
    ];

    public function up(): void
    {
        foreach ($this->map as $fqcn => $alias) {
            DB::table('bookings')->where('bookable_type', $fqcn)->update(['bookable_type' => $alias]);
            DB::table('favorites')->where('favorable_type', $fqcn)->update(['favorable_type' => $alias]);
            DB::table('media')->where('mediable_type', $fqcn)->update(['mediable_type' => $alias]);
        }
    }

    public function down(): void
    {
        foreach ($this->map as $fqcn => $alias) {
            DB::table('bookings')->where('bookable_type', $alias)->update(['bookable_type' => $fqcn]);
            DB::table('favorites')->where('favorable_type', $alias)->update(['favorable_type' => $fqcn]);
            DB::table('media')->where('mediable_type', $alias)->update(['mediable_type' => $fqcn]);
        }
    }
};
