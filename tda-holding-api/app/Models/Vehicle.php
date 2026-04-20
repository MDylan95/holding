<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Vehicle extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id',
        'owner_id',
        'brand',
        'model',
        'year',
        'color',
        'plate_number',
        'seats',
        'transmission',
        'fuel_type',
        'mileage',
        'daily_rate',
        'sale_price',
        'offer_type',
        'status',
        'is_available',
        'description',
        'slug',
        'location',
        'city',
        'has_ac',
        'has_gps',
        'is_featured',
        'features',
    ];

    protected function casts(): array
    {
        return [
            'daily_rate' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'has_ac' => 'boolean',
            'has_gps' => 'boolean',
            'is_featured' => 'boolean',
            'is_available' => 'boolean',
            'features' => 'array',
        ];
    }

    // BE-2 : génération automatique du slug à la création si absent.
    protected static function booted(): void
    {
        static::creating(function (self $vehicle) {
            if (empty($vehicle->slug)) {
                $vehicle->slug = Str::slug("{$vehicle->brand} {$vehicle->model} " . uniqid());
            }
        });
    }

    // --- Relations ---

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function media()
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    public function primaryImage()
    {
        return $this->morphOne(Media::class, 'mediable')->where('is_primary', true);
    }

    public function bookings()
    {
        return $this->morphMany(Booking::class, 'bookable');
    }

    public function favorites()
    {
        return $this->morphMany(Favorite::class, 'favorable');
    }

    public function driver()
    {
        return $this->hasOne(Driver::class, 'assigned_vehicle_id');
    }

    // --- Scopes ---

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeForRent($query)
    {
        return $query->whereIn('offer_type', ['rent', 'both']);
    }

    public function scopeForSale($query)
    {
        return $query->whereIn('offer_type', ['sale', 'both']);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    // --- Helpers ---

    public function isAvailable(): bool
    {
        return $this->is_available === true;
    }

    public function markAsRented(): void
    {
        $this->update(['status' => 'rented', 'is_available' => false]);
    }

    /**
     * TDA-E03 : symétrie avec Property — transition vers vendu.
     */
    public function markAsSold(): void
    {
        $this->update(['status' => 'sold', 'is_available' => false]);
    }

    public function markAsAvailable(): void
    {
        $this->update(['status' => 'available', 'is_available' => true]);
    }

    /**
     * TDA-E03 : symétrie avec Property::markAsMaintenance().
     */
    public function markAsMaintenance(): void
    {
        $this->update(['status' => 'maintenance', 'is_available' => false]);
    }
}
