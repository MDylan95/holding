<?php

namespace App\Http\Controllers\Admin;

use App\Exceptions\InvalidBookingTransitionException;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\BookingWorkflow;
use App\Support\QueryHelpers;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with(['user', 'bookable', 'driver', 'transactions']);

        if ($request->filled('search')) {
            QueryHelpers::whereILike($query, 'reference', $request->input('search'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $bookings = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => $bookings,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(Booking $booking)
    {
        $booking->load(['user', 'bookable', 'bookable.media', 'driver', 'transactions', 'confirmedBy']);

        return Inertia::render('Admin/Bookings/Show', [
            'booking' => $booking,
        ]);
    }

    public function confirm(Booking $booking, Request $request, BookingWorkflow $workflow)
    {
        try {
            $workflow->confirm($booking, $request->user());
        } catch (InvalidBookingTransitionException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Réservation confirmée.');
    }

    public function cancel(Booking $booking, Request $request, BookingWorkflow $workflow)
    {
        try {
            $workflow->cancel($booking, $request->input('reason'), $request->user());
        } catch (InvalidBookingTransitionException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Réservation annulée.');
    }

    public function complete(Booking $booking, BookingWorkflow $workflow)
    {
        try {
            $workflow->complete($booking);
        } catch (InvalidBookingTransitionException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Réservation terminée.');
    }

    public function reject(Booking $booking, Request $request, BookingWorkflow $workflow)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        try {
            $workflow->reject($booking, $validated['reason'], $request->user());
        } catch (InvalidBookingTransitionException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Réservation rejetée.');
    }
}
