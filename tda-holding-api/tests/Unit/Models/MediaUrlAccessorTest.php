<?php

namespace Tests\Unit\Models;

use App\Models\Media;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * BE-3 — Vérifie que l'accessor Media::url pointe sur le bon disk.
 *
 * Le disk est piloté par config('filesystems.default').
 * - disk 'public' → URL locale (dev / CI)
 * - disk 'r2'     → URL CDN (prod)
 */
class MediaUrlAccessorTest extends TestCase
{
    public function test_url_uses_public_disk_when_default(): void
    {
        config(['filesystems.default' => 'public']);

        Storage::fake('public');

        $media = new Media(['file_path' => 'uploads/vehicles/1/photo.jpg']);

        $url = $media->url;

        $this->assertStringContainsString('uploads/vehicles/1/photo.jpg', $url);
    }

    public function test_url_uses_r2_disk_when_configured(): void
    {
        config(['filesystems.default' => 'r2']);

        // Fake le disk r2 avec une URL CDN simulée.
        config(['filesystems.disks.r2' => [
            'driver' => 'local',
            'root'   => storage_path('app/r2-fake'),
            'url'    => 'https://cdn.tdaholding.com',
            'throw'  => false,
        ]]);

        Storage::fake('r2');

        $media = new Media(['file_path' => 'uploads/properties/5/cover.webp']);

        $url = $media->url;

        $this->assertStringContainsString('uploads/properties/5/cover.webp', $url);
    }
}
