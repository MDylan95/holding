import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    LayoutDashboard,
    Car,
    Home,
    Users,
    CalendarCheck,
    Clock,
    CreditCard,
    FolderOpen,
    LogOut,
    Menu,
    X,
    ChevronDown,
    User,
    Settings,
    Bell,
    CheckCheck,
} from 'lucide-react';

const navigation = [
    { name: 'Tableau de bord', href: '/admin/dashboard', icon: LayoutDashboard, routeName: 'admin.dashboard' },
    { name: 'Véhicules', href: '/admin/vehicles', icon: Car, routeName: 'admin.vehicles.index' },
    { name: 'Immobilier', href: '/admin/properties', icon: Home, routeName: 'admin.properties.index' },
    { name: 'Chauffeurs', href: '/admin/drivers', icon: Users, routeName: 'admin.drivers.index' },
    { name: 'Réservations', href: '/admin/bookings', icon: CalendarCheck, routeName: 'admin.bookings.index' },
    { name: 'Rendez-vous', href: '/admin/appointments', icon: Clock, routeName: 'admin.appointments.index' },
    { name: 'Transactions', href: '/admin/transactions', icon: CreditCard, routeName: 'admin.transactions.index' },
    { name: 'Catégories', href: '/admin/categories', icon: FolderOpen, routeName: 'admin.categories.index' },
];

function SidebarLink({ item, currentUrl }) {
    const isActive = currentUrl.startsWith(item.href);
    const Icon = item.icon;

    return (
        <Link
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                    ? 'bg-tda-gold-500/20 text-tda-gold-400 border-r-2 border-tda-gold-400'
                    : 'text-tda-silver-300 hover:bg-white/5 hover:text-white'
            }`}
        >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.name}</span>
        </Link>
    );
}

const typeIcons = {
    new_booking:        '🔔',
    booking_confirmed:  '✅',
    booking_cancelled:  '❌',
    payment_confirmed:  '💳',
};

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    return `Il y a ${Math.floor(diff / 86400)} j`;
}

export default function AdminLayout({ header, children }) {
    const { auth, url, flash } = usePage().props;
    const user = auth.user;
    const currentUrl = url || window.location.pathname;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setToast({ type: 'success', message: flash.success });
            const t = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(t);
        }
        if (flash?.error) {
            setToast({ type: 'error', message: flash.error });
            const t = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    function fetchNotifications() {
        fetch('/admin/notifications', {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            credentials: 'same-origin',
        })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data) {
                    setNotifications(data.notifications || []);
                    setUnreadCount(data.unread_count || 0);
                }
            })
            .catch(() => {});
    }

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClick(e) {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    function markAllRead() {
        fetch('/admin/notifications/read-all', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' },
            credentials: 'same-origin',
        }).then(() => {
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        });
    }

    function markOneRead(id) {
        fetch(`/admin/notifications/${id}/read`, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' },
            credentials: 'same-origin',
        }).then(() => {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        });
    }

    return (
        <div className="min-h-screen bg-tda-silver-100">
            {/* Toast flash */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-xl text-sm font-medium transition-all ${
                    toast.type === 'success'
                        ? 'bg-tda-green-600 text-white'
                        : 'bg-red-600 text-white'
                }`}>
                    <span>{toast.type === 'success' ? '✓' : '✕'}</span>
                    <span>{toast.message}</span>
                    <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none">×</button>
                </div>
            )}
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-tda-green-900 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
                    <Link href="/admin/dashboard" className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-tda-gold-500 font-bold text-tda-green-900 text-sm">
                            TDA
                        </div>
                        <div>
                            <span className="text-base font-bold text-white">TDA</span>
                            <span className="text-base font-light text-tda-gold-400 ml-1">Holding</span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="text-tda-silver-400 hover:text-white lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-4 flex flex-col gap-1 px-3">
                    {navigation.map((item) => (
                        <SidebarLink key={item.name} item={item} currentUrl={currentUrl} />
                    ))}
                </nav>

                {/* User info at bottom */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tda-gold-500/20 text-tda-gold-400">
                            <User className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                                {user.first_name} {user.last_name}
                            </p>
                            <p className="truncate text-xs text-tda-silver-400">
                                {user.role === 'super_admin' ? 'Super Admin' : 'Agent'}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-tda-silver-200 bg-white px-4 shadow-sm lg:px-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-tda-silver-500 hover:text-tda-green-600 lg:hidden"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        {header && (
                            <h1 className="text-lg font-semibold text-tda-green-900">
                                {header}
                            </h1>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notifications bell */}
                        <div className="relative" ref={notifRef}>
                            <button onClick={() => setNotifOpen(!notifOpen)}
                                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-tda-silver-500 hover:bg-tda-silver-100 transition">
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {notifOpen && (
                                <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-tda-silver-200 bg-white shadow-xl overflow-hidden">
                                    <div className="flex items-center justify-between border-b border-tda-silver-100 px-4 py-3">
                                        <span className="text-sm font-semibold text-tda-green-900">Notifications</span>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-tda-green-600 hover:text-tda-green-700">
                                                <CheckCheck className="h-3.5 w-3.5" /> Tout marquer lu
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto divide-y divide-tda-silver-50">
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-8 text-center text-sm text-tda-silver-400">
                                                <Bell className="mx-auto h-8 w-8 mb-2 opacity-30" />
                                                Aucune notification
                                            </div>
                                        ) : notifications.map(n => (
                                            <button key={n.id} onClick={() => { markOneRead(n.id); setNotifOpen(false); }}
                                                className={`w-full text-left px-4 py-3 hover:bg-tda-silver-50 transition ${!n.read_at ? 'bg-tda-green-50' : ''}`}>
                                                <div className="flex items-start gap-3">
                                                    <span className="text-base mt-0.5">{typeIcons[n.data?.type] || '🔔'}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm ${!n.read_at ? 'font-semibold text-tda-green-900' : 'font-medium text-tda-silver-700'}`}>
                                                            {n.data?.title}
                                                        </p>
                                                        <p className="text-xs text-tda-silver-500 mt-0.5 line-clamp-2">{n.data?.body}</p>
                                                        <p className="text-xs text-tda-silver-400 mt-1">{timeAgo(n.created_at)}</p>
                                                    </div>
                                                    {!n.read_at && <span className="mt-1.5 h-2 w-2 rounded-full bg-tda-green-500 flex-shrink-0" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-tda-silver-500 hover:bg-tda-silver-100 transition"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tda-green-600 text-white text-xs font-bold">
                                    {user.first_name?.[0]}{user.last_name?.[0]}
                                </div>
                                <span className="hidden md:block font-medium text-tda-green-900">
                                    {user.first_name} {user.last_name}
                                </span>
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {userMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setUserMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-tda-silver-200 bg-white py-1 shadow-lg">
                                        <Link
                                            href={route('profile.edit')}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-tda-silver-500 hover:bg-tda-silver-100"
                                        >
                                            <Settings className="h-4 w-4" />
                                            Profil
                                        </Link>
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Déconnexion
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
