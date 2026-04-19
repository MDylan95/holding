import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView,
  Image, TextInput, RefreshControl, ActivityIndicator,
  Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { vehiclesAPI, propertiesAPI, driversAPI } from '../../services/api';
import useDebounce from '../../hooks/useDebounce';

const FILTERS = [
  { key: 'all',        label: 'Tout',        icon: 'apps' },
  { key: 'vehicle',    label: 'Automobile',  icon: 'car-sport' },
  { key: 'property',   label: 'Immobilier',  icon: 'business' },
  { key: 'driver',     label: 'Chauffeur',   icon: 'people' },
];

const BADGE_COLORS = {
  Populaire:      { bg: '#C9A227', text: 'rgb(10, 37, 24)' },
  Premium:        { bg: '#C9A227', text: 'rgb(10, 37, 24)' },
  Exclusif:       { bg: '#C9A227', text: 'rgb(10, 37, 24)' },
  Nouveau:        { bg: '#C9A227', text: 'rgb(10, 37, 24)' },
  Indisponible:   { bg: '#FEE2E2', text: '#991B1B' },
  'Top chauffeur':{ bg: '#C9A227', text: 'rgb(10, 37, 24)' },
  Événementiel:   { bg: '#C9A227', text: 'rgb(10, 37, 24)' },
  Aéroport:       { bg: '#C9A227', text: 'rgb(10, 37, 24)' },
};

function ItemBadge({ label }) {
  if (!label) return null;
  const scheme = BADGE_COLORS[label] || { bg: COLORS.cream[200], text: COLORS.textPrimary };
  return (
    <View style={[styles.badge, { backgroundColor: scheme.bg }]}>
      <Text style={[styles.badgeText, { color: scheme.text }]}>{label}</Text>
    </View>
  );
}

