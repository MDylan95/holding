import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft, Upload, X, User } from 'lucide-react';
import { useState } from 'react';

export default function Form({ driver, vehicles }) {
    const isEdit = !!driver;
    const { data, setData, post, put, processing, errors } = useForm({
        first_name: driver?.first_name || '',
        last_name: driver?.last_name || '',
        phone: driver?.phone || '',
        email: driver?.email || '',
        license_number: driver?.license_number || '',
        license_expiry: driver?.license_expiry || '',
        address: driver?.address || '',
        city: driver?.city || '',
        experience_years: driver?.experience_years || 0,
        daily_rate: driver?.daily_rate || 0,
        assigned_vehicle_id: driver?.assigned_vehicle_id || '',
        status: driver?.status || 'available',
        notes: driver?.notes || '',
        avatar: null,
    });

    const [avatarPreview, setAvatarPreview] = useState(driver?.avatar ? `/storage/${driver.avatar}` : null);

    function handleAvatar(e) {
        const file = e.target.files[0];
        if (!file) return;
        setData('avatar', file);
        setAvatarPreview(URL.createObjectURL(file));
    }

    function removeAvatar() {
        setData('avatar', null);
        setAvatarPreview(null);
    }

    function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append('first_name', data.first_name);
        formData.append('last_name', data.last_name);
        formData.append('phone', data.phone);
        formData.append('email', data.email || '');
        formData.append('license_number', data.license_number);
        formData.append('license_expiry', data.license_expiry || '');
        formData.append('address', data.address || '');
        formData.append('city', data.city || '');
        formData.append('experience_years', data.experience_years || 0);
        formData.append('daily_rate', data.daily_rate || 0);
        formData.append('assigned_vehicle_id', data.assigned_vehicle_id || '');
        formData.append('status', data.status);
        formData.append('notes', data.notes || '');
        if (data.avatar) formData.append('avatar', data.avatar);
        if (isEdit) {
            formData.append('_method', 'PUT');
            put(`/admin/drivers/${driver.id}`, formData);
        } else {
            post('/admin/drivers', formData);
        }
    }

    function InputError({ message }) {
        return message ? <p className="mt-1 text-xs text-red-600">{message}</p> : null;
    }

    return (
        <AdminLayout header={isEdit ? `Modifier — ${driver.first_name} ${driver.last_name}` : 'Ajouter un chauffeur'}>
            <Head title={isEdit ? 'Modifier chauffeur' : 'Ajouter chauffeur'} />

            <div className="mb-4">
                <Link href="/admin/drivers" className="inline-flex items-center gap-1.5 text-sm text-tda-silver-500 hover:text-tda-green-600 transition">
                    <ArrowLeft className="h-4 w-4" /> Retour à la liste
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* ── Photo de profil ── */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                    <h3 className="text-base font-semibold text-tda-green-900 mb-4">Photo de profil</h3>
                    <div className="flex items-center gap-6">
                        {/* Preview */}
                        <div className="relative flex-shrink-0">
                            {avatarPreview ? (
                                <div className="relative h-24 w-24">
                                    <img src={avatarPreview} alt="Avatar" className="h-24 w-24 rounded-full object-cover border-2 border-tda-silver-200" />
                                    <button type="button" onClick={removeAvatar}
                                        className="absolute -top-1 -right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 shadow">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="h-24 w-24 rounded-full bg-tda-silver-100 border-2 border-dashed border-tda-silver-300 flex items-center justify-center">
                                    <User className="h-10 w-10 text-tda-silver-400" />
                                </div>
                            )}
                        </div>
                        {/* Upload button */}
                        <div>
                            <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-tda-silver-200 bg-white px-4 py-2.5 text-sm font-medium text-tda-silver-600 hover:bg-tda-silver-50 hover:border-tda-green-400 transition">
                                <Upload className="h-4 w-4" />
                                {avatarPreview ? 'Changer la photo' : 'Ajouter une photo'}
                                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatar} className="hidden" />
                            </label>
                            <p className="mt-1.5 text-xs text-tda-silver-400">JPG, PNG, WebP — max 2 Mo</p>
                            <InputError message={errors.avatar} />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                    <h3 className="text-base font-semibold text-tda-green-900 mb-4">Informations personnelles</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Prénom *</label>
                            <input type="text" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" />
                            <InputError message={errors.first_name} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Nom *</label>
                            <input type="text" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" />
                            <InputError message={errors.last_name} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Téléphone *</label>
                            <input type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" placeholder="+225 07 00 00 00 00" />
                            <InputError message={errors.phone} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Email</label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Adresse</label>
                            <input type="text" value={data.address} onChange={(e) => setData('address', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Ville</label>
                            <input type="text" value={data.city} onChange={(e) => setData('city', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" placeholder="Abidjan" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                    <h3 className="text-base font-semibold text-tda-green-900 mb-4">Informations professionnelles</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">N° de permis *</label>
                            <input type="text" value={data.license_number} onChange={(e) => setData('license_number', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" />
                            <InputError message={errors.license_number} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Expiration permis</label>
                            <input type="date" value={data.license_expiry} onChange={(e) => setData('license_expiry', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Expérience (années)</label>
                            <input type="number" value={data.experience_years} onChange={(e) => setData('experience_years', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" min="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Tarif / jour (FCFA)</label>
                            <input type="number" value={data.daily_rate} onChange={(e) => setData('daily_rate', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" min="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-tda-silver-500 mb-1">Véhicule assigné</label>
                            <select value={data.assigned_vehicle_id} onChange={(e) => setData('assigned_vehicle_id', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500">
                                <option value="">Aucun</option>
                                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate_number || 'N/A'})</option>)}
                            </select>
                        </div>
                        {isEdit && (
                            <div>
                                <label className="block text-sm font-medium text-tda-silver-500 mb-1">Statut</label>
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)}
                                    className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500">
                                    <option value="available">Disponible</option>
                                    <option value="on_mission">En mission</option>
                                    <option value="off_duty">Repos</option>
                                    <option value="unavailable">Indisponible</option>
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-tda-silver-500 mb-1">Notes</label>
                        <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={3}
                            className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" placeholder="Notes internes..." />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <Link href="/admin/drivers" className="rounded-lg border border-tda-silver-200 bg-white px-5 py-2.5 text-sm font-medium text-tda-silver-500 hover:bg-tda-silver-50 transition">Annuler</Link>
                    <button type="submit" disabled={processing} className="inline-flex items-center gap-2 rounded-lg bg-tda-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-tda-green-700 disabled:opacity-50 transition">
                        <Save className="h-4 w-4" /> {processing ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Enregistrer'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
