import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Users,
    Car,
    Home,
    UserCheck,
    CalendarCheck,
    DollarSign,
    TrendingUp,
    Clock,
    AlertCircle,
    UserX,
    UserCheck2,
    BarChart2,
} from 'lucide-react';

function StatCard({ title, value, icon: Icon, color, subtitle }) {
    const colorMap = {
        green: 'bg-tda-green-600 text-white',
        gold: 'bg-tda-gold-500 text-white',
        blue: 'bg-blue-600 text-white',
        purple: 'bg-purple-600 text-white',
        orange: 'bg-orange-500 text-white',
    };

    return (
        <div className="rounded-xl bg-white p-5 shadow-sm border border-tda-silver-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-tda-silver-500">{title}</p>
                    <p className="mt-1 text-2xl font-bold text-tda-green-900">{value}</p>
                    {subtitle && (
                        <p className="mt-1 text-xs text-tda-silver-400">{subtitle}</p>
                    )}
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorMap[color] || colorMap.green}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const map = {
        pending: { label: 'En attente', cls: 'bg-yellow-100 text-yellow-800' },
        confirmed: { label: 'Confirmé', cls: 'bg-blue-100 text-blue-800' },
        in_progress: { label: 'En cours', cls: 'bg-tda-green-100 text-tda-green-700' },
        completed: { label: 'Terminé', cls: 'bg-green-100 text-green-800' },
        cancelled: { label: 'Annulé', cls: 'bg-red-100 text-red-800' },
        rejected: { label: 'Rejeté', cls: 'bg-red-100 text-red-800' },
    };
    const { label, cls } = map[status] || { label: status, cls: 'bg-gray-100 text-gray-800' };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
            {label}
        </span>
    );
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
    }).format(amount || 0);
}

function RevenueChart({ data }) {
    if (!data || data.length === 0) return null;
    const W = 480, H = 160, PAD = 32;
    const maxVal = Math.max(...data.map(d => d.revenue), 1);
    const pts = data.map((d, i) => {
        const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
        const y = H - PAD - (d.revenue / maxVal) * (H - PAD * 2);
        return { x, y, ...d };
    });
    const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
    const area = `M${pts[0].x},${H - PAD} ` + pts.map(p => `L${p.x},${p.y}`).join(' ') + ` L${pts[pts.length - 1].x},${H - PAD} Z`;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40" style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2C7144" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#2C7144" stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
                <line key={i} x1={PAD} x2={W - PAD} y1={H - PAD - v * (H - PAD * 2)} y2={H - PAD - v * (H - PAD * 2)}
                    stroke="#E8E0D0" strokeWidth="1" />
            ))}
            {/* Area fill */}
            <path d={area} fill="url(#revGrad)" />
            {/* Line */}
            <polyline points={polyline} fill="none" stroke="#2C7144" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {/* Points */}
            {pts.map((p, i) => (
                <g key={i}>
                    <circle cx={p.x} cy={p.y} r="4" fill="#2C7144" />
                    <circle cx={p.x} cy={p.y} r="2" fill="white" />
                </g>
            ))}
            {/* X labels */}
            {pts.map((p, i) => (
                <text key={i} x={p.x} y={H - 6} textAnchor="middle" fontSize="10" fill="#9E9E9E">{p.month}</text>
            ))}
        </svg>
    );
}

