<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * TDA-D02 : aligner Property.status sur Vehicle en ajoutant "maintenance".
 *
 * La contrainte CHECK d'origine n'autorise que {available, rented, sold, unavailable}.
 * On l'ouvre à "maintenance" sans toucher aux migrations existantes.
 */
return new class extends Migration
{
    private const STATUSES = ['available', 'rented', 'sold', 'unavailable', 'maintenance'];

    public function up(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check');
            DB::statement("ALTER TABLE properties ADD CONSTRAINT properties_status_check CHECK (status IN ('available','rented','sold','unavailable','maintenance'))");

            return;
        }

        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement("ALTER TABLE properties MODIFY COLUMN status ENUM('available','rented','sold','unavailable','maintenance') NOT NULL DEFAULT 'available'");

            return;
        }

        // SQLite (tests) + autres : on relâche la contrainte au profit de la validation applicative.
        Schema::table('properties', function (Blueprint $table) {
            $table->string('status')->default('available')->change();
        });
    }

    public function down(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check');
            DB::statement("ALTER TABLE properties ADD CONSTRAINT properties_status_check CHECK (status IN ('available','rented','sold','unavailable'))");

            return;
        }

        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement("ALTER TABLE properties MODIFY COLUMN status ENUM('available','rented','sold','unavailable') NOT NULL DEFAULT 'available'");

            return;
        }

        Schema::table('properties', function (Blueprint $table) {
            $table->string('status')->default('available')->change();
        });
    }
};
