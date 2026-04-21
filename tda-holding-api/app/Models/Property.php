<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Property extends Model
{
    use SoftDeletes;

    protected $appends = ['name', 'price', 'type'];

    protected $fillable = [
        'category_id',
        'owner_id',
        'title',
        'description',
        'slug',
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
            'sale_price' => 'float',
            'monthly_rent' => 'float',
            'surface_area' => 'float',
            'latitude' => 'float',
            'longitude' => 'float',
            'has_pool' => 'boolean',
            'has_garage' => 'boolean',
            'has_garden' => 'boolean',
            'is_furnished' => 'boolean',
            'is_featured' => 'boolean',
            'is_available' => 'boolean',
            'features' => 'array',
        ];
    }

    // BE-2 : génération automatique du slug à la création si absent.
    protected static function booted(): void
    {
        static::creating(function (self $property) {
            if (empty($property->slug)) {
                $property->slug = Str::slug("{$property->title} " . uniqid());
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

    // --- Accessors ---

    public function getNameAttribute(): string
    {
        return $this->title ?? 'Propriété';
    }

    public function getPriceAttribute(): ?float
    {
        return $this->sale_price ?? $this->monthly_rent;
    }

    public function getTypeAttribute(): string
    {
        return $this->property_type ?? 'Immobilier';
    }
}
