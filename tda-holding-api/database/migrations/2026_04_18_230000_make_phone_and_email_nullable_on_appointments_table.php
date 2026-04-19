<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * TDA-D04 : permettre qu'un rendez-vous soit pris avec email OU téléphone
 * (cohérent avec la règle D3 d'inscription).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('phone', 20)->nullable()->change();
            $table->string('email')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('phone', 20)->nullable(false)->change();
            $table->string('email')->nullable(false)->change();
        });
    }
};
