<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Driver;
use App\Models\Property;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Vehicle;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'clients' => User::where('role', 'client')->count(),
            'vehicles_total' => Vehicle::count(),
            'vehicles_available' => Vehicle::available()->count(),
            'vehicles_rented' => Vehicle::where('status', 'rented')->count(),
            'properties_total' => Property::count(),
            'properties_available' => Property::available()->count(),
            'drivers_total' => Driver::active()->count(),
            'drivers_available' => Driver::available()->count(),
            'drivers_on_mission' => Driver::onMission()->count(),
            'bookings_total' => Booking::count(),
            'bookings_pending' => Booking::pending()->count(),
            'bookings_active' => Booking::active()->count(),
            'revenue_total' => Transaction::completed()->sum('amount'),
            'revenue_pending' => Transaction::pending()->sum('amount'),
            'revenue_month' => Transaction::completed()
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('amount'),
        ];

        // Revenus sur 6 mois glissants
        $revenueByMonth = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $revenueByMonth[] = [
                'month' => $month->format('M y'),
                'revenue' => (float) Transaction::completed()
                    ->whereMonth('created_at', $month->month)
                    ->whereYear('created_at', $month->year)
                    ->sum('amount'),
            ];
        }

        $recentBookings = Booking::with(['user', 'bookable', 'driver'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentTransactions = Transaction::with(['user', 'booking'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $clients = User::where('role', 'client')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'first_name', 'last_name', 'email', 'phone', 'city', 'is_active', 'created_at']);

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'revenueByMonth' => $revenueByMonth,
            'recentBookings' => $recentBookings,
            'recentTransactions' => $recentTransactions,
            'clients' => $clients,
        ]);
    }
}
