import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Eye, Trash2, Calendar, User, Car } from 'lucide-react';
import { useState } from 'react';

const statusLabels = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    cancelled: 'Annulé',
    completed: 'Complété',
};

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
};

export default function Index({ appointments, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    function handleFilter() {
        router.get('/admin/appointments', {
            search: search || undefined,
            status: status || undefined,
        }, { preserveState: true, replace: true });
    }

    function handleDelete(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
            router.delete(`/admin/appointments/${id}`);
        }
    }

    return (
        <AdminLayout header="Rendez-vous">
            <Head title="Rendez-vous" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-tda-silver-500">{appointments.total} rendez-vous au total</p>
            </div>

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
                            placeholder="Nom, email, véhicule..."
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
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmé</option>
                        <option value="completed">Complété</option>
                        <option value="cancelled">Annulé</option>
                    </select>
                </div>
                <button
                    onClick={handleFilter}
                    className="rounded-lg bg-tda-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-tda-green-700 transition"
                >
                    Filtrer
                </button>
            </div>

            <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm border border-tda-silver-200">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-tda-silver-200 bg-tda-silver-50">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-tda-silver-700">Client</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-tda-silver-700">Véhicule</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-tda-silver-700">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-tda-silver-700">Statut</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-tda-silver-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-tda-silver-200">
                        {appointments.data.map((apt) => (
                            <tr key={apt.id} className="hover:bg-tda-silver-50 transition">
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-tda-silver-400" />
                                        <div>
                                            <p className="font-medium text-tda-green-900">{apt.user.full_name}</p>
                                            <p className="text-xs text-tda-silver-500">{apt.user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Car className="h-4 w-4 text-tda-silver-400" />
                                        <span className="text-tda-green-900">{apt.vehicle.brand} {apt.vehicle.model}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-tda-silver-400" />
                                        <span className="text-tda-green-900">{new Date(apt.appointment_date).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[apt.status]}`}>
                                        {statusLabels[apt.status]}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/admin/appointments/${apt.id}`}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-tda-green-50 px-3 py-1.5 text-xs font-medium text-tda-green-600 hover:bg-tda-green-100 transition"
                                        >
                                            <Eye className="h-3.5 w-3.5" /> Voir
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(apt.id)}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {appointments.data.length === 0 && (
                <div className="mt-6 rounded-xl bg-white p-12 text-center shadow-sm border border-tda-silver-200">
                    <Calendar className="mx-auto h-12 w-12 text-tda-silver-300 mb-3" />
                    <p className="text-tda-silver-600">Aucun rendez-vous trouvé</p>
                </div>
            )}

            {appointments.last_page > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    {appointments.prev_page_url && (
                        <Link href={appointments.prev_page_url} className="text-sm text-tda-green-600 hover:text-tda-green-700">
                            ← Précédent
                        </Link>
                    )}
                    <span className="text-sm text-tda-silver-600">
                        Page {appointments.current_page} sur {appointments.last_page}
                    </span>
                    {appointments.next_page_url && (
                        <Link href={appointments.next_page_url} className="text-sm text-tda-green-600 hover:text-tda-green-700">
                            Suivant →
                        </Link>
                    )}
                </div>
            )}
        </AdminLayout>
    );
}
