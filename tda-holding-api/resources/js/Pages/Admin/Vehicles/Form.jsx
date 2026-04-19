import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Save, ArrowLeft, Upload, X } from 'lucide-react';
import { useState } from 'react';

export default function Form({ vehicle, categories }) {
    const isEdit = !!vehicle;

    const [fields, setFields] = useState({
        category_id: vehicle?.category_id || '',
        brand: vehicle?.brand || '',
        model: vehicle?.model || '',
        year: vehicle?.year || '',
        color: vehicle?.color || '',
        plate_number: vehicle?.plate_number || '',
        seats: vehicle?.seats ?? 5,
        transmission: vehicle?.transmission || 'automatic',
        fuel_type: vehicle?.fuel_type || 'essence',
        mileage: vehicle?.mileage || '',
        daily_rate: vehicle?.daily_rate || '',
        sale_price: vehicle?.sale_price || '',
        offer_type: vehicle?.offer_type || 'rent',
        description: vehicle?.description || '',
        location: vehicle?.location || '',
        city: vehicle?.city || '',
        has_ac: vehicle?.has_ac ?? true,
        has_gps: vehicle?.has_gps ?? false,
        is_featured: vehicle?.is_featured ?? false,
        status: vehicle?.status || 'available',
    });
    const [errors, setErrors] = useState({});
    const [imageFiles, setImageFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const set = (key, value) => setFields(prev => ({ ...prev, [key]: value }));

    function handleImages(e) {
        const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo
        const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/heic', 'image/heif'];
        const all = Array.from(e.target.files);
        const rejected = all.filter(f => !ALLOWED.includes(f.type) || f.size > MAX_SIZE);
        if (rejected.length > 0) {
            const names = rejected.map(f => `${f.name} (${f.type || 'type inconnu'}, ${(f.size/1024/1024).toFixed(1)} Mo)`).join('\n');
            alert(`Ces fichiers sont rejetés (format non supporté ou > 10 Mo) :\n${names}`);
        }
        const files = all.filter(f => f instanceof File && f.size > 0 && f.size <= MAX_SIZE && ALLOWED.includes(f.type));
        setImageFiles(files);
        setPreviews(files.map(f => URL.createObjectURL(f)));
    }

    function removePreview(index) {
        URL.revokeObjectURL(previews[index]);
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (!fields.category_id || !fields.brand || !fields.model) {
            alert('Veuillez remplir tous les champs obligatoires : Catégorie, Marque, Modèle');
            return;
        }

        const formData = new FormData();
        formData.append('category_id', fields.category_id);
        formData.append('brand', fields.brand);
        formData.append('model', fields.model);
        if (fields.year)         formData.append('year', fields.year);
        if (fields.color)        formData.append('color', fields.color);
        if (fields.plate_number) formData.append('plate_number', fields.plate_number);
        formData.append('seats', fields.seats || 5);
        formData.append('transmission', fields.transmission || 'automatic');
        formData.append('fuel_type', fields.fuel_type || 'essence');
        if (fields.mileage)     formData.append('mileage', fields.mileage);
        if (fields.daily_rate)  formData.append('daily_rate', fields.daily_rate);
        if (fields.sale_price)  formData.append('sale_price', fields.sale_price);
        formData.append('offer_type', fields.offer_type || 'rent');
        if (fields.description) formData.append('description', fields.description);
        if (fields.location)    formData.append('location', fields.location);
        if (fields.city)        formData.append('city', fields.city);
        formData.append('has_ac', fields.has_ac ? 1 : 0);
        formData.append('has_gps', fields.has_gps ? 1 : 0);
        formData.append('is_featured', fields.is_featured ? 1 : 0);
        if (isEdit) formData.append('status', fields.status || 'available');

        imageFiles.forEach(file => formData.append('images[]', file));

        if (isEdit) formData.append('_method', 'PUT');

        setSubmitting(true);
        setErrors({});
        router.post(
            isEdit ? `/admin/vehicles/${vehicle.id}` : '/admin/vehicles',
            formData,
            {
                forceFormData: true,
                onError: (errs) => { setErrors(errs); setSubmitting(false); },
                onFinish: () => setSubmitting(false),
            }
        );
    }

    function InputError({ message }) {
        return message ? <p className="mt-1 text-xs text-red-600">{message}</p> : null;
    }

    return (
        <AdminLayout header={isEdit ? `Modifier — ${vehicle.brand} ${vehicle.model}` : 'Ajouter un véhicule'}>
            <Head title={isEdit ? 'Modifier véhicule' : 'Ajouter véhicule'} />

            <div className="mb-4">
                <Link
                    href="/admin/vehicles"
                    className="inline-flex items-center gap-1.5 text-sm text-tda-silver-500 hover:text-tda-green-600 transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour à la liste
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Infos principales */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                    <h3 className="text-base font-semibold text-tda-green-900 mb-4">Informations du véhicule</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Catégorie *</label>
                            <select
                                value={fields.category_id}
                                onChange={(e) => set('category_id', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                            >
                                <option value="">Sélectionner...</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.category_id} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Marque *</label>
                            <input
                                type="text"
                                value={fields.brand}
                                onChange={(e) => set('brand', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                                placeholder="Ex: Toyota"
                            />
                            <InputError message={errors.brand} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Modèle *</label>
                            <input
                                type="text"
                                value={fields.model}
                                onChange={(e) => set('model', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                                placeholder="Ex: Land Cruiser"
                            />
                            <InputError message={errors.model} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Année</label>
                            <input
                                type="number"
                                value={fields.year}
                                onChange={(e) => set('year', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                                placeholder="2024"
                            />
                            <InputError message={errors.year} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Couleur</label>
                            <input
                                type="text"
                                value={fields.color}
                                onChange={(e) => set('color', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                                placeholder="Noir"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Immatriculation</label>
                            <input
                                type="text"
                                value={fields.plate_number}
                                onChange={(e) => set('plate_number', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                                placeholder="AB-1234-CD"
                            />
                            <InputError message={errors.plate_number} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Places</label>
                            <input
                                type="number"
                                value={fields.seats}
                                onChange={(e) => set('seats', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Transmission</label>
                            <select
                                value={fields.transmission}
                                onChange={(e) => set('transmission', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                            >
                                <option value="automatic">Automatique</option>
                                <option value="manual">Manuelle</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Carburant</label>
                            <select
                                value={fields.fuel_type}
                                onChange={(e) => set('fuel_type', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                            >
                                <option value="essence">Essence</option>
                                <option value="diesel">Diesel</option>
                                <option value="electric">Électrique</option>
                                <option value="hybrid">Hybride</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Kilométrage</label>
                            <input
                                type="number"
                                value={fields.mileage}
                                onChange={(e) => set('mileage', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Prix & Offre */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                    <h3 className="text-base font-semibold text-tda-green-900 mb-4">Tarification</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Type d'offre</label>
                            <select
                                value={fields.offer_type}
                                onChange={(e) => set('offer_type', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                            >
                                <option value="rent">Location</option>
                                <option value="sale">Vente</option>
                                <option value="both">Location & Vente</option>
                            </select>
                        </div>
                        {(fields.offer_type === 'rent' || fields.offer_type === 'both') && (
                            <div>
                                <label className="block text-sm font-medium text-tda-silver-500 mb-1">Tarif / jour (FCFA)</label>
                                <input
                                    type="number"
                                    value={fields.daily_rate}
                                    onChange={(e) => set('daily_rate', e.target.value)}
                                    className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                                    placeholder="50000"
                                />
                                <InputError message={errors.daily_rate} />
                            </div>
                        )}
                        {(fields.offer_type === 'sale' || fields.offer_type === 'both') && (
                            <div>
                                <label className="block text-sm font-medium text-tda-silver-500 mb-1">Prix de vente (FCFA)</label>
                                <input
                                    type="number"
                                    value={fields.sale_price}
                                    onChange={(e) => set('sale_price', e.target.value)}
                                    className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                                    placeholder="15000000"
                                />
                                <InputError message={errors.sale_price} />
                            </div>
                        )}
                        {isEdit && (
                            <div>
                                <label className="block text-sm font-medium text-tda-silver-500 mb-1">Statut</label>
                                <select
                                    value={fields.status}
                                    onChange={(e) => set('status', e.target.value)}
                                    className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                                >
                                    <option value="available">Disponible</option>
                                    <option value="rented">Loué</option>
                                    <option value="sold">Vendu</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="unavailable">Indisponible</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Localisation */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                    <h3 className="text-base font-semibold text-tda-green-900 mb-4">Localisation & Description</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Localisation</label>
                            <input
                                type="text"
                                value={fields.location}
                                onChange={(e) => set('location', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                                placeholder="Cocody, Angré"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Ville</label>
                            <input
                                type="text"
                                value={fields.city}
                                onChange={(e) => set('city', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                                placeholder="Abidjan"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-tda-silver-500 mb-1">Description</label>
                        <textarea
                            value={fields.description}
                            onChange={(e) => set('description', e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                            placeholder="Décrivez le véhicule..."
                        />
                    </div>
                </div>

                {/* Options */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                    <h3 className="text-base font-semibold text-tda-green-900 mb-4">Options</h3>
                    <div className="flex flex-wrap gap-6">
                        {[
                            { key: 'has_ac', label: 'Climatisation' },
                            { key: 'has_gps', label: 'GPS' },
                            { key: 'is_featured', label: 'Mis en avant' },
                        ].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={fields[key]}
                                    onChange={(e) => set(key, e.target.checked)}
                                    className="rounded border-tda-silver-300 text-tda-green-600 focus:ring-tda-green-500"
                                />
                                <span className="text-sm text-tda-silver-500">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Photos */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                    <h3 className="text-base font-semibold text-tda-green-900 mb-4">Photos</h3>

                    {/* Existing media for edit */}
                    {isEdit && vehicle.media && vehicle.media.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs text-tda-silver-400 mb-2">Photos existantes</p>
                            <div className="flex flex-wrap gap-3">
                                {vehicle.media.map((m) => (
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
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImages}
                            className="hidden"
                        />
                    </label>

                    {previews.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-3">
                            {previews.map((url, i) => (
                                <div key={i} className="relative h-24 w-24 rounded-lg overflow-hidden border border-tda-silver-200">
                                    <img src={url} alt="" className="h-full w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removePreview(i)}
                                        className="absolute top-1 right-1 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3">
                    <Link
                        href="/admin/vehicles"
                        className="rounded-lg border border-tda-silver-200 bg-white px-5 py-2.5 text-sm font-medium text-tda-silver-500 hover:bg-tda-silver-50 transition"
                    >
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-tda-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-tda-green-700 disabled:opacity-50 transition"
                    >
                        <Save className="h-4 w-4" />
                        {submitting ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Enregistrer'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
