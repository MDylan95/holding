<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Driver extends Model
{
    use SoftDeletes;

    protected $appends = ['avatar_url'];

    protected $fillable = [
        'first_name',
        'last_name',
        'phone',
        'email',
        'license_number',
        'license_expiry',
        'avatar',
        'address',
        'city',
        'experience_years',
        'daily_rate',
        'status',
        'assigned_vehicle_id',
        'notes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'license_expiry' => 'date',
            'daily_rate' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    // --- Accessors ---

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar ? Storage::disk('public')->url($this->avatar) : null;
    }

    // --- Relations ---

    public function assignedVehicle()
    {
        return $this->belongsTo(Vehicle::class, 'assigned_vehicle_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    // --- Scopes ---

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available')->where('is_active', true);
    }

    public function scopeOnMission($query)
    {
        return $query->where('status', 'on_mission');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // --- Helpers ---

    public function isAvailable(): bool
    {
        return $this->status === 'available' && $this->is_active;
    }

    public function markAsOnMission(): void
    {
        $this->update(['status' => 'on_mission']);
    }

    public function markAsAvailable(): void
    {
        $this->update(['status' => 'available']);
    }
}
