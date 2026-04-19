<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Driver;
use App\Models\Property;
use App\Models\User;
use App\Models\Vehicle;
use App\Notifications\NewBookingAdmin;
use App\Services\BookingWorkflow;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Booking::with(['bookable', 'driver', 'user', 'transactions'])
            ->visibleTo($request->user());

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('bookable_type')) {
            // TDA-C01 : morph map enregistrée, on filtre directement sur l'alias.
            $query->where('bookable_type', $request->input('bookable_type'));
        }

        $bookings = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($bookings);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Booking::class);

        $validated = $request->validate([
            'bookable_type' => 'required|in:vehicle,property',
            'bookable_id' => 'required|integer',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'nullable|date|after:start_date',
            'with_driver' => 'boolean',
            'driver_id' => 'nullable|exists:drivers,id',
            'notes' => 'nullable|string',
            'pickup_location' => 'nullable|string|max:255',
            'return_location' => 'nullable|string|max:255',
        ]);

        // TDA-C01 : résoudre l'alias morph en classe via Relation::getMorphedModel.
        $bookableClass = \Illuminate\Database\Eloquent\Relations\Relation::getMorphedModel(
            $validated['bookable_type']
        );
        $bookable = $bookableClass::findOrFail($validated['bookable_id']);

        if (!$bookable->isAvailable()) {
            return response()->json([
                'message' => 'Ce bien n\'est pas disponible à la réservation.',
            ], 422);
        }

        // TDA-B04 : seul un bien en location (rent|both) peut être réservé
        if (!in_array($bookable->offer_type, ['rent', 'both'], true)) {
            return response()->json([
                'message' => 'Ce bien n\'est pas disponible à la location.',
            ], 422);
        }

        // TDA-B03 : vérification chevauchement sur pending, confirmed et in_progress
        if (!empty($validated['end_date'])) {
            $overlap = Booking::where('bookable_type', $validated['bookable_type'])
                ->where('bookable_id', $validated['bookable_id'])
                ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
                ->where(function ($q) use ($validated) {
                    $q->whereBetween('start_date', [$validated['start_date'], $validated['end_date']])
                      ->orWhereBetween('end_date', [$validated['start_date'], $validated['end_date']])
                      ->orWhere(function ($q2) use ($validated) {
                          $q2->where('start_date', '<=', $validated['start_date'])
                             ->where('end_date', '>=', $validated['end_date']);
                      });
                })
                ->exists();

            if ($overlap) {
                return response()->json([
                    'message' => 'Ce bien est déjà réservé sur cette période.',
                ], 422);
            }
        }

        // Calcul du montant total
        $totalAmount = 0;
        $startCarbon = Carbon::parse($validated['start_date']);
        $endCarbon   = isset($validated['end_date']) ? Carbon::parse($validated['end_date']) : $startCarbon->copy();

        if ($validated['bookable_type'] === 'vehicle' && $bookable->daily_rate) {
            $days = max(1, $startCarbon->diffInDays($endCarbon));
            $totalAmount = $bookable->daily_rate * $days;
        } elseif ($validated['bookable_type'] === 'property' && $bookable->monthly_rent) {
            $months = max(1, $startCarbon->diffInMonths($endCarbon));
            $totalAmount = $bookable->monthly_rent * $months;
        }

        if (!empty($validated['with_driver']) && !empty($validated['driver_id'])) {
            $driver = Driver::findOrFail($validated['driver_id']);
            if (!$driver->isAvailable()) {
                return response()->json([
                    'message' => 'Ce chauffeur n\'est pas disponible.',
                ], 422);
            }
            $driverDays = max(1, $startCarbon->diffInDays($endCarbon));
            $totalAmount += $driver->daily_rate * $driverDays;
        }

        $booking = Booking::create([
            'user_id' => $request->user()->id,
            'bookable_type' => $validated['bookable_type'],
            'bookable_id' => $validated['bookable_id'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'] ?? null,
            'with_driver' => $validated['with_driver'] ?? false,
            'driver_id' => $validated['driver_id'] ?? null,
            'total_amount' => $totalAmount,
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
            'pickup_location' => $validated['pickup_location'] ?? null,
            'return_location' => $validated['return_location'] ?? null,
        ]);

        $admins = User::whereIn('role', ['super_admin', 'agent'])->get();
        foreach ($admins as $admin) {
            $admin->notify(new NewBookingAdmin($booking));
        }

        return response()->json([
            'message' => 'Réservation créée avec succès.',
            'booking' => $booking->load(['bookable', 'driver']),
        ], 201);
    }

    public function show(Booking $booking, Request $request): JsonResponse
    {
        $this->authorize('view', $booking);

        $booking->load(['bookable', 'driver', 'user', 'transactions']);

        return response()->json([
            'booking' => $booking,
        ]);
    }

    public function confirm(Booking $booking, Request $request, BookingWorkflow $workflow): JsonResponse
    {
        $this->authorize('confirm', $booking);

        $booking = $workflow->confirm($booking, $request->user());

        return response()->json([
            'message' => 'Réservation confirmée.',
            'booking' => $booking,
        ]);
    }

    public function cancel(Booking $booking, Request $request, BookingWorkflow $workflow): JsonResponse
    {
        $this->authorize('cancel', $booking);

        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $booking = $workflow->cancel($booking, $request->input('reason'), $request->user());

        return response()->json([
            'message' => 'Réservation annulée.',
            'booking' => $booking,
        ]);
    }

    public function reject(Booking $booking, Request $request, BookingWorkflow $workflow): JsonResponse
    {
        $this->authorize('reject', $booking);

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $booking = $workflow->reject($booking, $validated['reason'], $request->user());

        return response()->json([
            'message' => 'Réservation rejetée.',
            'booking' => $booking,
        ]);
    }

    public function start(Booking $booking, BookingWorkflow $workflow): JsonResponse
    {
        $this->authorize('start', $booking);

        $booking = $workflow->start($booking);

        return response()->json([
            'message' => 'Réservation démarrée.',
            'booking' => $booking,
        ]);
    }

    public function complete(Booking $booking, BookingWorkflow $workflow): JsonResponse
    {
        $this->authorize('complete', $booking);

        $booking = $workflow->complete($booking);

        return response()->json([
            'message' => 'Réservation terminée.',
            'booking' => $booking,
        ]);
    }
}
