import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, CreditCard, CheckCircle, Clock, X, Banknote, Smartphone, Building2 } from 'lucide-react';
import { useState } from 'react';

function StatusBadge({ status }) {
    const map = {
        pending:   { label: 'En attente', cls: 'bg-yellow-100 text-yellow-800' },
        confirmed: { label: 'Confirmé',   cls: 'bg-blue-100 text-blue-800' },
        completed: { label: 'Terminé',    cls: 'bg-green-100 text-green-800' },
        failed:    { label: 'Échoué',     cls: 'bg-red-100 text-red-800' },
        refunded:  { label: 'Remboursé',  cls: 'bg-purple-100 text-purple-800' },
    };
    const { label, cls } = map[status] || { label: status, cls: 'bg-gray-100 text-gray-800' };
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount || 0);
}

function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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

const PAYMENT_METHODS = [
    { value: 'cash',          label: 'Espèces',      Icon: Banknote },
    { value: 'mobile_money',  label: 'Mobile Money', Icon: Smartphone },
    { value: 'bank_transfer', label: 'Virement',     Icon: Building2 },
];

const paymentMethodLabels = { cash: 'Espèces', mobile_money: 'Mobile Money', bank_transfer: 'Virement', card: 'Carte' };
const transactionTypes    = { deposit: 'Acompte', full_payment: 'Paiement complet', balance: 'Solde', refund: 'Remboursement' };

function ConfirmPaymentModal({ transaction, onClose, onConfirm }) {
    const [selected, setSelected] = useState('cash');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-semibold text-tda-green-900">Confirmer le paiement</h3>
                    <button onClick={onClose} className="rounded-lg p-1 text-tda-silver-400 hover:bg-tda-silver-100 transition">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="mb-5 rounded-lg bg-tda-silver-50 p-3 text-sm">
                    <p className="text-tda-silver-500">Référence</p>
                    <p className="font-mono font-semibold text-tda-green-900">{transaction.reference}</p>
                    <p className="mt-1 text-tda-silver-500">Montant</p>
                    <p className="text-lg font-bold text-tda-green-700">{formatCurrency(transaction.amount)}</p>
                </div>

                <p className="mb-3 text-sm font-medium text-tda-silver-600">Mode de paiement reçu</p>
                <div className="grid grid-cols-3 gap-2 mb-6">
                    {PAYMENT_METHODS.map(({ value, label, Icon }) => (
                        <button key={value} type="button" onClick={() => setSelected(value)}
                            className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-xs font-medium transition
                                ${selected === value
                                    ? 'border-tda-green-600 bg-tda-green-50 text-tda-green-700'
                                    : 'border-tda-silver-200 bg-white text-tda-silver-500 hover:border-tda-green-300'}`}>
                            <Icon className="h-5 w-5" />
                            {label}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 rounded-lg border border-tda-silver-200 py-2.5 text-sm font-medium text-tda-silver-500 hover:bg-tda-silver-50 transition">
                        Annuler
                    </button>
                    <button onClick={() => onConfirm(transaction.id, selected)}
                        className="flex-1 rounded-lg bg-tda-green-600 py-2.5 text-sm font-medium text-white hover:bg-tda-green-700 transition">
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Index({ transactions, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || '');
    const [confirmModal, setConfirmModal] = useState(null);

    function handleFilter() {
        router.get('/admin/transactions', {
            search: search || undefined, status: status || undefined, payment_method: paymentMethod || undefined,
        }, { preserveState: true, replace: true });
    }

    function handleConfirm(txnId, method) {
        router.post(`/admin/transactions/${txnId}/confirm`, { payment_method: method }, {
            onSuccess: () => setConfirmModal(null),
        });
    }

    function handleComplete(txnId) {
        if (confirm('Marquer cette transaction comme terminée ?')) {
            router.post(`/admin/transactions/${txnId}/complete`);
        }
    }

    return (
        <AdminLayout header="Transactions">
            <Head title="Transactions" />

            {confirmModal && (
                <ConfirmPaymentModal
                    transaction={confirmModal}
                    onClose={() => setConfirmModal(null)}
                    onConfirm={handleConfirm}
                />
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-tda-silver-500">{transactions.total} transaction{transactions.total > 1 ? 's' : ''}</p>
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
                        <option value="completed">Terminé</option>
                        <option value="failed">Échoué</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-tda-silver-500 mb-1">Mode</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500">
                        <option value="">Tous</option>
                        {Object.entries(paymentMethodLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
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
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Réservation</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Montant</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Type</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Mode</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Statut</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Date</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.data && transactions.data.length > 0 ? transactions.data.map((t) => (
                                <tr key={t.id} className="border-b border-tda-silver-50 hover:bg-tda-silver-50 transition">
                                    <td className="px-5 py-3 font-mono text-xs">{t.reference}</td>
                                    <td className="px-5 py-3">{t.user?.first_name} {t.user?.last_name}</td>
                                    <td className="px-5 py-3">
                                        {t.booking ? (
                                            <Link href={`/admin/bookings/${t.booking.id}`} className="text-tda-green-600 hover:underline font-mono text-xs">
                                                {t.booking.reference}
                                            </Link>
                                        ) : '—'}
                                    </td>
                                    <td className="px-5 py-3 font-bold text-tda-green-900">{formatCurrency(t.amount)}</td>
                                    <td className="px-5 py-3 text-tda-silver-500">{transactionTypes[t.type] || t.type}</td>
                                    <td className="px-5 py-3 text-tda-silver-500">{paymentMethodLabels[t.payment_method] || t.payment_method}</td>
                                    <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                                    <td className="px-5 py-3 text-xs text-tda-silver-500">{formatDate(t.created_at)}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-1">
                                            {t.status === 'pending' && (
                                                <button onClick={() => setConfirmModal(t)}
                                                    className="rounded-lg p-1.5 text-tda-silver-400 hover:bg-green-50 hover:text-green-600 transition" title="Confirmer le paiement">
                                                    <CheckCircle className="h-4 w-4" />
                                                </button>
                                            )}
                                            {t.status === 'confirmed' && (
                                                <button onClick={() => handleComplete(t.id)}
                                                    className="rounded-lg p-1.5 text-tda-silver-400 hover:bg-blue-50 hover:text-blue-600 transition" title="Terminer">
                                                    <Clock className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="9" className="px-5 py-12 text-center text-tda-silver-400"><CreditCard className="mx-auto h-10 w-10 mb-2" /><p>Aucune transaction</p></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-5 py-3 border-t border-tda-silver-100"><Pagination links={transactions.links} /></div>
            </div>
        </AdminLayout>
    );
}
