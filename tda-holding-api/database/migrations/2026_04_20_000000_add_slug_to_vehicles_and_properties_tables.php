<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('description');
        });

        Schema::table('properties', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('description');
        });

        // Backfill : génère un slug pour chaque enregistrement existant.
        // Véhicules : "{brand}-{model}-{id}"
        DB::table('vehicles')->whereNull('slug')->orderBy('id')->each(function ($row) {
            DB::table('vehicles')->where('id', $row->id)->update([
                'slug' => Str::slug("{$row->brand} {$row->model} {$row->id}"),
            ]);
        });

        // Propriétés : slug dérivé du titre + id pour unicité garantie.
        DB::table('properties')->whereNull('slug')->orderBy('id')->each(function ($row) {
            DB::table('properties')->where('id', $row->id)->update([
                'slug' => Str::slug("{$row->title} {$row->id}"),
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn('slug');
        });

        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
