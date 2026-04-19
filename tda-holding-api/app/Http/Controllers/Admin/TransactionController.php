<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Transaction;
use App\Notifications\PaymentConfirmed;
use App\Support\QueryHelpers;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with(['user', 'booking.bookable', 'confirmedBy']);

        if ($request->filled('search')) {
            QueryHelpers::whereILike($query, 'reference', $request->input('search'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->input('payment_method'));
        }

        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Transactions/Index', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'status', 'payment_method']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'in:cash,mobile_money,bank_transfer,card',
            'type' => 'in:deposit,full_payment,balance,refund',
            'notes' => 'nullable|string',
        ]);

        $booking = Booking::findOrFail($validated['booking_id']);

        Transaction::create([
            'booking_id' => $booking->id,
            'user_id' => $booking->user_id,
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'] ?? 'cash',
            'type' => $validated['type'] ?? 'full_payment',
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Transaction enregistrée.');
    }

    public function confirm(Transaction $transaction, Request $request)
    {
        if ($transaction->status !== 'pending') {
            return back()->with('error', 'Cette transaction ne peut pas être confirmée.');
        }

        $request->validate([
            'payment_method' => 'nullable|in:cash,mobile_money,bank_transfer,card',
        ]);

        if ($request->filled('payment_method')) {
            $transaction->update(['payment_method' => $request->input('payment_method')]);
        }

        $transaction->confirm($request->user()->id);

        if ($transaction->user) {
            $transaction->user->notify(new PaymentConfirmed($transaction));
        }

        return back()->with('success', 'Paiement confirmé.');
    }

    public function complete(Transaction $transaction)
    {
        if ($transaction->status !== 'confirmed') {
            return back()->with('error', 'Cette transaction doit d\'abord être confirmée.');
        }

        $transaction->markAsCompleted();

        return back()->with('success', 'Transaction terminée.');
    }
}
