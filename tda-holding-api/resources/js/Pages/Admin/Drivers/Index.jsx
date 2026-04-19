import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Edit, Trash2, Users, Phone, Car } from 'lucide-react';
import { useState } from 'react';

function StatusBadge({ status }) {
    const map = {
        available: { label: 'Disponible', cls: 'bg-green-100 text-green-800' },
        on_mission: { label: 'En mission', cls: 'bg-blue-100 text-blue-800' },
        off_duty: { label: 'Repos', cls: 'bg-yellow-100 text-yellow-800' },
        unavailable: { label: 'Indisponible', cls: 'bg-red-100 text-red-800' },
    };
    const { label, cls } = map[status] || { label: status, cls: 'bg-gray-100 text-gray-800' };
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

function Pagination({ links }) {
    if (!links || links.length <= 3) return null;
    return (
        <div className="flex items-center justify-center gap-1 mt-4">
            {links.map((link, i) => (
                <Link key={i} href={link.url || '#'}
                    className={`px-3 py-1.5 text-sm rounded-lg transition ${link.active ? 'bg-tda-green-600 text-white' : link.url ? 'bg-white text-tda-silver-500 hover:bg-tda-silver-100 border border-tda-silver-200' : 'bg-tda-silver-100 text-tda-silver-300 cursor-not-allowed'}`}
                    dangerouslySetInnerHTML={{ __html: link.label }} preserveScroll />
            ))}
        </div>
    );
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount || 0);
}

export default function Index({ drivers, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    function handleFilter() {
        router.get('/admin/drivers', { search: search || undefined, status: status || undefined }, { preserveState: true, replace: true });
    }

    function handleDelete(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) {
            router.delete(`/admin/drivers/${id}`);
        }
    }

    return (
        <AdminLayout header="Chauffeurs">
            <Head title="Chauffeurs" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-tda-silver-500">{drivers.total} chauffeur{drivers.total > 1 ? 's' : ''}</p>
                <Link href="/admin/drivers/create" className="inline-flex items-center gap-2 rounded-lg bg-tda-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-tda-green-700 transition">
                    <Plus className="h-4 w-4" /> Ajouter un chauffeur
                </Link>
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm border border-tda-silver-200 sm:flex-row sm:items-end">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-tda-silver-500 mb-1">Rechercher</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tda-silver-400" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            placeholder="Nom, téléphone..." className="w-full rounded-lg border-tda-silver-200 pl-10 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-tda-silver-500 mb-1">Statut</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500">
                        <option value="">Tous</option>
                        <option value="available">Disponible</option>
                        <option value="on_mission">En mission</option>
                        <option value="off_duty">Repos</option>
                        <option value="unavailable">Indisponible</option>
                    </select>
                </div>
                <button onClick={handleFilter} className="rounded-lg bg-tda-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-tda-green-700 transition">Filtrer</button>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm border border-tda-silver-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-tda-silver-100 bg-tda-silver-50 text-left">
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Chauffeur</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Téléphone</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Permis</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Véhicule assigné</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Tarif/jour</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Expérience</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Statut</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.data && drivers.data.length > 0 ? drivers.data.map((d) => (
                                <tr key={d.id} className="border-b border-tda-silver-50 hover:bg-tda-silver-50 transition">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-tda-gold-100 text-tda-gold-700 text-xs font-bold">
                                                {d.first_name?.[0]}{d.last_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-tda-green-900">{d.first_name} {d.last_name}</p>
                                                <p className="text-xs text-tda-silver-400">{d.city || '—'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-tda-silver-500">
                                        <div className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{d.phone}</div>
                                    </td>
                                    <td className="px-5 py-3 font-mono text-xs text-tda-silver-500">{d.license_number}</td>
                                    <td className="px-5 py-3 text-tda-silver-500">
                                        {d.assigned_vehicle ? (
                                            <div className="flex items-center gap-1"><Car className="h-3.5 w-3.5" />{d.assigned_vehicle.brand} {d.assigned_vehicle.model}</div>
                                        ) : <span className="text-tda-silver-300">—</span>}
                                    </td>
                                    <td className="px-5 py-3 font-medium">{formatCurrency(d.daily_rate)}</td>
                                    <td className="px-5 py-3 text-tda-silver-500">{d.experience_years} an{d.experience_years > 1 ? 's' : ''}</td>
                                    <td className="px-5 py-3"><StatusBadge status={d.status} /></td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/drivers/${d.id}/edit`} className="rounded-lg p-1.5 text-tda-silver-400 hover:bg-tda-green-50 hover:text-tda-green-600 transition"><Edit className="h-4 w-4" /></Link>
                                            <button onClick={() => handleDelete(d.id)} className="rounded-lg p-1.5 text-tda-silver-400 hover:bg-red-50 hover:text-red-600 transition"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="8" className="px-5 py-12 text-center text-tda-silver-400"><Users className="mx-auto h-10 w-10 mb-2" /><p>Aucun chauffeur trouvé</p></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-5 py-3 border-t border-tda-silver-100"><Pagination links={drivers.links} /></div>
            </div>
        </AdminLayout>
    );
}
