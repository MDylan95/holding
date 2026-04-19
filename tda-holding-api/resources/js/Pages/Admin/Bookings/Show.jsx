import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, XCircle, Clock, User, Car, Home, CreditCard, Ban } from 'lucide-react';
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
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between py-2 border-b border-tda-silver-50">
            <span className="text-sm text-tda-silver-500">{label}</span>
            <span className="text-sm font-medium text-tda-green-900">{value || '—'}</span>
        </div>
    );
}

export default function Show({ booking }) {
    const bookable = booking.bookable;
    const isVehicle = booking.bookable_type?.includes('Vehicle');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectError, setRejectError] = useState('');

    function handleAction(action) {
        const messages = { confirm: 'Confirmer cette réservation ?', cancel: 'Annuler cette réservation ?', complete: 'Marquer comme terminée ?' };
        if (confirm(messages[action])) {
            router.post(`/admin/bookings/${booking.id}/${action}`);
        }
    }

    function handleRejectSubmit() {
        if (!rejectReason.trim()) {
            setRejectError('La raison est obligatoire.');
            return;
        }
        router.post(`/admin/bookings/${booking.id}/reject`, { reason: rejectReason.trim() }, {
            onSuccess: () => { setShowRejectModal(false); setRejectReason(''); setRejectError(''); },
        });
    }

    return (
        <>
        <AdminLayout header={`Réservation ${booking.reference}`}>
            <Head title={`Réservation ${booking.reference}`} />

            <div className="mb-4 flex items-center justify-between">
                <Link href="/admin/bookings" className="inline-flex items-center gap-1.5 text-sm text-tda-silver-500 hover:text-tda-green-600 transition">
                    <ArrowLeft className="h-4 w-4" /> Retour
                </Link>
                <div className="flex gap-2">
                    {booking.status === 'pending' && (
                        <>
                            <button onClick={() => handleAction('confirm')} className="inline-flex items-center gap-1.5 rounded-lg bg-tda-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-tda-green-700 transition">
                                <CheckCircle className="h-4 w-4" /> Confirmer
                            </button>
                            <button onClick={() => setShowRejectModal(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition">
                                <Ban className="h-4 w-4" /> Rejeter
                            </button>
                        </>
                    )}
                    {['confirmed', 'in_progress'].includes(booking.status) && (
                        <button onClick={() => handleAction('complete')} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
                            <Clock className="h-4 w-4" /> Terminer
                        </button>
                    )}
                    {!['completed', 'cancelled', 'rejected'].includes(booking.status) && (
                        <button onClick={() => handleAction('cancel')} className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition">
                            <XCircle className="h-4 w-4" /> Annuler
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Booking details */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                    <h3 className="font-semibold text-tda-green-900 mb-4 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-tda-gold-500" /> Détails réservation
                    </h3>
                    <InfoRow label="Référence" value={booking.reference} />
                    <InfoRow label="Statut" value={<StatusBadge status={booking.status} />} />
                    <InfoRow label="Montant total" value={formatCurrency(booking.total_amount)} />
                    <InfoRow label="Acompte" value={formatCurrency(booking.deposit_amount)} />
                    <InfoRow label="Début" value={formatDate(booking.start_date)} />
                    <InfoRow label="Fin" value={formatDate(booking.end_date)} />
                    <InfoRow label="Lieu de prise en charge" value={booking.pickup_location} />
                    <InfoRow label="Lieu de retour" value={booking.return_location} />
                    {booking.notes && <InfoRow label="Notes client" value={booking.notes} />}
                    {booking.cancellation_reason && <InfoRow label="Raison annulation" value={booking.cancellation_reason} />}
                    {booking.rejection_reason && <InfoRow label="Raison rejet" value={booking.rejection_reason} />}
                    {booking.confirmed_by_user && <InfoRow label="Confirmé par" value={`${booking.confirmed_by_user.first_name} ${booking.confirmed_by_user.last_name}`} />}
                    <InfoRow label="Créé le" value={formatDate(booking.created_at)} />
                </div>

                {/* Client */}
                <div className="space-y-6">
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                        <h3 className="font-semibold text-tda-green-900 mb-4 flex items-center gap-2">
                            <User className="h-5 w-5 text-tda-green-600" /> Client
                        </h3>
                        {booking.user && (
                            <>
                                <InfoRow label="Nom" value={`${booking.user.first_name} ${booking.user.last_name}`} />
                                <InfoRow label="Email" value={booking.user.email} />
                                <InfoRow label="Téléphone" value={booking.user.phone} />
                                <InfoRow label="Ville" value={booking.user.city} />
                            </>
                        )}
                    </div>

                    {/* Bookable */}
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                        <h3 className="font-semibold text-tda-green-900 mb-4 flex items-center gap-2">
                            {isVehicle ? <Car className="h-5 w-5 text-blue-600" /> : <Home className="h-5 w-5 text-purple-600" />}
                            {isVehicle ? 'Véhicule' : 'Bien immobilier'}
                        </h3>
                        {bookable && isVehicle && (
                            <>
                                <InfoRow label="Véhicule" value={`${bookable.brand} ${bookable.model}`} />
                                <InfoRow label="Immatriculation" value={bookable.plate_number} />
                                <InfoRow label="Année" value={bookable.year} />
                            </>
                        )}
                        {bookable && !isVehicle && (
                            <>
                                <InfoRow label="Titre" value={bookable.title} />
                                <InfoRow label="Type" value={bookable.property_type} />
                                <InfoRow label="Localisation" value={bookable.location} />
                            </>
                        )}
                    </div>

                    {/* Driver */}
                    {booking.with_driver && booking.driver && (
                        <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                            <h3 className="font-semibold text-tda-green-900 mb-4">Chauffeur</h3>
                            <InfoRow label="Nom" value={`${booking.driver.first_name} ${booking.driver.last_name}`} />
                            <InfoRow label="Téléphone" value={booking.driver.phone} />
                            <InfoRow label="Statut" value={<StatusBadge status={booking.driver.status} />} />
                        </div>
                    )}
                </div>
            </div>

            {/* Transactions */}
            {booking.transactions && booking.transactions.length > 0 && (
                <div className="mt-6 rounded-xl bg-white shadow-sm border border-tda-silver-200">
                    <div className="px-6 py-4 border-b border-tda-silver-200">
                        <h3 className="font-semibold text-tda-green-900">Transactions</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-tda-silver-100 bg-tda-silver-50 text-left">
                                    <th className="px-5 py-3 font-medium text-tda-silver-500">Réf.</th>
                                    <th className="px-5 py-3 font-medium text-tda-silver-500">Montant</th>
                                    <th className="px-5 py-3 font-medium text-tda-silver-500">Mode</th>
                                    <th className="px-5 py-3 font-medium text-tda-silver-500">Type</th>
                                    <th className="px-5 py-3 font-medium text-tda-silver-500">Statut</th>
                                    <th className="px-5 py-3 font-medium text-tda-silver-500">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {booking.transactions.map((txn) => (
                                    <tr key={txn.id} className="border-b border-tda-silver-50">
                                        <td className="px-5 py-3 font-mono text-xs">{txn.reference}</td>
                                        <td className="px-5 py-3 font-medium">{formatCurrency(txn.amount)}</td>
                                        <td className="px-5 py-3 capitalize">{txn.payment_method}</td>
                                        <td className="px-5 py-3 capitalize">{txn.type}</td>
                                        <td className="px-5 py-3"><StatusBadge status={txn.status} /></td>
                                        <td className="px-5 py-3 text-tda-silver-500">{formatDate(txn.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>

        {/* Reject Modal */}
        {showRejectModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                    <h3 className="text-base font-semibold text-tda-green-900 mb-1">Rejeter la réservation</h3>
                    <p className="text-sm text-tda-silver-500 mb-4">Réf. <span className="font-mono font-medium">{booking.reference}</span></p>
                    <label className="block text-xs font-medium text-tda-silver-600 mb-1">Raison du rejet <span className="text-red-500">*</span></label>
                    <textarea
                        value={rejectReason}
                        onChange={(e) => { setRejectReason(e.target.value); setRejectError(''); }}
                        rows={3}
                        placeholder="Ex: Créneau indisponible, document manquant..."
                        className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-orange-400 focus:ring-orange-400"
                    />
                    {rejectError && <p className="mt-1 text-xs text-red-500">{rejectError}</p>}
                    <div className="mt-4 flex justify-end gap-2">
                        <button onClick={() => { setShowRejectModal(false); setRejectReason(''); setRejectError(''); }}
                            className="rounded-lg border border-tda-silver-200 px-4 py-2 text-sm text-tda-silver-600 hover:bg-tda-silver-50 transition">
                            Annuler
                        </button>
                        <button onClick={handleRejectSubmit}
                            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition">
                            Confirmer le rejet
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
