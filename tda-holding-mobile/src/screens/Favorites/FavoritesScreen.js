import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Image, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { favoritesAPI } from '../../services/api';
import { confirmAlert, showAlert } from '../../utils/alert';
import EmptyState from '../../components/EmptyState';

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await favoritesAPI.list();
      setFavorites(res.data.favorites || []);
    } catch (e) {
      console.error('Erreur chargement favoris:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const onRefresh = () => { setRefreshing(true); fetchFavorites(); };

  const handleRemove = (fav) => {
    confirmAlert('Retirer', 'Retirer ce favori ?', async () => {
      try {
        await favoritesAPI.toggle({
          favorable_type: fav.favorable_type?.includes('Vehicle') ? 'vehicle' : 'property',
          favorable_id: fav.favorable_id,
        });
        setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
      } catch (e) {
        showAlert('Erreur', 'Impossible de retirer ce favori.');
      }
    });
  };

  const renderItem = ({ item }) => {
    const fav = item.favorable;
    if (!fav) return null;
    const isVehicle = item.favorable_type?.includes('Vehicle');
    const title = isVehicle ? `${fav.brand} ${fav.model}` : fav.title;
    const imageUri = fav.media?.[0]?.url;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          const screen = isVehicle ? 'VehicleDetail' : 'PropertyDetail';
          navigation.navigate('Home', { screen, params: { id: fav.id } });
        }}
        activeOpacity={0.8}
      >
        <View style={styles.imageWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name={isVehicle ? 'car-sport-outline' : 'business-outline'} size={24} color={COLORS.silver[300]} />
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <View style={styles.typeTag}>
            <Text style={styles.typeTagText}>{isVehicle ? 'Véhicule' : 'Bien immobilier'}</Text>
          </View>
          {fav.city && (
            <View style={styles.locRow}>
              <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
              <Text style={styles.locText}>{fav.city}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item)}>
          <Ionicons name="heart-dislike" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes favoris</Text>
        <View style={{ width: 38 }} />
      </View>
      <FlatList
        style={styles.list}
        data={favorites}
        keyExtractor={(item) => `fav-${item.id}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={!loading && (
          <EmptyState icon="heart-outline" title="Aucun favori" message="Ajoutez des véhicules ou biens à vos favoris" />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.white },
  list: { flex: 1, backgroundColor: COLORS.white },
  listContent: { padding: SIZES.md, paddingBottom: SIZES.xl },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: SIZES.radius,
    padding: SIZES.sm, marginBottom: SIZES.sm, ...SHADOWS.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  imageWrap: { width: 70, height: 70, borderRadius: SIZES.radiusSm, overflow: 'hidden' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: COLORS.cream[200], justifyContent: 'center', alignItems: 'center',
  },
  info: { flex: 1, marginLeft: SIZES.sm },
  title: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  typeTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.cream[200], paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, marginTop: 3,
  },
  typeTagText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  locText: { fontSize: 11, color: COLORS.textSecondary },
  removeBtn: { padding: SIZES.sm },
});
