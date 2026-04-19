import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, FlatList, RefreshControl, Dimensions, TextInput,
  Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { vehiclesAPI, propertiesAPI, bookingsAPI, driversAPI, notificationsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

const SERVICES = [
  { key: 'vehicle',  label: 'Automobile',  sub: 'Location de véhicules', icon: 'car-sport', tab: 'Catalogue', image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=80' },
  { key: 'property', label: 'Immobilier',  sub: 'Villas & Appartements',  icon: 'business',  tab: 'Catalogue', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80' },
  { key: 'driver',   label: 'Chauffeurs',  sub: 'Avec véhicule de série', icon: 'people',    tab: 'Catalogue', image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&q=80' },
];

function FeaturedCard({ item, type, onPress }) {
  const isVehicle = type === 'vehicle';
  const title = isVehicle ? `${item.brand} ${item.model}` : (item.title || `${item.first_name} ${item.last_name}`);
  const isSale = isVehicle
    ? item.offer_type === 'sale'
    : item.offer_type === 'sale' || (item.offer_type === 'both' && !item.monthly_rent);
  const price = isVehicle
    ? Number(isSale ? (item.sale_price || 0) : (item.daily_rate || item.price_per_day || item.rate_per_day || 0))
    : Number(isSale ? (item.sale_price || 0) : (item.monthly_rent || item.price_per_month || 0));
  const unit = type === 'property' ? (isSale ? '' : '/mois') : (isSale ? '' : '/jour');
  const imageUri = item.media?.[0]?.url || item.photo_url || item.avatar_url;
  const rating = item.rating || item.average_rating;
  const reviews = item.reviews_count || item.total_reviews;
  const badge = item.badge || (isVehicle ? 'Populaire' : type === 'property' ? 'Exclusif' : 'Top chauffeur');
  const typeLabel = isVehicle ? 'Auto' : type === 'property' ? 'Immo' : 'Chauffeur';
  const typeIcon = isVehicle ? 'car-sport' : type === 'property' ? 'business' : 'people';

  return (
    <TouchableOpacity style={styles.featCard} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.featImgWrap}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.featImg} resizeMode="cover" />
        ) : (
          <View style={[styles.featImg, styles.featImgPlaceholder]}>
            <Ionicons name={typeIcon} size={34} color={COLORS.cream[400]} />
          </View>
        )}
        {/* Badge haut gauche */}
        <View style={styles.featBadge}>
          <Text style={styles.featBadgeText}>{badge}</Text>
        </View>
        {/* Rating haut droit */}
        {rating ? (
          <View style={styles.featRatingWrap}>
            <Text style={styles.featRatingText}>{Number(rating).toFixed(1)}</Text>
          </View>
        ) : null}
        {/* Type badge bas gauche sur image */}
        <View style={styles.featTypeBadge}>
          <Text style={styles.featTypeBadgeText}>{typeLabel}</Text>
        </View>
      </View>
      <View style={styles.featBody}>
        <Text style={styles.featTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.featCity}>{item.city || 'Abidjan'}</Text>
        <Text style={styles.featPrice}>
          <Text style={styles.featPriceValue}>{price > 0 ? price.toLocaleString('fr-FR') : '—'}</Text>
          {price > 0 ? <Text style={styles.featUnit}> FCFA{unit}</Text> : null}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function OfferCard({ item, type, onPress }) {
  const isVehicle = type === 'vehicle';
  const isDriver = type === 'driver';
  const title = isDriver
    ? `${item.first_name} ${item.last_name}`
    : isVehicle ? `${item.brand} ${item.model}` : item.title;
  const isSale = isVehicle
    ? item.offer_type === 'sale'
    : item.offer_type === 'sale' || (item.offer_type === 'both' && !item.monthly_rent);
  const price = isVehicle
    ? Number(isSale ? (item.sale_price || 0) : (item.daily_rate || item.price_per_day || item.rate_per_day || 0))
    : Number(isSale ? (item.sale_price || 0) : (item.monthly_rent || item.price_per_month || 0));
  const unit = type === 'property' ? (isSale ? '' : '/mois') : (isSale ? '' : '/jour');
  const imageUri = item.media?.[0]?.url || item.photo_url || item.avatar_url;
  const categoryIcon = isDriver ? 'people' : isVehicle ? 'car-sport' : 'business';
  const badgeText = item.badge || (isDriver ? 'Chauffeur' : isVehicle ? 'Auto' : 'Immo');
  const rating = item.rating || item.average_rating;
  const reviews = item.reviews_count || item.total_reviews;

  return (
    <TouchableOpacity style={styles.offerCard} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.offerImgWrap}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.offerImg} resizeMode="cover" />
        ) : (
          <View style={[styles.offerImg, styles.offerImgPlaceholder]}>
            <Ionicons name={categoryIcon} size={28} color={COLORS.cream[400]} />
          </View>
        )}
        <View style={styles.offerBadgeWrap}>
          <Text style={styles.offerBadgeText}>{badgeText}</Text>
        </View>
        {rating ? (
          <View style={styles.offerRatingWrap}>
            <Ionicons name="star" size={9} color={'rgb(10,37,24)'} />
            <Text style={styles.offerRatingText}>{Number(rating).toFixed(1)}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.offerBody}>
        <Text style={styles.offerTitle} numberOfLines={2}>{title}</Text>
        <View style={styles.offerLocation}>
          <Ionicons name="location-outline" size={10} color={COLORS.textSecondary} />
          <Text style={styles.offerCity}>{item.city || 'Abidjan'}</Text>
        </View>
        <View style={styles.offerPriceRow}>
          <Text style={styles.offerPrice}>{price > 0 ? price.toLocaleString('fr-FR') : '—'}</Text>
          {price > 0 ? <Text style={styles.offerUnit}> FCFA</Text> : null}
          {reviews ? <Text style={styles.offerReviews}> · {reviews} avis</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [properties, setProperties] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [stats, setStats] = useState({ vehicles: 0, properties: 0, drivers: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [networkError, setNetworkError] = useState(false);

  const fetchData = useCallback(async () => {
    setNetworkError(false);
    try {
      const params = { per_page: 6, status: 'available' };
      const promises = [
        vehiclesAPI.list(params),
        propertiesAPI.list(params),
        driversAPI.list({ per_page: 6 }),
      ];
      if (isAuthenticated) {
        promises.push(bookingsAPI.list({ per_page: 3 }));
        promises.push(notificationsAPI.list().catch(() => null));
      }
      const results = await Promise.allSettled(promises);
      const v = results[0].status === 'fulfilled' ? (results[0].value.data?.data || []) : [];
      const p = results[1].status === 'fulfilled' ? (results[1].value.data?.data || []) : [];
      const d = results[2].status === 'fulfilled' ? (results[2].value.data?.data || []) : [];
      setVehicles(Array.isArray(v) ? v : v.data || []);
      setProperties(Array.isArray(p) ? p : p.data || []);
      setDrivers(Array.isArray(d) ? d : d.data || []);
      setStats({
        vehicles: Array.isArray(v) ? v.length : (v.total || 0),
        properties: Array.isArray(p) ? p.length : (p.total || 0),
        drivers: Array.isArray(d) ? d.length : (d.total || 0),
      });
      if (isAuthenticated && results[3]?.status === 'fulfilled') {
        const b = results[3].value?.data?.data || [];
        setRecentBookings(Array.isArray(b) ? b.slice(0, 3) : []);
      }
      if (isAuthenticated && results[4]?.status === 'fulfilled') {
        setUnreadCount(results[4].value?.data?.unread_count || 0);
      }
    } catch (e) {
      console.error('Erreur accueil:', e);
      setNetworkError(true);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const firstName = isAuthenticated ? (user?.first_name || 'Utilisateur') : null;

  const allOffers = [
    ...vehicles.slice(0, 3).map(v => ({ ...v, _type: 'vehicle' })),
    ...properties.slice(0, 2).map(p => ({ ...p, _type: 'property' })),
    ...drivers.slice(0, 2).map(d => ({ ...d, _type: 'driver' })),
  ];

  const goToCatalogue = (filter) => {
    navigation.getParent()?.navigate('Catalogue');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView
        style={styles.screen}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* ── HEADER ─────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerDecor1} />
          <View style={styles.headerDecor2} />

          {/* Top row */}
          <View style={styles.headerTopRow}>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Notifications')}>
                <Ionicons name="notifications-outline" size={20} color={'#C9A227'} />
                {unreadCount > 0 && <View style={styles.bellBadge}><Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text></View>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatarBtn} onPress={() => isAuthenticated ? navigation.navigate('ProfileMain') : navigation.navigate('AuthModal')}>
                {isAuthenticated ? (
                  user?.avatar_url ? (
                    <Image source={{ uri: user.avatar_url }} style={styles.avatarImg} />
                  ) : (
                    <Text style={styles.avatarText}>{firstName ? firstName[0]?.toUpperCase() : 'U'}</Text>
                  )
                ) : (
                  <Ionicons name="person-outline" size={20} color={'#C9A227'} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Greeting */}
          {isAuthenticated && firstName ? (
            <>
              <Text style={styles.greeting}>{greeting}, {firstName} 👋</Text>
              <Text style={styles.greetingSub}>Que recherchez-vous aujourd'hui ?</Text>
            </>
          ) : (
            <>
              <Text style={styles.greeting}>Bienvenue sur TDA 👋</Text>
              <Text style={styles.greetingSub}>Découvrez nos services premium</Text>
            </>
          )}

          {/* Search */}
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.getParent()?.navigate('Catalogue')}
            activeOpacity={0.9}
          >
            <Ionicons name="search" size={17} color={COLORS.textSecondary} />
            <Text style={styles.searchPlaceholder}>Véhicule, villa, chauffeur...</Text>
            <View style={styles.searchBtn}>
              <Text style={styles.searchBtnText}>Chercher</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── ERREUR RÉSEAU ─────────────────────── */}
        {networkError && (
          <View style={styles.networkErrorBanner}>
            <Ionicons name="cloud-offline-outline" size={18} color={COLORS.danger} />
            <Text style={styles.networkErrorText}>Erreur réseau — données non chargées</Text>
            <TouchableOpacity onPress={fetchData} style={styles.networkErrorBtn}>
              <Text style={styles.networkErrorBtnText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── NOS SERVICES ──────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View>
              <Text style={styles.sectionTitle}>Nos services</Text>
              <Text style={styles.sectionSub}>Choisissez votre catégorie</Text>
            </View>
            <TouchableOpacity onPress={goToCatalogue} style={styles.seeAll}>
              <Text style={styles.seeAllText}>Tout voir</Text>
            </TouchableOpacity>
          </View>
          {SERVICES.map((svc) => (
            <TouchableOpacity key={svc.key} style={styles.serviceCard} onPress={() => goToCatalogue(svc.key)} activeOpacity={0.88}>
              <Image source={{ uri: svc.image }} style={styles.serviceCardBg} resizeMode="cover" />
              <View style={styles.serviceCardOverlay} />
              <View style={styles.serviceCardContent}>
                <View style={styles.serviceIconWrap}>
                  <Ionicons name={svc.icon} size={20} color={COLORS.white} />
                </View>
                <View style={styles.serviceBody}>
                  <Text style={styles.serviceLabel}>{svc.label}</Text>
                  <Text style={styles.serviceSub}>{svc.sub}</Text>
                  <View style={styles.serviceCountWrap}>
                    <View style={styles.serviceCountDot} />
                    <Text style={styles.serviceCount}>
                      {svc.key === 'vehicle' ? stats.vehicles : svc.key === 'property' ? stats.properties : stats.drivers}{' '}
                      {svc.key === 'vehicle' ? 'véhicules' : svc.key === 'property' ? 'biens' : 'chauffeurs'}
                    </Text>
                  </View>
                </View>
                <View style={styles.serviceArrow}>
                  <Ionicons name="arrow-forward" size={16} color={'rgb(10,37,24)'} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── VÉHICULES EN VEDETTE ────────────────── */}
        {vehicles.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <View>
                <Text style={styles.sectionTitle}>Véhicules en vedette</Text>
                <Text style={styles.sectionSub}>Disponibles maintenant</Text>
              </View>
              <TouchableOpacity onPress={goToCatalogue} style={styles.seeAll}>
                <Text style={styles.seeAllText}>Voir tout</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={vehicles}
              keyExtractor={(item) => `feat-v-${item.id}`}
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -16 }}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              renderItem={({ item }) => (
                <FeaturedCard item={item} type="vehicle" onPress={() => navigation.navigate('VehicleDetail', { id: item.id })} />
              )}
            />
          </View>
        )}

        {/* ── OFFRES DISPONIBLES ──────────────────── */}
        {allOffers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <View>
                <Text style={styles.sectionTitle}>Offres disponibles</Text>
                <Text style={styles.sectionSub}>Sélection du moment</Text>
              </View>
              <TouchableOpacity onPress={goToCatalogue} style={styles.seeAll}>
                <Text style={styles.seeAllText}>Voir tout</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.offersGrid}>
              {allOffers.map((item) => (
                <OfferCard
                  key={`${item._type}-${item.id}`}
                  item={item}
                  type={item._type}
                  onPress={() => {
                    if (item._type === 'vehicle') navigation.navigate('VehicleDetail', { id: item.id });
                    else if (item._type === 'property') navigation.navigate('PropertyDetail', { id: item.id });
                    else navigation.navigate('DriverDetail', { id: item.id });
                  }}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── MES RÉSERVATIONS (band) ─────────────── */}
        {isAuthenticated && (
          <TouchableOpacity
            style={styles.bookingsBand}
            onPress={() => navigation.getParent()?.navigate('Bookings')}
            activeOpacity={0.9}
          >
            <View style={styles.bookingsBandIcon}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bookingsBandTitle}>Mes réservations</Text>
              <Text style={styles.bookingsBandSub}>Suivez vos demandes en temps réel</Text>
            </View>
            <View style={styles.bookingsBandArrow}>
              <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.primary },
  screen: { flex: 1, backgroundColor: 'rgb(245,243,238)' },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  headerDecor1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: COLORS.white, opacity: 0.08, top: -60, right: -50 },
  headerDecor2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.white, opacity: 0.1, bottom: 0, left: -30 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16 },
  headerBadge: { backgroundColor: 'rgba(255, 255, 255, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.3)' },
  headerBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBtn: { width: 40, height: 40, borderRadius: 16, backgroundColor: 'rgba(201,162,39,0.15)', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  bellBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: COLORS.danger, borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.white },
  bellBadgeText: { fontSize: 9, fontWeight: '700', color: COLORS.white },
  avatarBtn: { width: 40, height: 40, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 2, borderColor: '#C9A227' },
  avatarImg: { width: 36, height: 36, borderRadius: 12 },
  avatarText: { color: '#C9A227', fontWeight: '900', fontSize: 15 },
  greeting: { color: COLORS.white, fontSize: 20, fontWeight: '700', marginBottom: 2 },
  greetingSub: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginBottom: 16 },

  // Search in header
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 20,
    marginTop: 8,
  },
  searchPlaceholder: { flex: 1, fontSize: 14, color: COLORS.textSecondary },
  searchBtn: { backgroundColor: 'rgba(201,162,39,0.15)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16 },
  searchBtnText: { color: '#C9A227', fontSize: 13, fontWeight: '700' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 2 },
  statValue: { color: COLORS.white, fontSize: 17, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '500' },

  // Sections
  section: { paddingTop: 20, paddingHorizontal: 16 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: 'rgb(17,24,39)' },
  sectionSub: { fontSize: 11, color: 'rgb(156,163,175)', marginTop: 2 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontSize: 12, color: '#C9A227', fontWeight: '700' },

  // Service cards
  serviceCard: {
    position: 'relative',
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  serviceCardBg: { position: 'absolute', width: '100%', height: '100%' },
  serviceCardOverlay: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(10,37,24,0.75)' },
  serviceCardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12, zIndex: 1 },
  serviceIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  serviceBody: { flex: 1 },
  serviceLabel: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  serviceSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  serviceCountWrap: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  serviceCountDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
  serviceCount: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  serviceArrow: { width: 32, height: 32, borderRadius: 999, backgroundColor: 'rgba(201,162,39,0.2)', justifyContent: 'center', alignItems: 'center' },

  // Featured cards (horizontal)
  featCard: {
    width: 174,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  featImgWrap: { height: 115, position: 'relative' },
  featImg: { width: '100%', height: '100%' },
  featImgPlaceholder: { backgroundColor: COLORS.cream[200], justifyContent: 'center', alignItems: 'center' },
  featBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#C9A227', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  featBadgeText: { color: 'rgb(10,37,24)', fontSize: 9, fontWeight: '700' },
  featRatingWrap: { position: 'absolute', top: 8, right: 8, backgroundColor: '#C9A227', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  featRatingText: { color: 'rgb(10,37,24)', fontSize: 9, fontWeight: '700' },
  featTypeBadge: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(10,37,24,0.7)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  featTypeBadgeText: { color: 'rgba(255,255,255,0.9)', fontSize: 9, fontWeight: '700' },
  featBody: { padding: 10, gap: 2 },
  featTitle: { color: 'rgb(31,41,55)', fontSize: 12, fontWeight: '700' },
  featCity: { color: 'rgb(156,163,175)', fontSize: 10 },
  featPrice: {},
  featPriceValue: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  featUnit: { fontSize: 9, fontWeight: '400', color: 'rgb(156,163,175)' },

  // Offers grid
  offersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  offerCard: {
    width: (width - 42) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  offerImgWrap: { height: 120, position: 'relative' },
  offerImg: { width: '100%', height: '100%' },
  offerImgPlaceholder: { backgroundColor: COLORS.cream[200], justifyContent: 'center', alignItems: 'center' },
  offerBadgeWrap: { position: 'absolute', top: 7, left: 7, backgroundColor: '#C9A227', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  offerBadgeText: { color: 'rgb(10,37,24)', fontSize: 9, fontWeight: '700' },
  offerRatingWrap: { position: 'absolute', top: 7, right: 7, flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#C9A227', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 999 },
  offerRatingText: { color: 'rgb(10,37,24)', fontSize: 9, fontWeight: '700' },
  offerBody: { padding: 10, gap: 3 },
  offerTitle: { fontSize: 12, fontWeight: '700', color: 'rgb(31,41,55)', lineHeight: 16 },
  offerLocation: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  offerCity: { fontSize: 10, color: 'rgb(156,163,175)' },
  offerPriceRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' },
  offerPrice: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  offerUnit: { fontSize: 9, fontWeight: '400', color: 'rgb(156,163,175)' },
  offerReviews: { fontSize: 9, color: 'rgb(156,163,175)' },

  // Bookings band
  bookingsBand: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,160,48,0.2)',
  },
  bookingsBandIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(212,160,48,0.15)', justifyContent: 'center', alignItems: 'center' },
  bookingsBandTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  bookingsBandSub: { color: 'rgba(201,162,39,0.7)', fontSize: 11, marginTop: 1 },
  bookingsBandArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(212,160,48,0.15)', justifyContent: 'center', alignItems: 'center' },

  // Network error banner
  networkErrorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 12, marginBottom: 4,
    backgroundColor: COLORS.danger + '12',
    borderWidth: 1, borderColor: COLORS.danger + '30',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  networkErrorText: { flex: 1, fontSize: 13, color: COLORS.danger, fontWeight: '500' },
  networkErrorBtn: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: COLORS.danger, borderRadius: 8 },
  networkErrorBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
});
