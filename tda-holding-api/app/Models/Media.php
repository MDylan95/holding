<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    protected $appends = ['url'];

    protected $fillable = [
        'mediable_id',
        'mediable_type',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'is_primary',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
        ];
    }

    // --- Accessors ---

    /**
     * BE-3 : URL du média pointant sur le disk actif.
     * - dev/test : disk 'public' → /storage/...
     * - prod     : disk 'r2'     → https://cdn.tdaholding.com/...
     */
    public function getUrlAttribute(): string
    {
        $disk = config('filesystems.default', 'public');

        return Storage::disk($disk)->url($this->file_path);
    }

    // --- Relations ---

    public function mediable()
    {
        return $this->morphTo();
    }
}
