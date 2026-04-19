<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Driver;
use App\Models\Property;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'stats' => [
                'users' => User::where('role', 'client')->count(),
                'vehicles' => [
                    'total' => Vehicle::count(),
                    'available' => Vehicle::available()->count(),
                    'rented' => Vehicle::where('status', 'rented')->count(),
                ],
                'properties' => [
                    'total' => Property::count(),
                    'available' => Property::available()->count(),
                    'rented' => Property::where('status', 'rented')->count(),
                    'sold' => Property::where('status', 'sold')->count(),
                ],
                'drivers' => [
                    'total' => Driver::active()->count(),
                    'available' => Driver::available()->count(),
                    'on_mission' => Driver::onMission()->count(),
                ],
                'bookings' => [
                    'total' => Booking::count(),
                    'pending' => Booking::pending()->count(),
                    'confirmed' => Booking::confirmed()->count(),
                    'active' => Booking::active()->count(),
                ],
                'revenue' => [
                    'total' => Transaction::completed()->sum('amount'),
                    'pending' => Transaction::pending()->sum('amount'),
                    'this_month' => Transaction::completed()
                        ->whereMonth('created_at', now()->month)
                        ->whereYear('created_at', now()->year)
                        ->sum('amount'),
                ],
            ],
        ]);
    }

    public function recentBookings(): JsonResponse
    {
        $bookings = Booking::with(['user', 'bookable', 'driver'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'bookings' => $bookings,
        ]);
    }

    public function recentTransactions(): JsonResponse
    {
        $transactions = Transaction::with(['user', 'booking'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'transactions' => $transactions,
        ]);
    }
}
