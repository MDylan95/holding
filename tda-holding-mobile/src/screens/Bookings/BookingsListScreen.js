import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ScrollView, StatusBar, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { bookingsAPI } from '../../services/api';
import { confirmAlert, showAlert } from '../../utils/alert';
import { BOOKING_STATUS } from '../../constants/config';

const STATUS_CONFIG = {
  pending:     { ...BOOKING_STATUS.pending,     bg: '#FEF9EC', text: '#92400E', dot: BOOKING_STATUS.pending.color,     icon: 'time-outline' },
  confirmed:   { ...BOOKING_STATUS.confirmed,   bg: '#ECFDF5', text: '#065F46', dot: BOOKING_STATUS.confirmed.color,   icon: 'checkmark-circle-outline' },
  in_progress: { ...BOOKING_STATUS.in_progress, bg: '#F5F3FF', text: '#5B21B6', dot: BOOKING_STATUS.in_progress.color, icon: 'car-outline' },
  completed:   { ...BOOKING_STATUS.completed,   bg: '#EFF6FF', text: '#1E40AF', dot: BOOKING_STATUS.completed.color,   icon: 'trophy-outline' },
  cancelled:   { ...BOOKING_STATUS.cancelled,   bg: '#FEF2F2', text: '#991B1B', dot: BOOKING_STATUS.cancelled.color,   icon: 'close-circle-outline' },
  rejected:    { ...BOOKING_STATUS.rejected,    bg: '#FFF7ED', text: '#9A3412', dot: BOOKING_STATUS.rejected.color,    icon: 'ban-outline' },
};

const FILTERS = [
  { key: 'all',         label: 'Toutes' },
  { key: 'pending',     label: 'En attente' },
  { key: 'confirmed',   label: 'Confirmées' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'completed',   label: 'Terminées' },
  { key: 'cancelled',   label: 'Annulées' },
  { key: 'rejected',    label: 'Rejetées' },
];

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

