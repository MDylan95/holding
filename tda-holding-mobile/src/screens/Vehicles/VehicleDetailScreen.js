import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Dimensions, Alert, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { vehiclesAPI, favoritesAPI } from '../../services/api';
import useRequireAuth from '../../hooks/useRequireAuth';
import { useAuth } from '../../contexts/AuthContext';
import { DetailSkeleton } from '../../components/Skeleton';

const { width } = Dimensions.get('window');

export default function VehicleDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { requireAuth } = useRequireAuth();
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchVehicle();
    if (isAuthenticated) checkFavorite();
  }, [id, isAuthenticated]);

  const checkFavorite = async () => {
    try {
      const res = await favoritesAPI.list();
      const favs = res.data.favorites || [];
      setIsFavorite(favs.some(f => f.favorable_type?.includes('Vehicle') && f.favorable_id === id));
    } catch {}
  };

  const fetchVehicle = async () => {
    try {
      const res = await vehiclesAPI.detail(id);
      setVehicle(res.data.data);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger ce véhicule.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    requireAuth(async () => {
      try {
        await favoritesAPI.toggle({ favorable_type: 'vehicle', favorable_id: id });
        setIsFavorite(prev => !prev);
      } catch {}
    });
  };

  if (loading) return <DetailSkeleton />;
  if (!vehicle) return null;

  const images = vehicle.media || [];
  const isRent = vehicle.offer_type === 'rent';
  const isSale = vehicle.offer_type === 'sale';
  const isBoth = vehicle.offer_type === 'both';
  const isForSale = isSale || isBoth; // vente ou vente+location
  const price = isRent || isBoth
    ? Number(vehicle.daily_rate || 0)
    : Number(vehicle.sale_price || 0);
  const priceLabel = isRent ? 'Prix/jour' : (isSale ? 'Prix de vente' : 'Prix/jour');
  const priceUnit = isRent ? '/jour' : '';
  const specs = [
    { icon: 'calendar-outline',      label: 'Année',        value: vehicle.year },
    { icon: 'speedometer-outline',   label: 'Carburant',    value: vehicle.fuel_type },
    { icon: 'cog-outline',           label: 'Transmission', value: vehicle.transmission },
    { icon: 'people-outline',        label: 'Places',       value: vehicle.seats },
    { icon: 'color-palette-outline', label: 'Couleur',      value: vehicle.color },
    { icon: 'car-outline',           label: 'Plaque',       value: vehicle.plate_number },
  ].filter(s => s.value);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* ── Gallery ─────────────────────────── */}
        <View style={styles.gallery}>
          {images.length > 0 ? (
            <ScrollView
              horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={e => setImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            >
              {images.map((img, i) => (
                <Image key={i} source={{ uri: img.url }} style={styles.galleryImg} resizeMode="cover" />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.galleryPlaceholder}>
              <Ionicons name="car-sport-outline" size={56} color="rgba(255,255,255,0.4)" />
            </View>
          )}
          <View style={[StyleSheet.absoluteFill, styles.galleryOverlay]} />

          {/* Nav buttons */}
          <TouchableOpacity style={[styles.overlayBtn, { left: 16, top: insets.top + 12 }]} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.overlayBtn, { right: 16, top: insets.top + 12 }]} onPress={toggleFavorite}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#EF4444' : COLORS.white} />
          </TouchableOpacity>

          {/* Dots */}
          {images.length > 1 && (
            <View style={styles.dotsRow}>
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, i === imageIndex && styles.dotActive]} />
              ))}
            </View>
          )}

          {/* Price chip on image */}
          <View style={styles.priceChip}>
            <Text style={styles.priceChipText}>{price > 0 ? `${price.toLocaleString('fr-FR')} FCFA` : '—'}</Text>
            {priceUnit ? <Text style={styles.priceChipUnit}>{priceUnit}</Text> : null}
          </View>
          {!vehicle.is_available && (
            <View style={styles.reservedBadge}>
              <Ionicons name="lock-closed" size={14} color={COLORS.white} />
              <Text style={styles.reservedBadgeText}>Réservé</Text>
            </View>
          )}

          {isBoth && vehicle.sale_price > 0 && (
            <View style={[styles.priceChip, { bottom: 52, backgroundColor: 'rgba(218,165,32,0.9)' }]}>
              <Text style={styles.priceChipText}>{Number(vehicle.sale_price).toLocaleString('fr-FR')} FCFA</Text>
              <Text style={styles.priceChipUnit}> vente</Text>
            </View>
          )}
        </View>

        {/* ── Content ──────────────────────────── */}
        <View style={styles.content}>
          {/* Title + category */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{vehicle.brand} {vehicle.model}</Text>
              {vehicle.category?.name && (
                <View style={styles.catBadge}>
                  <Text style={styles.catText}>{vehicle.category.name}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.locationText}>{vehicle.city || 'Non précisé'}</Text>
          </View>

          {/* Specs */}
          {specs.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Caractéristiques</Text>
              <View style={styles.specsGrid}>
                {specs.map((s, i) => (
                  <View key={i} style={styles.specCard}>
                    <View style={styles.specIconWrap}>
                      <Ionicons name={s.icon} size={16} color={COLORS.primary} />
                    </View>
                    <Text style={styles.specLabel}>{s.label}</Text>
                    <Text style={styles.specValue}>{s.value}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Description */}
          {vehicle.description ? (
            <>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{vehicle.description}</Text>
            </>
          ) : null}

          {/* Driver */}
          {vehicle.driver ? (
            <>
              <Text style={styles.sectionTitle}>Chauffeur assigné</Text>
              <View style={styles.driverCard}>
                <View style={styles.driverAvatar}>
                  <Ionicons name="person" size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.driverName}>{vehicle.driver.first_name} {vehicle.driver.last_name}</Text>
                  {vehicle.driver.phone && <Text style={styles.driverPhone}>{vehicle.driver.phone}</Text>}
                </View>
                <View style={styles.driverBadge}>
                  <Text style={styles.driverBadgeText}>Chauffeur</Text>
                </View>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* ── Bottom CTA ───────────────────────── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={styles.bottomLabel}>{priceLabel}</Text>
          <Text style={styles.bottomPrice}>{price > 0 ? `${price.toLocaleString('fr-FR')} FCFA` : '—'}</Text>
          {isBoth && vehicle.sale_price > 0 && (
            <Text style={{ fontSize: 11, color: COLORS.gold?.[400] || '#C9A227' }}>
              Vente : {Number(vehicle.sale_price).toLocaleString('fr-FR')} FCFA
            </Text>
          )}
        </View>

        {/* Si location uniquement → Bouton Réserver classique */}
        {isRent && (
          <TouchableOpacity
            style={[styles.bookBtn, !vehicle.is_available && styles.bookBtnDisabled]}
            onPress={() => vehicle.is_available && requireAuth(() => navigation.navigate('Booking', { type: 'vehicle', item: vehicle }))}
            activeOpacity={vehicle.is_available ? 0.88 : 1}
            disabled={!vehicle.is_available}
          >
            <Ionicons name="calendar" size={18} color={vehicle.is_available ? COLORS.primaryDark : COLORS.textSecondary} />
            <Text style={[styles.bookBtnText, !vehicle.is_available && styles.bookBtnTextDisabled]}>
              {vehicle.is_available ? 'Réserver maintenant' : 'Indisponible'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Si vente ou vente+location → Actions (Rendez-vous, WhatsApp) */}
        {isForSale && (
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => requireAuth(() => navigation.navigate('AppointmentForm', { vehicle_id: vehicle.id }))}
              activeOpacity={0.88}
            >
              <Ionicons name="calendar-outline" size={16} color={COLORS.white} />
              <Text style={styles.actionBtnText}>Rendez-vous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSecondary]}
              onPress={() => requireAuth(() => {
                const whatsappUrl = `https://wa.me/225XXXXXXXXXX?text=Intéressé par ${vehicle.brand} ${vehicle.model}`;
                // Linking.openURL(whatsappUrl);
              })}
              activeOpacity={0.88}
            >
              <Ionicons name="logo-whatsapp" size={16} color={COLORS.primary} />
              <Text style={styles.actionBtnTextSecondary}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },

  // Gallery
  gallery: { height: 300, position: 'relative', backgroundColor: COLORS.primary },
  galleryImg: { width, height: 300 },
  galleryPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  galleryOverlay: { backgroundColor: 'rgba(0,0,0,0.18)' },
  overlayBtn: {
    position: 'absolute', width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.38)', justifyContent: 'center', alignItems: 'center',
  },
  dotsRow: { position: 'absolute', bottom: 48, alignSelf: 'center', flexDirection: 'row', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.45)' },
  dotActive: { width: 20, backgroundColor: COLORS.primary },
  priceChip: {
    position: 'absolute', bottom: 14, right: 14,
    flexDirection: 'row', alignItems: 'baseline', gap: 3,
    backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  priceChipText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  priceChipUnit: { color: COLORS.white, fontSize: 10, fontWeight: '500' },
  reservedBadge: {
    position: 'absolute', top: 14, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(220, 38, 38, 0.95)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
  },
  reservedBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },

  // Content
  content: { padding: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.3 },
  catBadge: { alignSelf: 'flex-start', backgroundColor: COLORS.cream[200], paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginTop: 6 },
  catText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 },
  locationText: { fontSize: 13, color: COLORS.textSecondary },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 10, marginTop: 4 },

  // Specs
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  specCard: { width: '31%', backgroundColor: COLORS.white, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  specIconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.cream[200], justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  specLabel: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center' },
  specValue: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center', marginTop: 2 },

  description: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 20 },

  // Driver card
  driverCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  driverAvatar: { width: 42, height: 42, borderRadius: 12, backgroundColor: COLORS.cream[200], justifyContent: 'center', alignItems: 'center' },
  driverName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  driverPhone: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  driverBadge: { backgroundColor: COLORS.cream[200], paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  driverBadgeText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, paddingHorizontal: 16, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  bottomLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 2 },
  bottomPrice: { fontSize: 17, fontWeight: '800', color: COLORS.primary },
  bookBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 13, borderRadius: 14,
  },
  bookBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  bookBtnDisabled: { backgroundColor: 'rgba(0,0,0,0.1)' },
  bookBtnTextDisabled: { color: COLORS.textSecondary },
  actionButtonsRow: { flexDirection: 'row', gap: 10, flex: 1, justifyContent: 'flex-end' },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12,
  },
  actionBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  actionBtnSecondary: { backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.primary },
  actionBtnTextSecondary: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
});
