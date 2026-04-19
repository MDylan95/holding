import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, StatusBar,
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
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

export default function AppointmentsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentsAPI.list({ per_page: 50 });
      setAppointments(res.data.data || []);
    } catch (error) {
      console.error('Erreur rendez-vous:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const handleCancel = (id) => {
    Alert.alert(
      'Annuler le rendez-vous',
      'Êtes-vous sûr de vouloir annuler ce rendez-vous ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: async () => {
            try {
              await appointmentsAPI.cancel(id);
              fetchAppointments();
              Alert.alert('Succès', 'Rendez-vous annulé');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'annuler le rendez-vous');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('AppointmentDetail', { id: item.id })}
      activeOpacity={0.88}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.vehicle.brand} {item.vehicle.model}
          </Text>
          <Text style={styles.cardSub} numberOfLines={1}>
            {new Date(item.appointment_date).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.status === 'pending' && styles.statusPending,
            item.status === 'confirmed' && styles.statusConfirmed,
            item.status === 'cancelled' && styles.statusCancelled,
            item.status === 'completed' && styles.statusCompleted,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === 'pending' && styles.statusTextPending,
              item.status === 'confirmed' && styles.statusTextConfirmed,
              item.status === 'cancelled' && styles.statusTextCancelled,
              item.status === 'completed' && styles.statusTextCompleted,
            ]}
          >
            {statusLabels[item.status]}
          </Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        {item.preferred_time && (
          <View style={styles.detail}>
            <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{item.preferred_time}</Text>
          </View>
        )}
        {item.location && (
          <View style={styles.detail}>
            <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        )}
      </View>

      {item.status === 'pending' && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => handleCancel(item.id)}
        >
          <Text style={styles.cancelBtnText}>Annuler</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes rendez-vous</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <Ionicons name="hourglass-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="calendar-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>Aucun rendez-vous</Text>
          <Text style={styles.emptySubText}>Vos rendez-vous apparaîtront ici</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
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
    paddingHorizontal: 20,
  },
  loadingText: { fontSize: 16, color: COLORS.textSecondary, marginTop: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginTop: 12 },
  emptySubText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 6 },

  list: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  cardSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusPending: { backgroundColor: 'rgba(234, 179, 8, 0.1)' },
  statusConfirmed: { backgroundColor: 'rgba(34, 197, 94, 0.1)' },
  statusCancelled: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  statusCompleted: { backgroundColor: 'rgba(59, 130, 246, 0.1)' },

  statusText: { fontSize: 11, fontWeight: '600' },
  statusTextPending: { color: 'rgb(180, 83, 9)' },
  statusTextConfirmed: { color: 'rgb(22, 163, 74)' },
  statusTextCancelled: { color: 'rgb(220, 38, 38)' },
  statusTextCompleted: { color: 'rgb(37, 99, 235)' },

  cardDetails: { gap: 6, marginBottom: 10 },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 12, color: COLORS.textSecondary },

  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 12, fontWeight: '600', color: 'rgb(220, 38, 38)' },
});