function BookingCard({ item, onPress, onCancel }) {
  const s = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
  const b = item.bookable;
  const isVehicle = item.bookable_type?.includes('Vehicle');
  const isDriver = item.bookable_type?.includes('Driver');
  const title = isVehicle
    ? `${b?.brand || ''} ${b?.model || ''}`.trim() || 'Véhicule'
    : isDriver
    ? `${b?.first_name || ''} ${b?.last_name || ''}`.trim() || 'Chauffeur'
    : b?.title || 'Bien immobilier';
  const icon = isVehicle ? 'car-sport' : isDriver ? 'people' : 'business';
  const typeLabel = isVehicle ? 'Automobile' : isDriver ? 'Chauffeur' : 'Immobilier';

  const imageUri = b?.media?.[0]?.url || b?.photo_url || b?.avatar_url || null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      {/* Header row : ref + statut */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardRefWrap}>
          <Ionicons name={icon} size={12} color={COLORS.textSecondary} />
          <Text style={styles.cardRef}>TDA-{String(item.id).padStart(7, '0').slice(0,4)}-{String(item.id).padStart(4, '0')}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
          <Text style={[styles.statusText, { color: s.text }]}>{s.label}</Text>
        </View>
      </View>

      {/* Body : image + infos */}
      <View style={styles.cardBody}>
        <View style={styles.cardImageWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.cardImage} resizeMode="cover" />
          ) : (
            <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
              <Ionicons name={icon} size={28} color={COLORS.cream[400]} />
            </View>
          )}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
          <View style={styles.cardDetailRow}>
            <Ionicons name="location-outline" size={11} color={COLORS.textSecondary} />
            <Text style={styles.cardDetailText}>{b?.city || b?.location || 'Abidjan'}</Text>
          </View>
          <View style={styles.cardDetailRow}>
            <Ionicons name="calendar-outline" size={11} color={COLORS.textSecondary} />
            <Text style={styles.cardDetailText}>
              {formatDate(item.start_date)}{item.end_date ? ` → ${formatDate(item.end_date)}` : ''}
            </Text>
          </View>
          <View style={styles.cardPriceRow}>
            {item.total_amount > 0 && (
              <Text style={styles.cardPrice}>
                <Text style={styles.cardPriceValue}>{Number(item.total_amount).toLocaleString('fr-FR')}</Text>
                <Text style={styles.cardPriceCurrency}> FCFA</Text>
              </Text>
            )}
            {item.payment_method && (
              <View style={styles.cardPayRow}>
                <Ionicons name="wallet-outline" size={11} color={COLORS.textSecondary} />
                <Text style={styles.cardPayText}>{item.payment_method}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.cardBtnPrimary} onPress={onPress}>
          <Text style={styles.cardBtnPrimaryText}>Voir l’offre</Text>
        </TouchableOpacity>
        {(item.status === 'pending' || item.status === 'confirmed') ? (
          <TouchableOpacity style={styles.cardBtnDanger} onPress={onCancel}>
            <Text style={styles.cardBtnDangerText}>Annuler</Text>
          </TouchableOpacity>
        ) : item.status === 'in_progress' ? (
          <TouchableOpacity style={styles.cardBtnGold}>
            <Ionicons name="call-outline" size={13} color="rgb(122, 92, 0)" />
            <Text style={styles.cardBtnGoldText}>Contacter</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function BookingsListScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchBookings = useCallback(async () => {
    setNetworkError(false);
    try {
      const res = await bookingsAPI.list();
      setBookings(res.data.data?.data || res.data.data || []);
    } catch (e) {
      console.error('Erreur réservations:', e);
      setNetworkError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const onRefresh = () => { setRefreshing(true); fetchBookings(); };

  const handleCancel = (id) => {
    confirmAlert('Annuler', 'Voulez-vous annuler cette réservation ?', async () => {
      try {
        await bookingsAPI.cancel(id, null);
        fetchBookings();
        showAlert('Succès', 'Réservation annulée.');
      } catch (e) {
        showAlert('Erreur', e.response?.data?.message || 'Impossible d\'annuler.');
      }
    });
  };

  const filtered = activeFilter === 'all' ? bookings : bookings.filter(b => b.status === activeFilter);

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerDecor} />
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Mes réservations</Text>
          {bookings.length > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{bookings.length} total</Text>
            </View>
          )}

        </View>
        <Text style={styles.headerSub}>Suivez l'état de vos demandes</Text>
        {/* Filter tabs inside header */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={styles.filterChip}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>
                {f.label}{f.key !== 'all' && counts[f.key] ? ` ${counts[f.key]}` : ''}
              </Text>
              {activeFilter === f.key && <View style={styles.filterUnderline} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => `b-${item.id}`}
          renderItem={({ item }) => (
            <BookingCard
              item={item}
              onPress={() => navigation.navigate('BookingDetail', { id: item.id })}
              onCancel={() => handleCancel(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            networkError ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="cloud-offline-outline" size={48} color={COLORS.cream[400]} />
                <Text style={styles.emptyTitle}>Erreur réseau</Text>
                <Text style={styles.emptySub}>Vérifiez votre connexion internet</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={fetchBookings}>
                  <Ionicons name="refresh-outline" size={16} color={COLORS.white} />
                  <Text style={styles.retryBtnText}>Réessayer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyWrap}>
                <Ionicons name="calendar-outline" size={48} color={COLORS.cream[400]} />
                <Text style={styles.emptyTitle}>Aucune réservation</Text>
                <Text style={styles.emptySub}>Vos réservations apparaîtront ici</Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'rgb(245, 243, 238)' },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  headerDecor: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: COLORS.white, opacity: 0.07, right: -30, top: -40 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: '700' },
  headerBadge: { backgroundColor: 'rgba(201,162,39,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  headerBadgeText: { color: '#C9A227', fontSize: 12, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 12 },

  // Filters (inside header)
  filtersScroll: { marginHorizontal: -4 },
  filtersRow: { paddingHorizontal: 8, gap: 0 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center',
  },
  filterChipActive: {},
  filterText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
  filterTextActive: { color: '#C9A227', fontWeight: '700' },
  filterUnderline: { height: 2, width: '100%', backgroundColor: '#C9A227', borderRadius: 999, marginTop: 4 },

  // List
  list: { padding: 16, paddingBottom: 32, gap: 12, backgroundColor: 'rgb(245, 243, 238)', flexGrow: 1 },
  loadingWrap: { flex: 1, backgroundColor: 'rgb(245, 243, 238)', justifyContent: 'center', alignItems: 'center' },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgb(245, 243, 238)', paddingHorizontal: 16, paddingVertical: 10,
  },
  cardRefWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardRef: { fontSize: 11, fontWeight: '700', color: 'rgb(107, 114, 128)' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  cardBody: { flexDirection: 'row', padding: 12, gap: 12 },
  cardImageWrap: { width: 80, height: 80 },
  cardImage: { width: 80, height: 80 },
  cardImagePlaceholder: { backgroundColor: COLORS.cream[200], justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: 'rgb(31, 41, 55)' },
  cardDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardDetailText: { fontSize: 11, color: 'rgb(156, 163, 175)' },
  cardPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  cardPrice: {},
  cardPriceValue: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  cardPriceCurrency: { fontSize: 10, fontWeight: '400', color: 'rgb(156, 163, 175)' },
  cardPayRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardPayText: { fontSize: 10, color: 'rgb(156, 163, 175)' },
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgb(245, 243, 238)' },
  cardBtnPrimary: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: 'rgba(15, 61, 37, 0.08)' },
  cardBtnPrimaryText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  cardBtnGold: { flex: 1, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 5, backgroundColor: 'rgba(201, 162, 39, 0.12)', borderLeftWidth: 1, borderLeftColor: 'rgb(245, 243, 238)' },
  cardBtnGoldText: { fontSize: 12, fontWeight: '700', color: 'rgb(122, 92, 0)' },
  cardBtnDanger: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderLeftWidth: 1, borderLeftColor: 'rgb(245, 243, 238)' },
  cardBtnDangerText: { fontSize: 12, fontWeight: '700', color: COLORS.danger },

  // Empty
  emptyWrap: { paddingTop: 60, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  emptySub: { fontSize: 13, color: COLORS.textSecondary },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 8, paddingHorizontal: 24, paddingVertical: 11,
    borderRadius: 20, backgroundColor: COLORS.primary,
  },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});
