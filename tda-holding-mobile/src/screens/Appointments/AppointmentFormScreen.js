import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { appointmentsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AppointmentFormScreen({ route, navigation }) {
  const { vehicle_id } = route.params;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [appointmentDate, setAppointmentDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [preferredTime, setPreferredTime] = useState('09:00-12:00');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!appointmentDate || !phone || !email) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      await appointmentsAPI.create({
        vehicle_id,
        appointment_date: appointmentDate,
        preferred_time: preferredTime,
        location: location || null,
        phone,
        email,
        notes: notes || null,
      });

      Alert.alert('Succès', 'Rendez-vous demandé avec succès', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de créer le rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prendre rendez-vous</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Date du rendez-vous *</Text>
          <TextInput
            style={styles.dateInput}
            value={appointmentDate}
            onChangeText={setAppointmentDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.textSecondary}
          />
          <Text style={styles.hint}>Format: YYYY-MM-DD (ex: 2026-04-20)</Text>
        </View>

        {/* Créneau préféré */}
        <View style={styles.section}>
          <Text style={styles.label}>Créneau préféré</Text>
          <View style={styles.timeSlots}>
            {['09:00-12:00', '14:00-17:00', '17:00-19:00'].map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.timeSlot,
                  preferredTime === slot && styles.timeSlotActive,
                ]}
                onPress={() => setPreferredTime(slot)}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    preferredTime === slot && styles.timeSlotTextActive,
                  ]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Lieu */}
        <View style={styles.section}>
          <Text style={styles.label}>Lieu de rendez-vous</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Showroom, domicile..."
            value={location}
            onChangeText={setLocation}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* Téléphone */}
        <View style={styles.section}>
          <Text style={styles.label}>Téléphone *</Text>
          <TextInput
            style={styles.input}
            placeholder="Votre numéro de téléphone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* Email */}
        <View style={styles.section}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="Votre adresse email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Message (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Précisions supplémentaires..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.88}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.white} />
          <Text style={styles.submitBtnText}>
            {loading ? 'Envoi...' : 'Demander rendez-vous'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgb(245,243,238)' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },

  content: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },

  section: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },

  dateInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hint: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },

  timeSlots: { flexDirection: 'row', gap: 10 },
  timeSlot: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  timeSlotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeSlotText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  timeSlotTextActive: { color: COLORS.white },

  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: { textAlignVertical: 'top', paddingTop: 12 },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});