export default function Dashboard({ stats, revenueByMonth, recentBookings, recentTransactions, clients }) {
    const [clientSearch, setClientSearch] = useState('');

    const filteredClients = (clients || []).filter(c => {
        const q = clientSearch.toLowerCase();
        return !q || `${c.first_name} ${c.last_name} ${c.email} ${c.phone || ''}`.toLowerCase().includes(q);
    });

    const toggleClientStatus = (clientId) => {
        router.post(route('admin.clients.toggle', clientId), {}, { preserveScroll: true });
    };
    return (
        <AdminLayout header="Tableau de bord">
            <Head title="Tableau de bord" />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Clients"
                    value={stats.clients}
                    icon={Users}
                    color="green"
                />
                <StatCard
                    title="Véhicules"
                    value={stats.vehicles_total}
                    icon={Car}
                    color="blue"
                    subtitle={`${stats.vehicles_available} disponibles · ${stats.vehicles_rented} loués`}
                />
                <StatCard
                    title="Biens immobiliers"
                    value={stats.properties_total}
                    icon={Home}
                    color="purple"
                    subtitle={`${stats.properties_available} disponibles`}
                />
                <StatCard
                    title="Chauffeurs"
                    value={stats.drivers_total}
                    icon={UserCheck}
                    color="gold"
                    subtitle={`${stats.drivers_available} disponibles · ${stats.drivers_on_mission} en mission`}
                />
            </div>

            {/* Revenue & Bookings row */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Chiffre d'affaires total"
                    value={formatCurrency(stats.revenue_total)}
                    icon={DollarSign}
                    color="green"
                />
                <StatCard
                    title="Revenus ce mois"
                    value={formatCurrency(stats.revenue_month)}
                    icon={TrendingUp}
                    color="gold"
                />
                <StatCard
                    title="Réservations en attente"
                    value={stats.bookings_pending}
                    icon={Clock}
                    color="orange"
                    subtitle={`${stats.bookings_active} actives sur ${stats.bookings_total} total`}
                />
            </div>

            {/* Revenue Chart */}
            <div className="mt-6 rounded-xl bg-white shadow-sm border border-tda-silver-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart2 className="h-5 w-5 text-tda-green-600" />
                    <h3 className="font-semibold text-tda-green-900">Revenus — 6 derniers mois</h3>
                </div>
                <RevenueChart data={revenueByMonth} />
            </div>

            {/* Tables */}
            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* Recent Bookings */}
                <div className="rounded-xl bg-white shadow-sm border border-tda-silver-200">
                    <div className="flex items-center justify-between border-b border-tda-silver-200 px-5 py-4">
                        <h3 className="font-semibold text-tda-green-900 flex items-center gap-2">
                            <CalendarCheck className="h-5 w-5 text-tda-green-600" />
                            Réservations récentes
                        </h3>
                        <Link
                            href="/admin/bookings"
                            className="text-sm font-medium text-tda-gold-600 hover:text-tda-gold-700"
                        >
                            Voir tout →
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-tda-silver-100 text-left">
                                    <th className="px-5 py-3 font-medium text-tda-silver-500">Réf.</th>
                                    <th className="px-5 py-3 font-medium text-tda-silver-500">Client</th>
                                    <th className="px-5 py-3 font-medium text-tda-silver-500">Montant</th>
                                    <th className="px-5 py-3 font-medium text-tda-silver-500">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings && recentBookings.length > 0 ? (
                                    recentBookings.map((booking) => (
                                        <tr key={booking.id} className="border-b border-tda-silver-50 hover:bg-tda-silver-50">
                                            <td className="px-5 py-3 font-mono text-xs">{booking.reference}</td>
                                            <td className="px-5 py-3">
                                                {booking.user?.first_name} {booking.user?.last_name}
                                            </td>
                                            <td className="px-5 py-3 font-medium">{formatCurrency(booking.total_amount)}</td>
                                            <td className="px-5 py-3"><StatusBadge status={booking.status} /></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-5 py-8 text-center text-tda-silver-400">
                                            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                                            Aucune réservation
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="rounded-xl bg-white shadow-sm border border-tda-silver-200">
                    <div className="flex items-center justify-between border-b border-tda-silver-200 px-5 py-4">
                        <h3 className="font-semibold text-tda-green-900 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-tda-gold-500" />
                            Transactions récentes
                        </h3>
                        <Link
                            href="/admin/transactions"
                            className="text-sm font-medium text-tda-gold-600 hover:text-tda-gold-700"
                        >
                            Voir tout →
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-tda-silver-100 text-left">
                                    <th className="px-5 py-3 font-medium text-tda-silver-500">Réf.</th>
                                    <th className="px-5 py-3 font-medium text-tda-silver-500">Client</th>
                                    <th className="px-5 py-3 font-medium text-tda-silver-500">Montant</th>
                                    <th className="px-5 py-3 font-medium text-tda-silver-500">Mode</th>
                                    <th className="px-5 py-3 font-medium text-tda-silver-500">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions && recentTransactions.length > 0 ? (
                                    recentTransactions.map((txn) => (
                                        <tr key={txn.id} className="border-b border-tda-silver-50 hover:bg-tda-silver-50">
                                            <td className="px-5 py-3 font-mono text-xs">{txn.reference}</td>
                                            <td className="px-5 py-3">
                                                {txn.user?.first_name} {txn.user?.last_name}
                                            </td>
                                            <td className="px-5 py-3 font-medium">{formatCurrency(txn.amount)}</td>
                                            <td className="px-5 py-3 capitalize">{txn.payment_method}</td>
                                            <td className="px-5 py-3"><StatusBadge status={txn.status} /></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-8 text-center text-tda-silver-400">
                                            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                                            Aucune transaction
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Clients Table */}
            <div className="mt-6 rounded-xl bg-white shadow-sm border border-tda-silver-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-tda-silver-200 px-5 py-4">
                    <h3 className="font-semibold text-tda-green-900 flex items-center gap-2">
                        <Users className="h-5 w-5 text-tda-green-600" />
                        Gestion des clients
                        <span className="ml-1 rounded-full bg-tda-silver-100 px-2 py-0.5 text-xs font-medium text-tda-silver-600">
                            {(clients || []).length}
                        </span>
                    </h3>
                    <input
                        type="text"
                        placeholder="Rechercher un client..."
                        value={clientSearch}
                        onChange={e => setClientSearch(e.target.value)}
                        className="w-full sm:w-64 rounded-lg border border-tda-silver-200 px-3 py-1.5 text-sm focus:border-tda-green-500 focus:outline-none focus:ring-1 focus:ring-tda-green-500"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-tda-silver-100 text-left">
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Nom</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Email</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Téléphone</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Ville</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Inscrit le</th>
                                <th className="px-5 py-3 font-medium text-tda-silver-500">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.length > 0 ? (
                                filteredClients.map(client => (
                                    <tr key={client.id} className="border-b border-tda-silver-50 hover:bg-tda-silver-50">
                                        <td className="px-5 py-3 font-medium text-tda-green-900">
                                            {client.first_name} {client.last_name}
                                        </td>
                                        <td className="px-5 py-3 text-tda-silver-600">{client.email}</td>
                                        <td className="px-5 py-3 text-tda-silver-600">{client.phone || '—'}</td>
                                        <td className="px-5 py-3 text-tda-silver-600">{client.city || '—'}</td>
                                        <td className="px-5 py-3 text-tda-silver-500 text-xs">
                                            {new Date(client.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-5 py-3">
                                            <button
                                                onClick={() => toggleClientStatus(client.id)}
                                                title={client.is_active !== false ? 'Cliquer pour désactiver' : 'Cliquer pour activer'}
                                                className="cursor-pointer focus:outline-none"
                                            >
                                                {client.is_active !== false ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 hover:bg-green-200 transition-colors">
                                                        <UserCheck2 className="h-3 w-3" /> Actif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors">
                                                        <UserX className="h-3 w-3" /> Désactivé
                                                    </span>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-5 py-8 text-center text-tda-silver-400">
                                        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                                        Aucun client trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
