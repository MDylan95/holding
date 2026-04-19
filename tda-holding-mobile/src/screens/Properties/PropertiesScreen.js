import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView,
  Image, TextInput, RefreshControl, ActivityIndicator, Dimensions,
  Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { propertiesAPI } from '../../services/api';
import EmptyState from '../../components/EmptyState';
import useDebounce from '../../hooks/useDebounce';

const { width } = Dimensions.get('window');
const CARD_W = (width - SIZES.md * 2 - SIZES.sm) / 2;

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'location', label: 'Location' },
  { key: 'sale', label: 'Vente' },
  { key: 'Appartement', label: 'Appart.' },
  { key: 'Maison', label: 'Maison' },
  { key: 'Terrain', label: 'Terrain' },
];

export default function PropertiesScreen({ navigation }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchProperties = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      const params = { page: pageNum, per_page: 12, status: 'available' };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (activeFilter === 'location') params.offer_type = 'rent';
      else if (activeFilter === 'sale') params.offer_type = 'sale';
      else if (activeFilter !== 'all') params.type = activeFilter;
      const res = await propertiesAPI.list(params);
      const data = res.data.data?.data || res.data.data || [];
      const lastPage = res.data.data?.last_page || 1;
      if (isRefresh || pageNum === 1) setProperties(data);
      else setProperties((prev) => [...prev, ...data]);
      setHasMore(pageNum < lastPage);
      setPage(pageNum);
    } catch (e) {
      console.error('Erreur biens:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch, activeFilter]);

  useEffect(() => { setLoading(true); fetchProperties(1); }, [debouncedSearch, activeFilter]);

  const onRefresh = () => { setRefreshing(true); fetchProperties(1, true); };
  const loadMore = () => { if (hasMore && !loading) fetchProperties(page + 1); };

  const renderItem = ({ item }) => {
    const imageUri = item.media?.[0]?.url;
    const isSale = item.offer_type === 'sale' || (item.offer_type === 'both' && !item.monthly_rent);
    const price = Number(isSale ? (item.sale_price || 0) : (item.monthly_rent || 0));
    const badgeLabel = isSale ? 'Vente' : 'Location';
    const badgeBg = COLORS.green[600];

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PropertyDetail', { id: item.id })}
        activeOpacity={0.88}
      >
        <View style={styles.imgWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.img} resizeMode="cover" />
          ) : (
            <View style={styles.imgPlaceholder}>
              <Ionicons name="business" size={32} color={COLORS.green[300]} />
            </View>
          )}
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title || '—'}</Text>
          {item.type && (
            <Text style={styles.cardType}>{item.type}</Text>
          )}
          <View style={styles.cardFeatures}>
            {item.bedrooms > 0 && (
              <View style={styles.feat}>
                <Ionicons name="bed-outline" size={10} color={COLORS.silver[400]} />
                <Text style={styles.featText}>{item.bedrooms}</Text>
              </View>
            )}
            {item.bathrooms > 0 && (
              <View style={styles.feat}>
                <Ionicons name="water-outline" size={10} color={COLORS.silver[400]} />
                <Text style={styles.featText}>{item.bathrooms}</Text>
              </View>
            )}
            {item.surface > 0 && (
              <View style={styles.feat}>
                <Ionicons name="expand-outline" size={10} color={COLORS.silver[400]} />
                <Text style={styles.featText}>{item.surface}m²</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardPrice}>
            {price > 0 ? `${price.toLocaleString()} FCFA` : '— FCFA'}
            {!isSale && <Text style={styles.cardUnit}>/mois</Text>}
          </Text>
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
            placeholder="Titre, ville, type de bien…"
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
        data={properties}
        keyExtractor={(item) => `p-${item.id}`}
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
            <EmptyState icon="business-outline" title="Aucun bien trouvé" message="Modifiez votre recherche ou filtre" />
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
  imgWrap: { height: 110, position: 'relative' },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.green[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: { fontSize: 9, fontWeight: '700', color: COLORS.white },

  cardBody: { padding: SIZES.sm + 2 },
  cardTitle: { fontSize: 12, fontWeight: '700', color: '#0F172A', marginBottom: 2, lineHeight: 16 },
  cardType: { fontSize: 10, color: COLORS.green[600], fontWeight: '600', marginBottom: 4 },
  cardFeatures: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  feat: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  featText: { fontSize: 10, color: COLORS.silver[500] },
  cardPrice: { fontSize: 12, fontWeight: '800', color: COLORS.green[700] },
  cardUnit: { fontSize: 10, fontWeight: '400', color: COLORS.silver[400] },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  locText: { fontSize: 10, color: COLORS.silver[400] },

  loadingWrap: { alignItems: 'center', paddingVertical: SIZES.xxl, gap: 8 },
  loadingText: { fontSize: 13, color: COLORS.silver[400] },
});