function CatalogueCard({ item, onPress }) {
  const isDriver = item._type === 'driver';
  const isProperty = item._type === 'property';

  const imageUri = item.media?.[0]?.url || item.photo_url || item.avatar_url || null;
  const title = isDriver
    ? `${item.first_name} ${item.last_name}`
    : item.title || item.name || item.brand + ' ' + item.model;
  const location = item.city || item.location || 'Abidjan';
  const price = isProperty
    ? (item.monthly_rent || item.sale_price)
    : (item.daily_rate);
  const unit = isProperty
    ? (item.monthly_rent ? '/mois' : '')
    : '/jour';
  const category = isDriver ? 'Chauffeur' : isProperty ? 'Immobilier' : 'Automobile';
  const categoryIcon = isDriver ? 'people' : isProperty ? 'business' : 'car-sport';
  const badge = item.badge || item.highlight || null;
  const rating = item.rating || item.average_rating;
  const reviews = item.reviews_count || item.total_reviews;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardImageWrap}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <Ionicons name={categoryIcon} size={32} color={COLORS.cream[400]} />
          </View>
        )}
        {badge && (
          <View style={styles.cardBadgeWrap}>
            <ItemBadge label={badge} />
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardCategoryRow}>
          <Ionicons name={categoryIcon} size={12} color="#C9A227" />
          <Text style={styles.cardCategory}>{category}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
        <View style={styles.cardLocationRow}>
          <Ionicons name="location-outline" size={11} color={COLORS.textSecondary} />
          <Text style={styles.cardLocation}>{location}</Text>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>
            {price ? <Text style={styles.cardPriceValue}>{Number(price).toLocaleString('fr-FR')}</Text> : '—'}
            {price ? <Text style={styles.cardUnit}> FCFA{unit}</Text> : null}
          </Text>
          {rating ? (
            <View style={styles.cardRating}>
              <Ionicons name="star" size={11} color="#C9A227" />
              <Text style={styles.cardRatingText}>{Number(rating).toFixed(1)}</Text>
              {reviews ? <Text style={styles.cardReviews}>({reviews})</Text> : null}
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CatalogueScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const PER_PAGE = 20;
  const debouncedSearch = useDebounce(search, 350);

  const fetchAll = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    setNetworkError(false);
    try {
      const params = { search: debouncedSearch || undefined, per_page: PER_PAGE, page: pageNum };
      const promises = [];
      if (activeFilter === 'all' || activeFilter === 'vehicle')
        promises.push(vehiclesAPI.list(params).then(r => ({ items: (r.data?.data || []).map(v => ({ ...v, _type: 'vehicle' })), total: r.data?.total || 0, lastPage: r.data?.last_page || 1 })));
      if (activeFilter === 'all' || activeFilter === 'property')
        promises.push(propertiesAPI.list(params).then(r => ({ items: (r.data?.data || []).map(p => ({ ...p, _type: 'property' })), total: r.data?.total || 0, lastPage: r.data?.last_page || 1 })));
      if (activeFilter === 'all' || activeFilter === 'driver')
        promises.push(driversAPI.list(params).then(r => ({ items: (r.data?.data || []).map(d => ({ ...d, _type: 'driver' })), total: r.data?.total || 0, lastPage: r.data?.last_page || 1 })));

      const results = await Promise.allSettled(promises);
      const fulfilled = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      const merged = fulfilled.flatMap(r => r.items);
      const anyHasMore = fulfilled.some(r => pageNum < r.lastPage);
      setHasMore(anyHasMore);
      setItems(prev => append ? [...prev, ...merged] : merged);
      setPage(pageNum);
    } catch {
      if (!append) setItems([]);
      setNetworkError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeFilter, debouncedSearch]);

  useEffect(() => { fetchAll(1); }, [fetchAll]);

  const onRefresh = async () => { setRefreshing(true); await fetchAll(1); setRefreshing(false); };

  const onLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      setLoadingMore(true);
      fetchAll(page + 1, true);
    }
  };

  const handlePress = (item) => {
    if (item._type === 'vehicle') navigation.navigate('VehicleDetail', { id: item.id });
    else if (item._type === 'property') navigation.navigate('PropertyDetail', { id: item.id });
    else navigation.navigate('DriverDetail', { id: item.id });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={20} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={17} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              placeholderTextColor={COLORS.textSecondary}
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
          <TouchableOpacity style={styles.headerBtn} onPress={() => setActiveFilter('all')}>
            <Ionicons name="options" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
          style={styles.filtersScroll}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={activeFilter === f.key ? styles.filterChipActive : styles.filterChip}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={f.icon}
                size={13}
                color={activeFilter === f.key ? '#C9A227' : COLORS.textSecondary}
                style={{ marginRight: 5 }}
              />
              <Text style={activeFilter === f.key ? styles.filterTextActive : styles.filterText}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Count */}
      {!loading && (
        <Text style={styles.countText}>{items.length} résultat{items.length !== 1 ? 's' : ''}</Text>
      )}

      {/* List */}
      <FlatList
        data={items}
        keyExtractor={(item) => `${item._type}-${item.id}`}
        renderItem={({ item }) => <CatalogueCard item={item} onPress={() => handlePress(item)} />}
        contentContainerStyle={styles.list}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 16 }} /> : null}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : networkError ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="cloud-offline-outline" size={48} color={COLORS.cream[400]} />
              <Text style={styles.emptyText}>Erreur réseau</Text>
              <Text style={styles.emptySubText}>Vérifiez votre connexion internet</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchAll}>
                <Ionicons name="refresh-outline" size={16} color={COLORS.primary} />
                <Text style={styles.retryBtnText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Ionicons name="search-outline" size={48} color={COLORS.cream[400]} />
              <Text style={styles.emptyText}>Aucun résultat</Text>
              <Text style={styles.emptySubText}>Modifiez votre recherche ou filtre</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'rgb(245, 243, 238)' },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 16,
    backgroundColor: 'rgba(201, 162, 39, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary, padding: 0 },
  filtersWrapper: { backgroundColor: COLORS.white, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgb(245, 243, 238)' },
  filtersScroll: { backgroundColor: COLORS.white },
  filtersRow: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgb(245, 243, 238)',
  },
  filterChipActive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  filterText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  filterTextActive: { fontSize: 12, fontWeight: '700', color: '#C9A227' },
  countText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  list: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 12, gap: 12, backgroundColor: 'rgb(245, 243, 238)' },
  loadingWrap: { paddingTop: 60, alignItems: 'center', backgroundColor: 'rgb(245, 243, 238)', flex: 1 },
  emptyWrap: { paddingTop: 60, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  emptySubText: { fontSize: 13, color: COLORS.textSecondary },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.primary,
  },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  cardImageWrap: { width: 120, height: 120, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  cardImagePlaceholder: {
    backgroundColor: COLORS.cream[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBadgeWrap: { position: 'absolute', top: 8, left: 8 },
  cardBody: { flex: 1, padding: 12, justifyContent: 'space-between' },
  cardCategoryRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  cardCategory: { fontSize: 10, color: '#C9A227', fontWeight: '700' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: 'rgb(31, 41, 55)', marginBottom: 2 },
  cardLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 },
  cardLocation: { fontSize: 10, color: 'rgb(156, 163, 175)' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardPrice: { fontSize: 14 },
  cardPriceValue: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  cardUnit: { fontSize: 10, fontWeight: '400', color: 'rgb(156, 163, 175)' },
  cardRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardRatingText: { fontSize: 12, fontWeight: '700', color: 'rgb(75, 85, 99)' },
  cardReviews: { fontSize: 10, color: 'rgb(156, 163, 175)' },

  // Badge
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: 9, fontWeight: '700' },
});
