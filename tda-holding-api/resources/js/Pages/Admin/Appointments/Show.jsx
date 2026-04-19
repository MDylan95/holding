import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, User, Car, Phone, Mail, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

const statusLabels = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    cancelled: 'Annulé',
    completed: 'Complété',
};

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
};

export default function Show({ appointment }) {
    const [status, setStatus] = useState(appointment.status);
    const [adminNotes, setAdminNotes] = useState(appointment.admin_notes || '');
    const [saving, setSaving] = useState(false);

    function handleUpdate() {
        setSaving(true);
        router.put(`/admin/appointments/${appointment.id}`, {
            status,
            admin_notes: adminNotes,
        }, {
            onFinish: () => setSaving(false),
        });
    }

    return (
        <AdminLayout header={`Rendez-vous #${appointment.id}`}>
            <Head title={`Rendez-vous #${appointment.id}`} />

            <div className="mb-4">
                <Link href="/admin/appointments" className="inline-flex items-center gap-1.5 text-sm text-tda-silver-500 hover:text-tda-green-600 transition">
                    <ArrowLeft className="h-4 w-4" /> Retour à la liste
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Infos client & véhicule */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Client */}
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                        <h3 className="text-base font-semibold text-tda-green-900 mb-4">Client</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-tda-silver-400" />
                                <div>
                                    <p className="text-xs text-tda-silver-500">Nom</p>
                                    <p className="font-medium text-tda-green-900">{appointment.user.full_name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-tda-silver-400" />
                                <div>
                                    <p className="text-xs text-tda-silver-500">Email</p>
                                    <p className="font-medium text-tda-green-900">{appointment.user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-tda-silver-400" />
                                <div>
                                    <p className="text-xs text-tda-silver-500">Téléphone</p>
                                    <p className="font-medium text-tda-green-900">{appointment.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Véhicule */}
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                        <h3 className="text-base font-semibold text-tda-green-900 mb-4">Véhicule</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Car className="h-5 w-5 text-tda-silver-400" />
                                <div>
                                    <p className="text-xs text-tda-silver-500">Modèle</p>
                                    <p className="font-medium text-tda-green-900">{appointment.vehicle.brand} {appointment.vehicle.model}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-tda-silver-400" />
                                <div>
                                    <p className="text-xs text-tda-silver-500">Année</p>
                                    <p className="font-medium text-tda-green-900">{appointment.vehicle.year}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Détails du rendez-vous */}
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                        <h3 className="text-base font-semibold text-tda-green-900 mb-4">Détails du rendez-vous</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-tda-silver-400" />
                                <div>
                                    <p className="text-xs text-tda-silver-500">Date</p>
                                    <p className="font-medium text-tda-green-900">{new Date(appointment.appointment_date).toLocaleDateString('fr-FR')}</p>
                                </div>
                            </div>
                            {appointment.preferred_time && (
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-tda-silver-400" />
                                    <div>
                                        <p className="text-xs text-tda-silver-500">Créneau préféré</p>
                                        <p className="font-medium text-tda-green-900">{appointment.preferred_time}</p>
                                    </div>
                                </div>
                            )}
                            {appointment.location && (
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-tda-silver-400" />
                                    <div>
                                        <p className="text-xs text-tda-silver-500">Lieu</p>
                                        <p className="font-medium text-tda-green-900">{appointment.location}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Message du client */}
                    {appointment.notes && (
                        <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200">
                            <h3 className="text-base font-semibold text-tda-green-900 mb-4">Message du client</h3>
                            <p className="text-sm text-tda-green-900 whitespace-pre-wrap">{appointment.notes}</p>
                        </div>
                    )}
                </div>

                {/* Gestion du rendez-vous */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-tda-silver-200 h-fit">
                    <h3 className="text-base font-semibold text-tda-green-900 mb-4">Gestion</h3>

                    {/* Statut */}
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-tda-silver-500 mb-2">Statut</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                        >
                            <option value="pending">En attente</option>
                            <option value="confirmed">Confirmé</option>
                            <option value="completed">Complété</option>
                            <option value="cancelled">Annulé</option>
                        </select>
                    </div>

                    {/* Notes admin */}
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-tda-silver-500 mb-2">Notes internes</label>
                        <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border-tda-silver-200 text-sm focus:border-tda-green-500 focus:ring-tda-green-500"
                            placeholder="Notes pour l'équipe..."
                        />
                    </div>

                    {/* Bouton de sauvegarde */}
                    <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="w-full rounded-lg bg-tda-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-tda-green-700 transition disabled:opacity-50"
                    >
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>

                    {/* Infos supplémentaires */}
                    <div className="mt-6 pt-6 border-t border-tda-silver-200 space-y-2 text-xs text-tda-silver-500">
                        <p><strong>Créé:</strong> {new Date(appointment.created_at).toLocaleDateString('fr-FR')}</p>
                        {appointment.confirmed_by && (
                            <p><strong>Confirmé par:</strong> {appointment.confirmed_by.full_name}</p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
