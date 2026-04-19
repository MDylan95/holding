import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft, Upload, X } from 'lucide-react';
import { useState } from 'react';

const SLUG_TO_TYPE = {
    villa: 'villa',
    appartement: 'apartment',
    terrain: 'land',
    maison: 'house',
    duplex: 'duplex',
    studio: 'studio',
    apartment: 'apartment',
    land: 'land',
    house: 'house',
};

export default function Form({ property, categories }) {
    const isEdit = !!property;
    const { data, setData, post, put, processing, errors } = useForm({
        category_id: property?.category_id || '',
        property_type: property?.property_type || 'apartment',
        title: property?.title || '',
        description: property?.description || '',
        offer_type: property?.offer_type || 'sale',
        sale_price: property?.sale_price || '',
        monthly_rent: property?.monthly_rent || '',
        surface_area: property?.surface_area || '',
        rooms: property?.rooms || '',
        bedrooms: property?.bedrooms || '',
        bathrooms: property?.bathrooms || '',
        floors: property?.floors || '',
        location: property?.location || '',
        city: property?.city || '',
        country: property?.country || 'Côte d\'Ivoire',
        has_pool: property?.has_pool ?? false,
        has_garage: property?.has_garage ?? false,
        has_garden: property?.has_garden ?? false,
        is_furnished: property?.is_furnished ?? false,
        is_featured: property?.is_featured ?? false,
        status: property?.status || 'available',
        images: [],
    });

    const [previews, setPreviews] = useState([]);

    function handleImages(e) {
        const files = Array.from(e.target.files);
        setData('images', files);
        setPreviews(files.map((f) => URL.createObjectURL(f)));
    }

    function removePreview(index) {
        const newFiles = [...data.images];
        newFiles.splice(index, 1);
        setData('images', newFiles);
        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    }

    function handleSubmit(e) {
        e.preventDefault();
        
        // Build FormData manually for proper file handling
        const formData = new FormData();
        formData.append('category_id', data.category_id);
        formData.append('title', data.title);
        formData.append('description', data.description || '');
        formData.append('property_type', data.property_type);
        formData.append('offer_type', data.offer_type);
        formData.append('sale_price', data.sale_price || '');
        formData.append('monthly_rent', data.monthly_rent || '');
        formData.append('surface_area', data.surface_area || '');
        formData.append('rooms', data.rooms || '');
        formData.append('bedrooms', data.bedrooms || '');
        formData.append('bathrooms', data.bathrooms || '');
        formData.append('floors', data.floors || '');
        formData.append('has_pool', data.has_pool ? 1 : 0);
        formData.append('has_garage', data.has_garage ? 1 : 0);
        formData.append('has_garden', data.has_garden ? 1 : 0);
        formData.append('is_furnished', data.is_furnished ? 1 : 0);
        formData.append('location', data.location);
        formData.append('city', data.city || '');
        formData.append('country', data.country || '');
        formData.append('is_featured', data.is_featured ? 1 : 0);
        
        if (isEdit) {
            formData.append('status', data.status);
        }
        
        // Append image files properly
        if (data.images && data.images.length > 0) {
            data.images.forEach((file, index) => {
                formData.append(`images[${index}]`, file);
            });
        }
        
        if (isEdit) {
            formData.append('_method', 'PUT');
            put(`/admin/properties/${property.id}`, formData);
        } else {
            post('/admin/properties', formData);
        }
    }

    function InputError({ message }) {
        return message ? <p className="mt-1 text-xs text-red-600">{message}</p> : null;
    }

    return (
        <AdminLayout header={isEdit ? `Modifier — ${property.title}` : 'Ajouter un bien immobilier'}>
            <Head title={isEdit ? 'Modifier bien' : 'Ajouter bien'} />

            <div className="mb-4">
                <Link href="/admin/properties" className="inline-flex items-center gap-1.5 text-sm text-tda-silver-500 hover:text-tda-green-600 transition">
                    <ArrowLeft className="h-4 w-4" /> Retour à la liste
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. IDENTIFICATION */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                    <h3 className="text-base font-semibold text-tda-green-900 mb-4">Identification</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Titre *</label>
                            <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" placeholder="Villa 5 pièces avec piscine" />
                            <InputError message={errors.title} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Type de bien *</label>
                            <select
                                value={data.category_id}
                                onChange={(e) => {
                                    const cat = categories.find(c => String(c.id) === e.target.value);
                                    setData('category_id', e.target.value);
                                    if (cat) setData('property_type', SLUG_TO_TYPE[cat.slug] || 'apartment');
                                }}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                            >
                                <option value="">Sélectionner...</option>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <InputError message={errors.category_id} />
                            <InputError message={errors.property_type} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-tda-silver-500 mb-1">Description</label>
                        <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3}
                            className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" placeholder="Décrivez le bien..." />
                    </div>
                </div>

                {/* 2. TARIFICATION */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                    <h3 className="text-base font-semibold text-tda-green-900 mb-4">Tarification</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Type d'offre *</label>
                            <select value={data.offer_type} onChange={(e) => setData('offer_type', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500">
                                <option value="sale">Vente</option>
                                <option value="rent">Location</option>
                                <option value="both">Vente & Location</option>
                            </select>
                        </div>
                        {(data.offer_type === 'sale' || data.offer_type === 'both') && (
                            <div>
                                <label className="block text-sm font-medium text-tda-silver-500 mb-1">Prix de vente (FCFA)</label>
                                <input type="number" value={data.sale_price} onChange={(e) => setData('sale_price', e.target.value)}
                                    className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" placeholder="50000000" />
                            </div>
                        )}
                        {(data.offer_type === 'rent' || data.offer_type === 'both') && (
                            <div>
                                <label className="block text-sm font-medium text-tda-silver-500 mb-1">Loyer mensuel (FCFA)</label>
                                <input type="number" value={data.monthly_rent} onChange={(e) => setData('monthly_rent', e.target.value)}
                                    className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" placeholder="300000" />
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. CARACTÉRISTIQUES */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                    <h3 className="text-base font-semibold text-tda-green-900 mb-4">Caractéristiques</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Surface (m²)</label>
                            <input type="number" value={data.surface_area} onChange={(e) => setData('surface_area', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" placeholder="200" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Pièces</label>
                            <input type="number" value={data.rooms} onChange={(e) => setData('rooms', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Chambres</label>
                            <input type="number" value={data.bedrooms} onChange={(e) => setData('bedrooms', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Salles de bain</label>
                            <input type="number" value={data.bathrooms} onChange={(e) => setData('bathrooms', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Étages</label>
                            <input type="number" value={data.floors} onChange={(e) => setData('floors', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" />
                        </div>
                    </div>
                </div>

                {/* 4. LOCALISATION */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                    <h3 className="text-base font-semibold text-tda-green-900 mb-4">Localisation</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Localisation *</label>
                            <input type="text" value={data.location} onChange={(e) => setData('location', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" placeholder="Cocody Riviera" />
                            <InputError message={errors.location} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Ville</label>
                            <input type="text" value={data.city} onChange={(e) => setData('city', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" placeholder="Abidjan" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Pays</label>
                            <input type="text" value={data.country} onChange={(e) => setData('country', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" />
                        </div>
                    </div>
                </div>

                {/* 5. ÉQUIPEMENTS */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                    <h3 className="text-base font-semibold text-tda-green-900 mb-4">Équipements</h3>
                    <div className="flex flex-wrap gap-6">
                        {[
                            { key: 'has_pool', label: 'Piscine' },
                            { key: 'has_garage', label: 'Garage' },
                            { key: 'has_garden', label: 'Jardin' },
                            { key: 'is_furnished', label: 'Meublé' },
                        ].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={data[key]} onChange={(e) => setData(key, e.target.checked)}
                                    className="rounded border-tda-silver-300 text-tda-green-600 focus:ring-tda-green-500" />
                                <span className="text-sm text-tda-silver-500">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 6. PHOTOS */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                    <h3 className="text-base font-semibold text-tda-green-900 mb-4">Photos</h3>
                    {isEdit && property.media && property.media.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs text-tda-silver-400 mb-2">Photos existantes</p>
                            <div className="flex flex-wrap gap-3">
                                {property.media.map((m) => (
                                    <div key={m.id} className="relative h-24 w-24 rounded-lg overflow-hidden border border-tda-silver-200">
                                        <img src={`/storage/${m.file_path}`} alt="" className="h-full w-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-tda-silver-300 p-6 hover:border-tda-green-500 transition">
                        <Upload className="h-8 w-8 text-tda-silver-400 mb-2" />
                        <p className="text-sm text-tda-silver-500">Cliquez pour ajouter des photos</p>
                        <p className="text-xs text-tda-silver-400 mt-1">JPG, PNG, WebP — max 5Mo par image</p>
                        <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
                    </label>
                    {previews.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-3">
                            {previews.map((url, i) => (
                                <div key={i} className="relative h-24 w-24 rounded-lg overflow-hidden border border-tda-silver-200">
                                    <img src={url} alt="" className="h-full w-full object-cover" />
                                    <button type="button" onClick={() => removePreview(i)} className="absolute top-1 right-1 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 7. PUBLICATION */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                    <h3 className="text-base font-semibold text-tda-green-900 mb-4">Publication</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {isEdit && (
                            <div>
                                <label className="block text-sm font-medium text-tda-silver-500 mb-1">Statut</label>
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)}
                                    className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500">
                                    <option value="available">Disponible</option>
                                    <option value="rented">Loué</option>
                                    <option value="sold">Vendu</option>
                                    <option value="unavailable">Indisponible</option>
                                </select>
                            </div>
                        )}
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)}
                                    className="rounded border-tda-silver-300 text-tda-green-600 focus:ring-tda-green-500" />
                                <span className="text-sm text-tda-silver-500">Mettre en avant sur l'accueil</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <Link href="/admin/properties" className="rounded-lg border border-tda-silver-200 bg-white px-5 py-2.5 text-sm font-medium text-tda-silver-500 hover:bg-tda-silver-50 transition">Annuler</Link>
                    <button type="submit" disabled={processing} className="inline-flex items-center gap-2 rounded-lg bg-tda-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-tda-green-700 disabled:opacity-50 transition">
                        <Save className="h-4 w-4" /> {processing ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Enregistrer'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
