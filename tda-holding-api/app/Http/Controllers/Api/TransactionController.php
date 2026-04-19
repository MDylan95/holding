<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Transaction::with(['booking', 'user', 'confirmedBy'])
            ->visibleTo($request->user());

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('payment_method')) {
            $query->where('payment_method', $request->input('payment_method'));
        }

        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($transactions);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Transaction::class);

        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'in:cash,mobile_money,bank_transfer,card',
            'type' => 'in:deposit,full_payment,balance,refund',
            'notes' => 'nullable|string',
        ]);

        $booking = Booking::findOrFail($validated['booking_id']);

        $transaction = Transaction::create([
            'booking_id' => $booking->id,
            'user_id' => $booking->user_id,
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'] ?? 'cash',
            'type' => $validated['type'] ?? 'full_payment',
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Transaction enregistrée.',
            'transaction' => $transaction->load('booking'),
        ], 201);
    }

    public function show(Transaction $transaction, Request $request): JsonResponse
    {
        $this->authorize('view', $transaction);

        $transaction->load(['booking.bookable', 'user', 'confirmedBy']);

        return response()->json([
            'transaction' => $transaction,
        ]);
    }

    public function confirm(Transaction $transaction, Request $request): JsonResponse
    {
        $this->authorize('confirm', $transaction);

        if ($transaction->status !== 'pending') {
            return response()->json([
                'message' => 'Cette transaction ne peut pas être confirmée.',
            ], 422);
        }

        $transaction->confirm($request->user()->id);

        return response()->json([
            'message' => 'Paiement confirmé.',
            'transaction' => $transaction->fresh()->load('booking'),
        ]);
    }

    public function destroy(Transaction $transaction): JsonResponse
    {
        // TDA-A02 : super_admin uniquement (via TransactionPolicy::before + delete=false pour les autres).
        $this->authorize('delete', $transaction);

        $transaction->delete();

        return response()->json([
            'message' => 'Transaction supprimée.',
        ]);
    }

    public function complete(Transaction $transaction): JsonResponse
    {
        $this->authorize('complete', $transaction);

        if ($transaction->status !== 'confirmed') {
            return response()->json([
                'message' => 'Cette transaction doit d\'abord être confirmée.',
            ], 422);
        }

        $transaction->markAsCompleted();

        return response()->json([
            'message' => 'Transaction terminée.',
            'transaction' => $transaction->fresh(),
        ]);
    }
}
