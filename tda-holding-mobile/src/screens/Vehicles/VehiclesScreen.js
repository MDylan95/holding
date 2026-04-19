import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView,
  Image, TextInput, RefreshControl, ActivityIndicator, Dimensions,
  Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { vehiclesAPI } from '../../services/api';
import EmptyState from '../../components/EmptyState';
import useDebounce from '../../hooks/useDebounce';

const { width } = Dimensions.get('window');
const CARD_W = (width - SIZES.md * 2 - SIZES.sm) / 2;

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'SUV', label: 'SUV' },
  { key: 'Berline', label: 'Berline' },
  { key: 'Utilitaire', label: 'Utilitaire' },
  { key: 'Pickup', label: 'Pickup' },
];

export default function VehiclesScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchVehicles = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      const params = { page: pageNum, per_page: 12, status: 'available' };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (activeFilter !== 'all') params.category = activeFilter;
      const res = await vehiclesAPI.list(params);
      const data = res.data.data?.data || res.data.data || [];
      const lastPage = res.data.data?.last_page || 1;
      if (isRefresh || pageNum === 1) setVehicles(data);
      else setVehicles((prev) => [...prev, ...data]);
      setHasMore(pageNum < lastPage);
      setPage(pageNum);
    } catch (e) {
      console.error('Erreur véhicules:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch, activeFilter]);

  useEffect(() => { setLoading(true); fetchVehicles(1); }, [debouncedSearch, activeFilter]);

  const onRefresh = () => { setRefreshing(true); fetchVehicles(1, true); };
  const loadMore = () => { if (hasMore && !loading) fetchVehicles(page + 1); };

  const renderItem = ({ item }) => {
    const imageUri = item.media?.[0]?.url;
    const isSale = item.offer_type === 'sale';
    const price = Number(isSale ? (item.sale_price || 0) : (item.daily_rate || 0));
    const priceUnit = isSale ? ' FCFA' : ' FCFA/j';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('VehicleDetail', { id: item.id })}
        activeOpacity={0.88}
      >
        <View style={styles.imgWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.img} resizeMode="cover" />
          ) : (
            <View style={styles.imgPlaceholder}>
              <Ionicons name="car-sport" size={32} color={COLORS.green[300]} />
            </View>
          )}
          {item.category?.name && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.category.name}</Text>
            </View>
          )}
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.brand} {item.model}</Text>
          <Text style={styles.cardSub} numberOfLines={1}>
            {[item.year, item.fuel_type].filter(Boolean).join(' · ')}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardPrice}>
              {price > 0 ? `${price.toLocaleString()}` : '—'}
              <Text style={styles.cardUnit}>{priceUnit}</Text>
            </Text>
          </View>
          {item.city && (
            <View style={styles.locRow}>
              <Ionicons name="location-outline" size={10} color={COLORS.silver[400]} />
              <Text style={styles.locText}>{item.city}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Search + Filters */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={17} color={COLORS.silver[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Marque, modèle, ville…"
            placeholderTextColor={COLORS.silver[400]}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.silver[300]} />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
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
        </ScrollView>
      </View>

      {/* Grid */}
      <FlatList
        data={vehicles}
        keyExtractor={(item) => `v-${item.id}`}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.green[600]} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={hasMore && !loading ? <ActivityIndicator color={COLORS.green[600]} style={{ marginVertical: 16 }} /> : null}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={COLORS.green[600]} />
              <Text style={styles.loadingText}>Chargement…</Text>
            </View>
          ) : (
            <EmptyState icon="car-sport-outline" title="Aucun véhicule trouvé" message="Modifiez votre recherche ou filtre" />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

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
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.silver[200],
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.silver[800], padding: 0 },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.silver[200],
  },
  filterChipActive: {
    backgroundColor: COLORS.green[700],
    borderColor: COLORS.green[700],
  },
  filterChipText: { fontSize: 13, fontWeight: '500', color: COLORS.silver[600] },
  filterChipTextActive: { color: COLORS.white },

  grid: { paddingHorizontal: SIZES.md, paddingBottom: SIZES.xl },
  row: { justifyContent: 'space-between', marginBottom: SIZES.sm },

  card: {
    width: CARD_W,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  imgWrap: { height: 120, position: 'relative' },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.green[600],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: { fontSize: 9, fontWeight: '700', color: COLORS.white },

  cardBody: { padding: SIZES.sm + 2 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  cardSub: { fontSize: 11, color: COLORS.silver[400], marginBottom: 6 },
  cardFooter: { flexDirection: 'row', alignItems: 'center' },
  cardPrice: { fontSize: 13, fontWeight: '800', color: COLORS.green[700] },
  cardUnit: { fontSize: 10, fontWeight: '400', color: COLORS.silver[400] },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  locText: { fontSize: 10, color: COLORS.silver[400] },

  loadingWrap: { alignItems: 'center', paddingVertical: SIZES.xxl, gap: 8 },
  loadingText: { fontSize: 13, color: COLORS.silver[400] },
});
