<?php

namespace Tests\Feature\Database;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * TDA-D05 : l'index composite `bookings_overlap_idx` doit exister.
 * Il couvre la vérification d'overlap côté BookingWorkflow.
 */
class BookingOverlapIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_bookings_overlap_index_is_present(): void
    {
        $driver = DB::connection()->getDriverName();

        $indexName = 'bookings_overlap_idx';

        $exists = match ($driver) {
            'sqlite' => DB::selectOne(
                "SELECT name FROM sqlite_master WHERE type = 'index' AND name = ?",
                [$indexName]
            ) !== null,
            'pgsql' => DB::selectOne(
                "SELECT indexname FROM pg_indexes WHERE tablename = 'bookings' AND indexname = ?",
                [$indexName]
            ) !== null,
            'mysql', 'mariadb' => DB::selectOne(
                'SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?',
                ['bookings', $indexName]
            ) !== null,
            default => $this->markTestSkipped("Driver {$driver} non couvert."),
        };

        $this->assertTrue($exists, "L'index {$indexName} doit être présent sur la table bookings.");
    }
}
