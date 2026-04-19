<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Property extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id',
        'owner_id',
        'title',
        'description',
        'property_type',
        'offer_type',
        'sale_price',
        'monthly_rent',
        'surface_area',
        'rooms',
        'bedrooms',
        'bathrooms',
        'floors',
        'has_pool',
        'has_garage',
        'has_garden',
        'is_furnished',
        'location',
        'city',
        'country',
        'latitude',
        'longitude',
        'status',
        'is_available',
        'is_featured',
        'features',
    ];

    protected function casts(): array
    {
        return [
            'sale_price' => 'decimal:2',
            'monthly_rent' => 'decimal:2',
            'surface_area' => 'decimal:2',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'has_pool' => 'boolean',
            'has_garage' => 'boolean',
            'has_garden' => 'boolean',
            'is_furnished' => 'boolean',
            'is_featured' => 'boolean',
            'is_available' => 'boolean',
            'features' => 'array',
        ];
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

    /**
     * TDA-B02 : symétrie avec Vehicle — transitions de statut unifiées.
     */
    public function markAsRented(): void
    {
        $this->update(['status' => 'rented', 'is_available' => false]);
    }

    public function markAsSold(): void
    {
        $this->update(['status' => 'sold', 'is_available' => false]);
    }

    public function markAsAvailable(): void
    {
        $this->update(['status' => 'available', 'is_available' => true]);
    }

    /**
     * TDA-D02 : statut "maintenance" aligné sur Vehicle.
     */
    public function markAsMaintenance(): void
    {
        $this->update(['status' => 'maintenance', 'is_available' => false]);
    }
}
