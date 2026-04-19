import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Dimensions, Alert, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { propertiesAPI, favoritesAPI } from '../../services/api';
import useRequireAuth from '../../hooks/useRequireAuth';
import { useAuth } from '../../contexts/AuthContext';
import { DetailSkeleton } from '../../components/Skeleton';

const { width } = Dimensions.get('window');

export default function PropertyDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { requireAuth } = useRequireAuth();
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchProperty();
    if (isAuthenticated) checkFavorite();
  }, [id, isAuthenticated]);

  const checkFavorite = async () => {
    try {
      const res = await favoritesAPI.list();
      const favs = res.data.favorites || [];
      setIsFavorite(favs.some(f => f.favorable_type?.includes('Property') && f.favorable_id === id));
    } catch {}
  };

  const fetchProperty = async () => {
    try {
      const res = await propertiesAPI.detail(id);
      setProperty(res.data.data);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger ce bien.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    requireAuth(async () => {
      try {
        await favoritesAPI.toggle({ favorable_type: 'property', favorable_id: id });
        setIsFavorite(prev => !prev);
      } catch {}
    });
  };

  if (loading) return <DetailSkeleton />;
  if (!property) return null;

  const images = property.media || [];
  const typeLabels = { villa: 'Villa', apartment: 'Appartement', house: 'Maison', land: 'Terrain', commercial: 'Commercial', duplex: 'Duplex', studio: 'Studio' };
  const isSale = property.offer_type === 'sale' || (property.offer_type === 'both' && !property.monthly_rent);
  const priceLabel = isSale
    ? `${Number(property.sale_price || 0).toLocaleString('fr-FR')} FCFA`
    : `${Number(property.monthly_rent || 0).toLocaleString('fr-FR')} FCFA/mois`;

  const features = [
    { icon: 'bed-outline',            label: 'Chambres',      value: property.bedrooms },
    { icon: 'water-outline',          label: 'Salles de bain', value: property.bathrooms },
    { icon: 'resize-outline',         label: 'Surface',       value: property.surface_area ? `${property.surface_area} m²` : null },
    { icon: 'business-outline',       label: 'Type',          value: typeLabels[property.property_type] || property.property_type },
    { icon: 'swap-horizontal-outline',label: 'Transaction',   value: isSale ? 'Vente' : 'Location' },
    { icon: 'layers-outline',         label: 'Étages',        value: property.floors },
  ].filter(f => f.value);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* ── Gallery ─────────────────────── */}
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
              <Ionicons name="business-outline" size={56} color="rgba(255,255,255,0.4)" />
            </View>
          )}

          <TouchableOpacity style={[styles.overlayBtn, { left: 16, top: insets.top + 12 }]} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.overlayBtn, { right: 16, top: insets.top + 12 }]} onPress={toggleFavorite}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#EF4444' : COLORS.white} />
          </TouchableOpacity>

          {images.length > 1 && (
            <View style={styles.dotsRow}>
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, i === imageIndex && styles.dotActive]} />
              ))}
            </View>
          )}

          <View style={styles.priceChip}>
            <Text style={styles.priceChipText}>{priceLabel}</Text>
          </View>
        </View>

        {/* ── Content ──────────────────────── */}
        <View style={styles.content}>
          <Text style={styles.title}>{property.title}</Text>

          <View style={styles.metaRow}>
            {property.category?.name && (
              <View style={styles.catBadge}>
                <Text style={styles.catText}>{property.category.name}</Text>
              </View>
            )}
            <View style={[styles.transBadge, isSale && styles.transBadgeSale]}>
              <Text style={[styles.transText, isSale && styles.transTextSale]}>
                {isSale ? 'Vente' : 'Location'}
              </Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.locationText}>{property.address || property.city || 'Non précisé'}</Text>
          </View>

          {features.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Caractéristiques</Text>
              <View style={styles.featGrid}>
                {features.map((f, i) => (
                  <View key={i} style={styles.featCard}>
                    <View style={styles.featIconWrap}>
                      <Ionicons name={f.icon} size={16} color={COLORS.primary} />
                    </View>
                    <Text style={styles.featLabel}>{f.label}</Text>
                    <Text style={styles.featValue}>{f.value}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {property.description ? (
            <>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{property.description}</Text>
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* ── Bottom CTA ───────────────────── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={styles.bottomLabel}>{isSale ? 'Prix de vente' : 'Loyer/mois'}</Text>
          <Text style={styles.bottomPrice}>{priceLabel}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => requireAuth(() => navigation.navigate('Booking', { type: 'property', item: property }))}
          activeOpacity={0.88}
        >
          <Ionicons name="calendar" size={18} color={COLORS.primaryDark} />
          <Text style={styles.bookBtnText}>Réserver maintenant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },

  gallery: { height: 300, position: 'relative', backgroundColor: COLORS.primary },
  galleryImg: { width, height: 300 },
  galleryPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  overlayBtn: {
    position: 'absolute', width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.38)', justifyContent: 'center', alignItems: 'center',
  },
  dotsRow: { position: 'absolute', bottom: 48, alignSelf: 'center', flexDirection: 'row', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.45)' },
  dotActive: { width: 20, backgroundColor: COLORS.primary },
  priceChip: {
    position: 'absolute', bottom: 14, right: 14,
    backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  priceChipText: { color: COLORS.white, fontSize: 13, fontWeight: '800' },

  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.3, marginBottom: 8 },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  catBadge: { backgroundColor: COLORS.cream[200], paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  catText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
  transBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  transBadgeSale: { backgroundColor: '#FEF9EC' },
  transText: { fontSize: 11, fontWeight: '600', color: '#3B82F6' },
  transTextSale: { color: '#D97706' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 },
  locationText: { fontSize: 13, color: COLORS.textSecondary },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 10, marginTop: 4 },

  featGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  featCard: { width: '31%', backgroundColor: COLORS.white, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  featIconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.cream[200], justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  featLabel: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center' },
  featValue: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center', marginTop: 2 },

  description: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 20 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, paddingHorizontal: 16, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  bottomLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 2 },
  bottomPrice: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  bookBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 13, borderRadius: 14,
  },
  bookBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
});
