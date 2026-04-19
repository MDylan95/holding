import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Edit, Trash2, Car, Eye } from 'lucide-react';
import { useState } from 'react';

function StatusBadge({ status }) {
    const map = {
        available: { label: 'Disponible', cls: 'bg-green-100 text-green-800' },
        rented: { label: 'Loué', cls: 'bg-blue-100 text-blue-800' },
        sold: { label: 'Vendu', cls: 'bg-purple-100 text-purple-800' },
        maintenance: { label: 'Maintenance', cls: 'bg-yellow-100 text-yellow-800' },
        unavailable: { label: 'Indisponible', cls: 'bg-red-100 text-red-800' },
    };
    const { label, cls } = map[status] || { label: status, cls: 'bg-gray-100 text-gray-800' };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
            {label}
        </span>
    );
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount || 0);
}

function Pagination({ links }) {
    if (!links || links.length <= 3) return null;
    return (
        <div className="flex items-center justify-center gap-1 mt-4">
            {links.map((link, i) => (
                <Link
                    key={i}
                    href={link.url || '#'}
                    className={`px-3 py-1.5 text-sm rounded-lg transition ${
                        link.active
                            ? 'bg-tda-green-600 text-white'
                            : link.url
                              ? 'bg-white text-tda-silver-500 hover:bg-tda-silver-100 border border-tda-silver-200'
                              : 'bg-tda-silver-100 text-tda-silver-300 cursor-not-allowed'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    preserveScroll
                />
            ))}
        </div>
    );
}

export default function Index({ vehicles, categories, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');

    function handleFilter() {
        router.get('/admin/vehicles', {
            search: search || undefined,
            status: status || undefined,
            category_id: categoryId || undefined,
        }, { preserveState: true, replace: true });
    }

    function handleDelete(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
            router.delete(`/admin/vehicles/${id}`);
        }
    }

    return (
        <AdminLayout header="Véhicules">
            <Head title="Véhicules" />

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-tda-silver-500">
                    {vehicles.total} véhicule{vehicles.total > 1 ? 's' : ''} au total
                </p>
                <Link
                    href="/admin/vehicles/create"
                    className="inline-flex items-center gap-2 rounded-lg bg-tda-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-tda-green-700 transition"
                >
                    <Plus className="h-4 w-4" />
                    Ajouter un véhicule
                </Link>
            </div>

            {/* Filters */}
            <div className="mt-4 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm border border-tda-silver-200 sm:flex-row sm:items-end">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-tda-silver-500 mb-1">Rechercher</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tda-silver-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            placeholder="Marque, modèle, immatriculation..."
                            className="w-full rounded-lg border-tda-silver-200 pl-10 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-tda-silver-500 mb-1">Statut</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                    >
                        <option value="">Tous</option>
                        <option value="available">Disponible</option>
                        <option value="rented">Loué</option>
                        <option value="sold">Vendu</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-tda-silver-500 mb-1">Catégorie</label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                    >
                        <option value="">Toutes</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleFilter}
                    className="rounded-lg bg-tda-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-tda-green-700 transition"
                >
                    Filtrer
                </button>
            </div>

            {/* Table */}
            <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm border border-tda-silver-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-tda-silver-100 bg-tda-silver-50 text-left">
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Véhicule</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Catégorie</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Tarif/jour</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Prix vente</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Offre</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Statut</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.data && vehicles.data.length > 0 ? (
                                vehicles.data.map((v) => (
                                    <tr key={v.id} className="border-b border-tda-silver-50 hover:bg-tda-silver-50 transition">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tda-green-100">
                                                    <Car className="h-5 w-5 text-tda-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-tda-green-900">{v.brand} {v.model}</p>
                                                    <p className="text-xs text-tda-silver-400">
                                                        {v.plate_number || 'N/A'} · {v.year || '—'} · {v.color || '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-tda-silver-500">{v.category?.name || '—'}</td>
                                        <td className="px-5 py-3 font-medium">{v.daily_rate ? formatCurrency(v.daily_rate) : '—'}</td>
                                        <td className="px-5 py-3 font-medium">{v.sale_price ? formatCurrency(v.sale_price) : '—'}</td>
                                        <td className="px-5 py-3 capitalize text-tda-silver-500">
                                            {v.offer_type === 'rent' ? 'Location' : v.offer_type === 'sale' ? 'Vente' : 'Les deux'}
                                        </td>
                                        <td className="px-5 py-3"><StatusBadge status={v.status} /></td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/vehicles/${v.id}/edit`}
                                                    className="rounded-lg p-1.5 text-tda-silver-400 hover:bg-tda-green-50 hover:text-tda-green-600 transition"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(v.id)}
                                                    className="rounded-lg p-1.5 text-tda-silver-400 hover:bg-red-50 hover:text-red-600 transition"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-5 py-12 text-center text-tda-silver-400">
                                        <Car className="mx-auto h-10 w-10 mb-2" />
                                        <p>Aucun véhicule trouvé</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-5 py-3 border-t border-tda-silver-100">
                    <Pagination links={vehicles.links} />
                </div>
            </div>
        </AdminLayout>
    );
}
