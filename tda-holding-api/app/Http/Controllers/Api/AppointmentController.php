<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $appointments = $request->user()->appointments()
            ->with('vehicle')
            ->orderBy('appointment_date', 'desc')
            ->paginate($request->input('per_page', 15));

        return response()->json($appointments);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'appointment_date' => 'required|date|after:today',
            'preferred_time' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20|required_without:email',
            'email' => 'nullable|email|required_without:phone',
            'notes' => 'nullable|string|max:1000',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = 'pending';

        $appointment = Appointment::create($validated);

        return response()->json([
            'message' => 'Rendez-vous demandé avec succès.',
            'appointment' => $appointment->load('vehicle'),
        ], 201);
    }

    public function show(Appointment $appointment): JsonResponse
    {
        $this->authorize('view', $appointment);

        return response()->json([
            'appointment' => $appointment->load(['vehicle', 'user', 'confirmedBy']),
        ]);
    }

    public function cancel(Appointment $appointment): JsonResponse
    {
        $this->authorize('update', $appointment);

        $appointment->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Rendez-vous annulé.',
            'appointment' => $appointment,
        ]);
    }
}
