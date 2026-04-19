<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;

// ============================================
// ROUTES PUBLIQUES (pas d'auth)
// ============================================
Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Catalogue public (lecture seule)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/vehicles', [VehicleController::class, 'index']);
Route::get('/vehicles/{vehicle}', [VehicleController::class, 'show']);
Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/{property}', [PropertyController::class, 'show']);
Route::get('/drivers', [DriverController::class, 'index']);
Route::get('/drivers/available', [DriverController::class, 'available']);
Route::get('/drivers/{driver}', [DriverController::class, 'show']);

// ============================================
// ROUTES AUTHENTIFIÉES (client + admin)
// TDA-A04 : rate-limiting 60/min par user
// ============================================
Route::middleware(['auth:sanctum', 'throttle:api-authenticated'])->group(function () {

    // Auth / Profil
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'changePassword']);

    // Lecture
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::get('/appointments/{appointment}', [AppointmentController::class, 'show']);
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Actions client (annulation)
    Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    Route::post('/appointments/{appointment}/cancel', [AppointmentController::class, 'cancel']);

    // --------------------------------------------
    // TDA-A04 : créations sensibles — 10/min par user
    // --------------------------------------------
    Route::middleware('throttle:api-create')->group(function () {
        Route::post('/favorites/toggle', [FavoriteController::class, 'toggle']);
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::post('/appointments', [AppointmentController::class, 'store']);
    });

    // ============================================
    // ROUTES ADMIN PARTAGÉES (super_admin + agent)
    // TDA-A02 : opérations non destructives uniquement
    // ============================================
    Route::middleware('role:super_admin,agent')->group(function () {

        // Dashboard
        Route::get('/admin/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/admin/dashboard/recent-bookings', [DashboardController::class, 'recentBookings']);
        Route::get('/admin/dashboard/recent-transactions', [DashboardController::class, 'recentTransactions']);

        // Véhicules & Biens : create + update autorisés aux deux rôles
        Route::post('/vehicles', [VehicleController::class, 'store']);
        Route::put('/vehicles/{vehicle}', [VehicleController::class, 'update']);
        Route::post('/properties', [PropertyController::class, 'store']);
        Route::put('/properties/{property}', [PropertyController::class, 'update']);

        // Chauffeurs : create + update autorisés aux deux rôles
        Route::post('/drivers', [DriverController::class, 'store']);
        Route::put('/drivers/{driver}', [DriverController::class, 'update']);

        // Réservations : actions de workflow autorisées aux deux rôles
        Route::post('/bookings/{booking}/confirm', [BookingController::class, 'confirm']);
        Route::post('/bookings/{booking}/start', [BookingController::class, 'start']);
        Route::post('/bookings/{booking}/reject', [BookingController::class, 'reject']);
        Route::post('/bookings/{booking}/complete', [BookingController::class, 'complete']);

        // Transactions : création + actions workflow
        Route::post('/transactions', [TransactionController::class, 'store'])->middleware('throttle:api-create');
        Route::post('/transactions/{transaction}/confirm', [TransactionController::class, 'confirm']);
        Route::post('/transactions/{transaction}/complete', [TransactionController::class, 'complete']);

        // Médias : upload + delete + set primary
        Route::post('/media/upload', [MediaController::class, 'upload'])->middleware('throttle:api-create');
        Route::delete('/media/{media}', [MediaController::class, 'destroy']);
        Route::post('/media/{media}/primary', [MediaController::class, 'setPrimary']);
    });

    // ============================================
    // ROUTES SUPER_ADMIN UNIQUEMENT
    // TDA-A02 : opérations destructives + CRUD catégories
    // ============================================
    Route::middleware('role:super_admin')->group(function () {

        // Catégories (CRUD complet — jamais pour les agents)
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

        // Suppressions (opérations destructives)
        Route::delete('/vehicles/{vehicle}', [VehicleController::class, 'destroy']);
        Route::delete('/properties/{property}', [PropertyController::class, 'destroy']);
        Route::delete('/drivers/{driver}', [DriverController::class, 'destroy']);
        Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy']);
    });
});
