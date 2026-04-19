import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Eye, CalendarCheck, CheckCircle, XCircle, Clock, Ban } from 'lucide-react';
import { useState } from 'react';

function StatusBadge({ status }) {
    const map = {
        pending: { label: 'En attente', cls: 'bg-yellow-100 text-yellow-800' },
        confirmed: { label: 'Confirmé', cls: 'bg-blue-100 text-blue-800' },
        in_progress: { label: 'En cours', cls: 'bg-tda-green-100 text-tda-green-700' },
        completed: { label: 'Terminé', cls: 'bg-green-100 text-green-800' },
        cancelled: { label: 'Annulé', cls: 'bg-red-100 text-red-800' },
        rejected: { label: 'Rejeté', cls: 'bg-orange-100 text-orange-800' },
    };
    const { label, cls } = map[status] || { label: status, cls: 'bg-gray-100 text-gray-800' };
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount || 0);
}

function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
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

function getBookableName(booking) {
    if (!booking.bookable) return '—';
    if (booking.bookable.brand) return `${booking.bookable.brand} ${booking.bookable.model}`;
    if (booking.bookable.title) return booking.bookable.title;
    return '—';
}

function getBookableType(booking) {
    if (!booking.bookable_type) return '—';
    if (booking.bookable_type.includes('Vehicle')) return 'Véhicule';
    if (booking.bookable_type.includes('Property')) return 'Immobilier';
    return '—';
}

export default function Index({ bookings, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    function handleFilter() {
        router.get('/admin/bookings', { search: search || undefined, status: status || undefined }, { preserveState: true, replace: true });
    }

    function handleAction(bookingId, action) {
        const messages = { confirm: 'Confirmer cette réservation ?', cancel: 'Annuler cette réservation ?', complete: 'Marquer comme terminée ?' };
        if (confirm(messages[action])) {
            router.post(`/admin/bookings/${bookingId}/${action}`);
        }
    }

    function handleReject(bookingId) {
        const reason = window.prompt('Raison du rejet (obligatoire) :');
        if (reason === null) return;
        if (!reason.trim()) {
            alert('La raison est obligatoire.');
            return;
        }
        router.post(`/admin/bookings/${bookingId}/reject`, { reason: reason.trim() });
    }

    return (
        <AdminLayout header="Réservations">
            <Head title="Réservations" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-tda-silver-500">{bookings.total} réservation{bookings.total > 1 ? 's' : ''}</p>
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm border border-tda-silver-200 sm:flex-row sm:items-end">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-tda-silver-500 mb-1">Rechercher</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tda-silver-400" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            placeholder="Référence..." className="w-full rounded-lg border-tda-silver-200 pl-10 text-sm focus:border-tda-green-500 focus:ring-tda-green-500" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-tda-silver-500 mb-1">Statut</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500">
                        <option value="">Tous</option>
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmé</option>
                        <option value="in_progress">En cours</option>
                        <option value="completed">Terminé</option>
                        <option value="cancelled">Annulé</option>
                        <option value="rejected">Rejeté</option>
                    </select>
                </div>
                <button onClick={handleFilter} className="rounded-lg bg-tda-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-tda-green-700 transition">Filtrer</button>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm border border-tda-silver-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-tda-silver-100 bg-tda-silver-50 text-left">
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Réf.</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Client</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Bien</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Type</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Dates</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Chauffeur</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Montant</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Statut</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.data && bookings.data.length > 0 ? bookings.data.map((b) => (
                                <tr key={b.id} className="border-b border-tda-silver-50 hover:bg-tda-silver-50 transition">
                                    <td className="px-5 py-3 font-mono text-xs">{b.reference}</td>
                                    <td className="px-5 py-3">{b.user?.first_name} {b.user?.last_name}</td>
                                    <td className="px-5 py-3 font-medium text-tda-green-900">{getBookableName(b)}</td>
                                    <td className="px-5 py-3 text-tda-silver-500">{getBookableType(b)}</td>
                                    <td className="px-5 py-3 text-xs text-tda-silver-500">
                                        {formatDate(b.start_date)}{b.end_date ? ` → ${formatDate(b.end_date)}` : ''}
                                    </td>
                                    <td className="px-5 py-3 text-tda-silver-500">
                                        {b.with_driver && b.driver ? `${b.driver.first_name} ${b.driver.last_name}` : '—'}
                                    </td>
                                    <td className="px-5 py-3 font-medium">{formatCurrency(b.total_amount)}</td>
                                    <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-1">
                                            <Link href={`/admin/bookings/${b.id}`} className="rounded-lg p-1.5 text-tda-silver-400 hover:bg-tda-green-50 hover:text-tda-green-600 transition" title="Détails">
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                            {b.status === 'pending' && (
                                                <>
                                                    <button onClick={() => handleAction(b.id, 'confirm')} className="rounded-lg p-1.5 text-tda-silver-400 hover:bg-green-50 hover:text-green-600 transition" title="Confirmer">
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleReject(b.id)} className="rounded-lg p-1.5 text-tda-silver-400 hover:bg-orange-50 hover:text-orange-600 transition" title="Rejeter">
                                                        <Ban className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                            {['confirmed', 'in_progress'].includes(b.status) && (
                                                <button onClick={() => handleAction(b.id, 'complete')} className="rounded-lg p-1.5 text-tda-silver-400 hover:bg-blue-50 hover:text-blue-600 transition" title="Terminer">
                                                    <Clock className="h-4 w-4" />
                                                </button>
                                            )}
                                            {!['completed', 'cancelled', 'rejected'].includes(b.status) && (
                                                <button onClick={() => handleAction(b.id, 'cancel')} className="rounded-lg p-1.5 text-tda-silver-400 hover:bg-red-50 hover:text-red-600 transition" title="Annuler">
                                                    <XCircle className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="9" className="px-5 py-12 text-center text-tda-silver-400"><CalendarCheck className="mx-auto h-10 w-10 mb-2" /><p>Aucune réservation</p></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-5 py-3 border-t border-tda-silver-100"><Pagination links={bookings.links} /></div>
            </div>
        </AdminLayout>
    );
}
