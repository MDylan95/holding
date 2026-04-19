import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, TextInput, RefreshControl, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { driversAPI } from '../../services/api';
import useDebounce from '../../hooks/useDebounce';

const STATUS_LABELS = {
  available: { label: 'Disponible', color: COLORS.green[600], bg: '#E8F5E9' },
  on_mission: { label: 'En mission', color: '#F59E0B', bg: '#FEF3C7' },
  off_duty: { label: 'Repos', color: COLORS.silver[500], bg: COLORS.silver[100] },
  unavailable: { label: 'Indisponible', color: '#EF4444', bg: '#FEF2F2' },
};

function DriverCard({ driver, onPress }) {
  const initials = `${driver.first_name?.[0] || ''}${driver.last_name?.[0] || ''}`.toUpperCase();
  const status = STATUS_LABELS[driver.status] || STATUS_LABELS.unavailable;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.cardLeft}>
        {driver.avatar_url ? (
          <Image source={{ uri: driver.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
        )}
        <View style={[styles.statusDot, { backgroundColor: status.color }]} />
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.driverName}>{driver.first_name} {driver.last_name}</Text>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={13} color={COLORS.silver[400]} />
          <Text style={styles.infoText}>{driver.city || 'Non précisé'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={13} color={COLORS.silver[400]} />
          <Text style={styles.infoText}>{driver.experience_years || 0} an(s) d'expérience</Text>
        </View>
      </View>

      <View style={styles.cardRight}>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
        {driver.daily_rate > 0 && (
          <Text style={styles.rate}>{Number(driver.daily_rate).toLocaleString()} <Text style={styles.rateUnit}>FCFA/j</Text></Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function DriversScreen({ navigation }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const FILTERS = [
    { key: 'all', label: 'Tous' },
    { key: 'available', label: 'Disponibles' },
    { key: 'on_mission', label: 'En mission' },
  ];

  const fetchDrivers = useCallback(async (pageNum = 1, replace = false) => {
    try {
      const params = { page: pageNum, per_page: 15 };
      if (activeFilter !== 'all') params.status = activeFilter;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const res = await driversAPI.list(params);
      const result = res.data;
      const newDrivers = result.data || [];
      setDrivers((prev) => replace || pageNum === 1 ? newDrivers : [...prev, ...newDrivers]);
      setPage(pageNum);
      setHasMore(result.current_page < result.last_page);
    } catch (e) {
      console.error('Erreur chauffeurs:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch, activeFilter]);

  useEffect(() => { setLoading(true); fetchDrivers(1); }, [debouncedSearch, activeFilter]);

  const onRefresh = () => { setRefreshing(true); fetchDrivers(1, true); };
  const loadMore = () => { if (hasMore && !loading) fetchDrivers(page + 1); };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={17} color={COLORS.silver[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un chauffeur..."
            placeholderTextColor={COLORS.silver[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={17} color={COLORS.silver[300]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
            onPress={() => setActiveFilter(f.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, activeFilter === f.key && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={drivers}
        keyExtractor={(item) => `driver-${item.id}`}
        renderItem={({ item }) => (
          <DriverCard
            driver={item}
            onPress={() => navigation.navigate('DriverDetail', { id: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.green[600]} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="person-outline" size={52} color={COLORS.silver[300]} />
              <Text style={styles.emptyText}>Aucun chauffeur trouvé</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: COLORS.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.silver[50],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.silver[200],
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.silver[800], padding: 0 },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.silver[100],
    borderWidth: 1,
    borderColor: COLORS.silver[200],
  },
  filterChipActive: {
    backgroundColor: COLORS.green[700],
    borderColor: COLORS.green[700],
  },
  filterChipText: { fontSize: 13, fontWeight: '500', color: COLORS.silver[600] },
  filterChipTextActive: { color: COLORS.white },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.silver[100],
  },
  cardLeft: { position: 'relative' },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.green[700] + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontSize: 18, fontWeight: '700', color: COLORS.green[700] },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  cardBody: { flex: 1, gap: 3 },
  driverName: { fontSize: 15, fontWeight: '700', color: COLORS.silver[800] },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 12, color: COLORS.silver[500] },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },
  rate: { fontSize: 13, fontWeight: '700', color: COLORS.green[700] },
  rateUnit: { fontSize: 11, fontWeight: '400', color: COLORS.silver[500] },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: COLORS.silver[400], fontWeight: '500' },
});
