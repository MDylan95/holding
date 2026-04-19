<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * TDA-E01 : retirer les statuts "refunded" et "failed" de Transaction tant que
 * les flux correspondants (remboursement, échec paiement) ne sont pas implémentés.
 * Ils seront réintroduits en Phase 6 (mobile money).
 */
return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();

        // Normaliser les éventuelles données pré-existantes.
        DB::table('transactions')->whereIn('status', ['refunded', 'failed'])->update(['status' => 'pending']);

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check');
            DB::statement("ALTER TABLE transactions ADD CONSTRAINT transactions_status_check CHECK (status IN ('pending','confirmed','completed'))");

            return;
        }

        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement("ALTER TABLE transactions MODIFY COLUMN status ENUM('pending','confirmed','completed') NOT NULL DEFAULT 'pending'");

            return;
        }

        Schema::table('transactions', function (Blueprint $table) {
            $table->string('status')->default('pending')->change();
        });
    }

    public function down(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check');
            DB::statement("ALTER TABLE transactions ADD CONSTRAINT transactions_status_check CHECK (status IN ('pending','confirmed','completed','refunded','failed'))");

            return;
        }

        if ($driver === 'mysql' || $driver === 'mariadb') {
            DB::statement("ALTER TABLE transactions MODIFY COLUMN status ENUM('pending','confirmed','completed','refunded','failed') NOT NULL DEFAULT 'pending'");

            return;
        }

        Schema::table('transactions', function (Blueprint $table) {
            $table->string('status')->default('pending')->change();
        });
    }
};
