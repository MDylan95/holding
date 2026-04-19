import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { bookingsAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { showAlert, confirmAlert } from '../../utils/alert';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function BookingDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBooking(); }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await bookingsAPI.detail(id);
      const data = res.data;
      setBooking(data.booking ?? data.data ?? data);
    } catch (e) {
      showAlert('Erreur', 'Impossible de charger cette réservation.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    confirmAlert('Annuler', 'Voulez-vous annuler cette réservation ?', async () => {
      try {
        await bookingsAPI.cancel(id, null);
        fetchBooking();
        showAlert('Succès', 'Réservation annulée.');
      } catch (e) {
        showAlert('Erreur', e.response?.data?.message || "Impossible d'annuler.");
      }
    });
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.green[600]} /></View>;
  }
  if (!booking) return null;

  const isVehicle = booking.bookable_type?.includes('Vehicle');
  const bookable = booking.bookable;
  const bookableTitle = isVehicle ? `${bookable?.brand} ${bookable?.model}` : bookable?.title || '—';

  return (
    <ScrollView style={styles.container}>
      {/* Status header */}
      <View style={styles.statusCard}>
        <StatusBadge status={booking.status} />
        <Text style={styles.ref}>Réservation #{booking.id}</Text>
      </View>

      {/* Bookable info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons
            name={isVehicle ? 'car-sport' : 'business'}
            size={24}
            color={COLORS.primary}
          />
          <Text style={styles.cardTitle}>{isVehicle ? 'Véhicule' : 'Bien immobilier'}</Text>
        </View>
        <Text style={styles.bookableName}>{bookableTitle}</Text>
        {bookable?.city && (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={14} color={COLORS.silver[400]} />
            <Text style={styles.meta}>{bookable.city}</Text>
          </View>
        )}
      </View>

      {/* Dates */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar" size={20} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Période</Text>
        </View>
        <View style={styles.datesRow}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Début</Text>
            <Text style={styles.dateValue}>{formatDate(booking.start_date)}</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={COLORS.silver[300]} />
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Fin</Text>
            <Text style={styles.dateValue}>{formatDate(booking.end_date)}</Text>
          </View>
        </View>
      </View>

      {/* Financial */}
      {booking.total_amount > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cash" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Montant</Text>
          </View>
          <Text style={styles.totalPrice}>{Number(booking.total_amount).toLocaleString()} FCFA</Text>
          <Text style={styles.paymentNote}>Paiement en cash à l'arrivée</Text>
        </View>
      )}

      {/* Rejection reason */}
      {booking.status === 'rejected' && booking.rejection_reason && (
        <View style={[styles.card, styles.rejectedCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="ban-outline" size={20} color={COLORS.danger} />
            <Text style={[styles.cardTitle, { color: COLORS.danger }]}>Motif du rejet</Text>
          </View>
          <Text style={styles.notes}>{booking.rejection_reason}</Text>
        </View>
      )}

      {/* Notes */}
      {booking.notes && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.silver[600]} />
            <Text style={styles.cardTitle}>Notes</Text>
          </View>
          <Text style={styles.notes}>{booking.notes}</Text>
        </View>
      )}

      {/* Transactions */}
      {booking.transactions?.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Transactions</Text>
          </View>
          {booking.transactions.map((t) => (
            <View key={t.id} style={styles.transRow}>
              <View>
                <Text style={styles.transAmount}>{Number(t.amount).toLocaleString()} FCFA</Text>
                <Text style={styles.transMeta}>{t.payment_method} • {t.created_at?.split('T')[0]}</Text>
              </View>
              <StatusBadge status={t.status} type="transaction" />
            </View>
          ))}
        </View>
      )}

      {/* Cancel button */}
      {(booking.status === 'pending' || booking.status === 'confirmed') && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.8}>
          <Ionicons name="close-circle" size={20} color={COLORS.white} />
          <Text style={styles.cancelText}>Annuler la réservation</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: SIZES.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SIZES.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: SIZES.radius,
    padding: SIZES.md, ...SHADOWS.sm,
  },
  ref: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  card: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radius,
    padding: SIZES.md, marginTop: SIZES.md, ...SHADOWS.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, marginBottom: SIZES.sm },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  bookableName: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  meta: { fontSize: 13, color: COLORS.textSecondary },
  datesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SIZES.lg },
  dateBlock: { alignItems: 'center' },
  dateLabel: { fontSize: 11, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  dateValue: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginTop: 3 },
  totalPrice: { fontSize: 26, fontWeight: '800', color: COLORS.primary },
  paymentNote: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  notes: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21 },
  rejectedCard: { borderWidth: 1, borderColor: COLORS.danger + '50', backgroundColor: COLORS.danger + '08' },
  transRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SIZES.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  transAmount: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  transMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  cancelButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SIZES.sm,
    backgroundColor: COLORS.danger, borderRadius: SIZES.radius,
    paddingVertical: 14, marginTop: SIZES.lg,
  },
  cancelText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});
