import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Alert, StatusBar, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { driversAPI } from '../../services/api';

const STATUS_CFG = {
  available:   { label: 'Disponible',  color: '#10B981', bg: '#ECFDF5', dot: '#10B981' },
  on_mission:  { label: 'En mission',  color: '#F59E0B', bg: '#FEF9EC', dot: '#F59E0B' },
  off_duty:    { label: 'Repos',       color: '#94A3B8', bg: '#F1F5F9', dot: '#94A3B8' },
  unavailable: { label: 'Indisponible',color: '#EF4444', bg: '#FEF2F2', dot: '#EF4444' },
};

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={15} color={COLORS.primary} />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

export default function DriverDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDriver(); }, [id]);

  const fetchDriver = async () => {
    try {
      const res = await driversAPI.detail(id);
      setDriver(res.data.driver || res.data.data || res.data);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger ce chauffeur.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="people" size={40} color={COLORS.white} />
      </View>
    );
  }

  if (!driver) return null;

  const initials = `${driver.first_name?.[0] || ''}${driver.last_name?.[0] || ''}`.toUpperCase();
  const status = STATUS_CFG[driver.status] || STATUS_CFG.unavailable;
  const isAvailable = driver.status === 'available';
  const rate = Number(driver.daily_rate || 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* ── Hero header ─────────────────────── */}
        <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
          <View style={styles.heroDecor1} />
          <View style={styles.heroDecor2} />

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={COLORS.white} />
          </TouchableOpacity>

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            {driver.avatar_url ? (
              <Image source={{ uri: driver.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{initials || '?'}</Text>
              </View>
            )}
            <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
          </View>

          <Text style={styles.heroName}>{driver.first_name} {driver.last_name}</Text>

          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>

          {rate > 0 && (
            <View style={styles.rateChip}>
              <Text style={styles.rateChipText}>{rate.toLocaleString('fr-FR')} FCFA</Text>
              <Text style={styles.rateChipUnit}>/jour</Text>
            </View>
          )}

          {/* Stats */}
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{driver.experience_years || 0}</Text>
              <Text style={styles.heroStatLbl}>Ans exp.</Text>
            </View>
            <View style={styles.heroStatDiv} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{driver.city || '—'}</Text>
              <Text style={styles.heroStatLbl}>Ville</Text>
            </View>
            <View style={styles.heroStatDiv} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatVal, { color: isAvailable ? '#10B981' : '#EF4444' }]}>
                {isAvailable ? 'Oui' : 'Non'}
              </Text>
              <Text style={styles.heroStatLbl}>Disponible</Text>
            </View>
          </View>
        </View>

        {/* ── Content ──────────────────────────── */}
        <View style={styles.content}>
          {/* Informations */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informations</Text>
            <InfoRow icon="call-outline"     label="Téléphone" value={driver.phone} />
            <InfoRow icon="mail-outline"     label="Email"     value={driver.email} />
            <InfoRow icon="location-outline" label="Adresse"   value={driver.address} />
            <InfoRow icon="card-outline"     label="N° Permis" value={driver.license_number} />
            {driver.license_expiry && (
              <InfoRow
                icon="calendar-outline"
                label="Expiration permis"
                value={new Date(driver.license_expiry).toLocaleDateString('fr-FR')}
              />
            )}
          </View>

          {/* Véhicule assigné */}
          {driver.assigned_vehicle && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Véhicule assigné</Text>
              <View style={styles.vehicleRow}>
                <View style={styles.vehicleIcon}>
                  <Ionicons name="car-sport" size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.vehicleName}>
                    {driver.assigned_vehicle.brand} {driver.assigned_vehicle.model}
                  </Text>
                  {driver.assigned_vehicle.plate_number && (
                    <Text style={styles.vehiclePlate}>{driver.assigned_vehicle.plate_number}</Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Notes */}
          {driver.notes && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Notes</Text>
              <Text style={styles.notes}>{driver.notes}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Bottom CTA ───────────────────────── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        {driver.phone && (
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => Linking.openURL(`tel:${driver.phone}`)}
            activeOpacity={0.88}
          >
            <Ionicons name="call" size={18} color={COLORS.primaryDark} />
            <Text style={styles.callBtnText}>Appeler le chauffeur</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },

  // Hero
  hero: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  heroDecor1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: COLORS.white, opacity: 0.06, top: -60, right: -50 },
  heroDecor2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.white, opacity: 0.08, bottom: -20, left: -30 },
  backBtn: {
    position: 'absolute', left: 16, width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center',
  },

  // Avatar
  avatarWrap: { position: 'relative', marginBottom: 12, marginTop: 8 },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: COLORS.white },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  avatarInitials: { fontSize: 28, fontWeight: '900', color: COLORS.primaryDark },
  statusDot: { position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: COLORS.primary },

  heroName: { color: COLORS.white, fontSize: 22, fontWeight: '800', marginBottom: 8, letterSpacing: -0.3 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginBottom: 10 },
  statusText: { fontSize: 13, fontWeight: '700' },

  rateChip: { flexDirection: 'row', alignItems: 'baseline', gap: 3, marginBottom: 20 },
  rateChipText: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
  rateChipUnit: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },

  // Hero stats
  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212,160,48,0.15)',
    width: '100%',
    overflow: 'hidden',
  },
  heroStat: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  heroStatVal: { color: COLORS.white, fontSize: 15, fontWeight: '800' },
  heroStatLbl: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 2 },
  heroStatDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 10 },

  // Content
  content: { padding: 16, gap: 12 },
  card: {
    backgroundColor: COLORS.white, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },

  // Info rows
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: COLORS.cream[200] },
  infoIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.cream[200], justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  infoLabel: { fontSize: 12, color: COLORS.textSecondary, flex: 1 },
  infoValue: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, maxWidth: '55%', textAlign: 'right' },

  // Vehicle
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.cream[100], borderRadius: 12, padding: 12 },
  vehicleIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: COLORS.cream[200], justifyContent: 'center', alignItems: 'center' },
  vehicleName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  vehiclePlate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  notes: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.white, paddingHorizontal: 16, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  callBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14,
  },
  callBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});
