import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { bookingsAPI } from '../../services/api';
import { showAlert } from '../../utils/alert';
import DatePicker from '../../components/DatePicker';

export default function BookingScreen({ route, navigation }) {
  const { type, item } = route.params;
  const isVehicle = type === 'vehicle';
  const isProperty = type === 'property';

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [returnLocation, setReturnLocation] = useState('');
  const [withDriver, setWithDriver] = useState(false);
  const [loading, setLoading] = useState(false);

  const itemTitle = isVehicle
    ? `${item.brand} ${item.model}`
    : isProperty
      ? item.title
      : `${item.first_name} ${item.last_name}`;
  const pricePerUnit = isVehicle ? item.daily_rate : item.monthly_rent;
  const priceUnit = isProperty ? '/mois' : '/jour';
  const typeIcon = isVehicle ? 'car-sport' : isProperty ? 'business' : 'people';
  const typeLabel = isVehicle ? 'Véhicule' : isProperty ? 'Immobilier' : 'Chauffeur';

  const todayStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }, []);

  const estimatedTotal = useMemo(() => {
    if (!startDate || !endDate) return null;
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s) || isNaN(e) || e <= s) return null;
    const days = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    const price = Number(pricePerUnit) || 0;
    if (isProperty) {
      const months = Math.max(1, Math.round(days / 30));
      return { label: `${months} mois`, total: months * price };
    }
    return { label: `${days} jour${days > 1 ? 's' : ''}`, total: days * price };
  }, [startDate, endDate, pricePerUnit, isProperty]);

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      showAlert('Erreur', 'Veuillez sélectionner les dates de début et de fin.');
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      showAlert('Erreur', 'La date de fin doit être après la date de début.');
      return;
    }

    const payload = {
      bookable_type: isVehicle ? 'vehicle' : 'property',
      bookable_id: item.id,
      start_date: startDate,
      end_date: endDate,
      notes: notes.trim() || undefined,
    };

    if (isVehicle) {
      if (pickupLocation.trim()) payload.pickup_location = pickupLocation.trim();
      if (returnLocation.trim()) payload.return_location = returnLocation.trim();
      payload.with_driver = withDriver;
    }

    setLoading(true);
    try {
      await bookingsAPI.create(payload);
      showAlert(
        'Réservation envoyée !',
        'Votre demande a été transmise. Vous serez contacté pour la confirmation et le paiement.',
        () => navigation.getParent()?.navigate('Bookings') ?? navigation.navigate('Bookings')
      );
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        showAlert('Erreur', Object.values(errors).flat().join('\n'));
      } else {
        showAlert('Erreur', error.response?.data?.message || 'Impossible de créer la réservation.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Réserver</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{itemTitle}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.priceChip}>
            <Text style={styles.priceChipText}>{Number(pricePerUnit).toLocaleString('fr-FR')}</Text>
            <Text style={styles.priceChipUnit}> FCFA{priceUnit}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Item summary */}
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: isVehicle ? COLORS.green[50] : COLORS.gold[50] }]}>
            <Ionicons name={typeIcon} size={24} color={isVehicle ? COLORS.green[600] : COLORS.gold[600]} />
          </View>
          <View style={{ flex: 1, marginLeft: SIZES.sm }}>
            <Text style={styles.itemTitle}>{itemTitle}</Text>
            <View style={styles.itemLocRow}>
              <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
              <Text style={styles.itemLocation}>{item.city || 'Non précisé'}</Text>
            </View>
          </View>
          <View style={styles.typeTag}>
            <Text style={styles.typeTagText}>{typeLabel}</Text>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isProperty ? 'Période de location' : 'Dates de réservation'}
          </Text>
          <View style={styles.inputGroup}>
            <DatePicker
              label="Date de début *"
              value={startDate}
              onChange={setStartDate}
              placeholder="Sélectionner la date de début"
              minDate={todayStr}
            />
          </View>
          <View style={styles.inputGroup}>
            <DatePicker
              label="Date de fin *"
              value={endDate}
              onChange={setEndDate}
              placeholder="Sélectionner la date de fin"
              minDate={startDate || todayStr}
            />
          </View>
        </View>

        {/* Champs spécifiques véhicule */}
        {isVehicle && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Détails de la location</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lieu de prise en charge</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Aéroport d'Abidjan, Cocody..."
                placeholderTextColor={COLORS.textSecondary}
                value={pickupLocation}
                onChangeText={setPickupLocation}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lieu de restitution</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Même lieu, Plateau..."
                placeholderTextColor={COLORS.textSecondary}
                value={returnLocation}
                onChangeText={setReturnLocation}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Avec chauffeur</Text>
                <Text style={styles.switchSub}>Un chauffeur TDA sera assigné</Text>
              </View>
              <Switch
                value={withDriver}
                onValueChange={setWithDriver}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={withDriver ? COLORS.white : COLORS.white}
              />
            </View>
          </View>
        )}

        {/* Notes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notes (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={isProperty
              ? 'Précisions sur votre besoin (meublé, parking, animaux...)'
              : 'Précisions sur votre réservation (événement, kilométrage, etc.)'}
            placeholderTextColor={COLORS.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Estimation */}
        {estimatedTotal && (
          <View style={styles.estimateCard}>
            <View style={styles.estimateLeft}>
              <Ionicons name="calculator-outline" size={18} color={COLORS.primary} />
              <View style={{ marginLeft: SIZES.sm }}>
                <Text style={styles.estimateLabel}>Estimation</Text>
                <Text style={styles.estimateDetail}>{estimatedTotal.label}</Text>
              </View>
            </View>
            <Text style={styles.estimateTotal}>
              {estimatedTotal.total.toLocaleString('fr-FR')} FCFA
            </Text>
          </View>
        )}

        {/* Info paiement */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.info} />
          <Text style={styles.infoText}>
            Paiement en cash à l'arrivée. L'admin confirmera votre demande sous 24h.
          </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
          <Text style={styles.submitText}>
            {loading ? 'Envoi en cours...' : 'Confirmer la réservation'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    backgroundColor: COLORS.primary,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 1 },
  headerRight: { alignItems: 'flex-end' },
  priceChip: {
    flexDirection: 'row', alignItems: 'baseline',
    backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  priceChipText: { fontSize: 13, fontWeight: '800', color: COLORS.white },
  priceChipUnit: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },

  container: { flex: 1, backgroundColor: 'rgb(245,243,238)', padding: SIZES.md },

  summaryCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: SIZES.radius,
    padding: SIZES.md, marginBottom: SIZES.md, ...SHADOWS.sm,
  },
  summaryIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  itemTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  itemLocRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  itemLocation: { fontSize: 12, color: COLORS.textSecondary },
  typeTag: { backgroundColor: COLORS.cream[200], paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  typeTagText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },

  card: {
    backgroundColor: COLORS.white, borderRadius: SIZES.radius,
    padding: SIZES.md, marginBottom: SIZES.md, ...SHADOWS.sm,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SIZES.md },
  inputGroup: { marginBottom: SIZES.md },
  label: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: SIZES.radiusSm, paddingHorizontal: SIZES.md, paddingVertical: 12,
    fontSize: 14, color: COLORS.textPrimary, backgroundColor: COLORS.cream[50],
  },
  textArea: { minHeight: 80 },

  switchRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: SIZES.sm, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  switchLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  switchSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },

  estimateCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.gold[50], borderRadius: SIZES.radius,
    padding: SIZES.md, marginBottom: SIZES.md,
    borderWidth: 1, borderColor: COLORS.gold[200],
  },
  estimateLeft: { flexDirection: 'row', alignItems: 'center' },
  estimateLabel: { fontSize: 13, fontWeight: '700', color: COLORS.gold[700] },
  estimateDetail: { fontSize: 11, color: COLORS.gold[600], marginTop: 1 },
  estimateTotal: { fontSize: 20, fontWeight: '800', color: COLORS.gold[700] },

  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SIZES.sm,
    backgroundColor: COLORS.info + '12', borderRadius: SIZES.radius,
    padding: SIZES.md, marginBottom: SIZES.md,
  },
  infoText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },

  submitButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SIZES.sm,
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius, paddingVertical: 16,
  },
  submitDisabled: { opacity: 0.55 },
  submitText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
