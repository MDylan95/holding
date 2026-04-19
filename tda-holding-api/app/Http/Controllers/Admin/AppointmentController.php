<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::with(['user', 'vehicle']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('user', fn ($q) => $q->where('first_name', 'like', "%$search%")
                ->orWhere('last_name', 'like', "%$search%")
                ->orWhere('email', 'like', "%$search%"))
                ->orWhereHas('vehicle', fn ($q) => $q->where('brand', 'like', "%$search%")
                    ->orWhere('model', 'like', "%$search%"));
        }

        $appointments = $query->orderBy('appointment_date', 'desc')->paginate(15);

        return Inertia::render('Admin/Appointments/Index', [
            'appointments' => $appointments,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function show(Appointment $appointment)
    {
        $appointment->load(['user', 'vehicle', 'confirmedBy']);

        return Inertia::render('Admin/Appointments/Show', [
            'appointment' => $appointment,
        ]);
    }

    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        if ($validated['status'] === 'confirmed' && $appointment->status !== 'confirmed') {
            $validated['confirmed_by'] = $request->user()->id;
            $validated['confirmed_at'] = now();
        }

        $appointment->update($validated);

        return back()->with('success', 'Rendez-vous mis à jour.');
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();

        return back()->with('success', 'Rendez-vous supprimé.');
    }
}
