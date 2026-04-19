import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, FolderOpen, X, Save } from 'lucide-react';
import { useState } from 'react';

const typeLabels = { vehicle: 'Véhicule', property: 'Immobilier', service: 'Service' };
const typeColors = {
    vehicle: 'bg-blue-100 text-blue-800',
    property: 'bg-purple-100 text-purple-800',
    service: 'bg-tda-gold-100 text-tda-gold-700',
};

export default function Index({ categories, filters }) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [typeFilter, setTypeFilter] = useState(filters.type || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        type: 'vehicle',
        description: '',
        is_active: true,
        sort_order: 0,
    });

    function openCreate() {
        reset();
        setEditingId(null);
        setShowForm(true);
    }

    function openEdit(cat) {
        setData({ name: cat.name, type: cat.type, description: cat.description || '', is_active: cat.is_active, sort_order: cat.sort_order || 0 });
        setEditingId(cat.id);
        setShowForm(true);
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (editingId) {
            put(`/admin/categories/${editingId}`, { onSuccess: () => { setShowForm(false); reset(); setEditingId(null); } });
        } else {
            post('/admin/categories', { onSuccess: () => { setShowForm(false); reset(); } });
        }
    }

    function handleDelete(id) {
        if (confirm('Supprimer cette catégorie ?')) {
            router.delete(`/admin/categories/${id}`);
        }
    }

    function handleFilter(type) {
        setTypeFilter(type);
        router.get('/admin/categories', { type: type || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AdminLayout header="Catégories">
            <Head title="Catégories" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    {['', 'vehicle', 'property', 'service'].map((t) => (
                        <button key={t} onClick={() => handleFilter(t)}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${typeFilter === t ? 'bg-tda-green-600 text-white' : 'bg-white text-tda-silver-500 border border-tda-silver-200 hover:bg-tda-silver-50'}`}>
                            {t === '' ? 'Toutes' : typeLabels[t]}
                        </button>
                    ))}
                </div>
                <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-tda-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-tda-green-700 transition">
                    <Plus className="h-4 w-4" /> Ajouter
                </button>
            </div>

            {/* Inline form */}
            {showForm && (
                <div className="mt-4 rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-tda-green-900">
                            {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                        </h3>
                        <button onClick={() => { setShowForm(false); reset(); setEditingId(null); }} className="text-tda-silver-400 hover:text-tda-silver-500">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
                        <div>
                            <label className="block text-xs font-medium text-tda-silver-500 mb-1">Nom *</label>
                            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-tda-silver-500 mb-1">Type *</label>
                            <select value={data.type} onChange={(e) => setData('type', e.target.value)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500">
                                <option value="vehicle">Véhicule</option>
                                <option value="property">Immobilier</option>
                                <option value="service">Service</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-tda-silver-500 mb-1">Ordre</label>
                            <input type="number" value={data.sort_order} onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" min="0" />
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-tda-silver-300 text-tda-green-600 focus:ring-tda-green-500" />
                                <span className="text-sm text-tda-silver-500">Active</span>
                            </label>
                            <button type="submit" disabled={processing}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-tda-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-tda-green-700 disabled:opacity-50 transition">
                                <Save className="h-4 w-4" /> {editingId ? 'Modifier' : 'Créer'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm border border-tda-silver-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-tda-silver-100 bg-tda-silver-50 text-left">
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Nom</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Slug</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Type</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Ordre</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Statut</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories && categories.length > 0 ? categories.map((cat) => (
                                <tr key={cat.id} className="border-b border-tda-silver-50 hover:bg-tda-silver-50 transition">
                                    <td className="px-5 py-3 font-medium text-tda-green-900">{cat.name}</td>
                                    <td className="px-5 py-3 font-mono text-xs text-tda-silver-400">{cat.slug}</td>
                                    <td className="px-5 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[cat.type] || 'bg-gray-100 text-gray-800'}`}>
                                            {typeLabels[cat.type] || cat.type}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-tda-silver-500">{cat.sort_order}</td>
                                    <td className="px-5 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {cat.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(cat)} className="rounded-lg p-1.5 text-tda-silver-400 hover:bg-tda-green-50 hover:text-tda-green-600 transition">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(cat.id)} className="rounded-lg p-1.5 text-tda-silver-400 hover:bg-red-50 hover:text-red-600 transition">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="px-5 py-12 text-center text-tda-silver-400"><FolderOpen className="mx-auto h-10 w-10 mb-2" /><p>Aucune catégorie</p></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
