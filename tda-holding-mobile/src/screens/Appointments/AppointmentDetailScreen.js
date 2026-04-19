import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { appointmentsAPI } from '../../services/api';

const statusLabels = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
  completed: 'Complété',
};

const statusColors = {
  pending: { bg: 'rgba(234, 179, 8, 0.1)', text: 'rgb(180, 83, 9)' },
  confirmed: { bg: 'rgba(34, 197, 94, 0.1)', text: 'rgb(22, 163, 74)' },
  cancelled: { bg: 'rgba(239, 68, 68, 0.1)', text: 'rgb(220, 38, 38)' },
  completed: { bg: 'rgba(59, 130, 246, 0.1)', text: 'rgb(37, 99, 235)' },
};

export default function AppointmentDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const fetchAppointment = async () => {
    try {
      const res = await appointmentsAPI.detail(id);
      setAppointment(res.data.appointment);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger le rendez-vous');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Annuler le rendez-vous',
      'Êtes-vous sûr de vouloir annuler ce rendez-vous ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await appointmentsAPI.cancel(id);
              Alert.alert('Succès', 'Rendez-vous annulé', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'annuler le rendez-vous');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rendez-vous</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <Ionicons name="hourglass-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  if (!appointment) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rendez-vous #{appointment.id}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statut */}
        <View style={styles.statusSection}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors[appointment.status].bg },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: statusColors[appointment.status].text },
              ]}
            >
              {statusLabels[appointment.status]}
            </Text>
          </View>
        </View>

        {/* Véhicule */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="car-sport-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Véhicule</Text>
          </View>
          <View style={styles.cardContent}>
            <InfoItem
              icon="car-outline"
              label="Modèle"
              value={`${appointment.vehicle.brand} ${appointment.vehicle.model}`}
            />
            <InfoItem
              icon="calendar-outline"
              label="Année"
              value={appointment.vehicle.year}
            />
          </View>
        </View>

        {/* Détails du rendez-vous */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Détails</Text>
          </View>
          <View style={styles.cardContent}>
            <InfoItem
              icon="calendar-outline"
              label="Date"
              value={new Date(appointment.appointment_date).toLocaleDateString('fr-FR')}
            />
            {appointment.preferred_time && (
              <InfoItem
                icon="time-outline"
                label="Créneau"
                value={appointment.preferred_time}
              />
            )}
            {appointment.location && (
              <InfoItem
                icon="location-outline"
                label="Lieu"
                value={appointment.location}
              />
            )}
          </View>
        </View>

        {/* Informations de contact */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Contact</Text>
          </View>
          <View style={styles.cardContent}>
            <InfoItem icon="call-outline" label="Téléphone" value={appointment.phone} />
            <InfoItem icon="mail-outline" label="Email" value={appointment.email} />
          </View>
        </View>

        {/* Message */}
        {appointment.notes && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="chatbox-outline" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Votre message</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.messageText}>{appointment.notes}</Text>
            </View>
          </View>
        )}

        {/* Notes admin */}
        {appointment.admin_notes && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Notes de l'admin</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.messageText}>{appointment.admin_notes}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      {appointment.status === 'pending' && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity
            style={[styles.cancelBtn, cancelling && styles.cancelBtnDisabled]}
            onPress={handleCancel}
            disabled={cancelling}
            activeOpacity={0.88}
          >
            <Ionicons name="close-circle-outline" size={18} color="rgb(220, 38, 38)" />
            <Text style={styles.cancelBtnText}>
              {cancelling ? 'Annulation...' : 'Annuler le rendez-vous'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={16} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgb(245,243,238)' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { fontSize: 16, color: COLORS.textSecondary, marginTop: 12 },

  content: { flex: 1, paddingHorizontal: 16, paddingVertical: 16 },

  statusSection: { marginBottom: 16, alignItems: 'center' },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  statusText: { fontSize: 14, fontWeight: '600' },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },

  cardContent: { gap: 12 },

  infoItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(45, 125, 50, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  infoLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },

  messageText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgb(220, 38, 38)',
  },
  cancelBtnDisabled: { opacity: 0.6 },
  cancelBtnText: { color: 'rgb(220, 38, 38)', fontSize: 15, fontWeight: '700' },
});
