import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { showAlert } from '../../utils/alert';

function FieldInput({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, rightIcon, onRightIconPress }) {
  return (
    <View style={styles.inputWrap}>
      <Ionicons name={icon} size={18} color={COLORS.textSecondary} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={autoCapitalize || 'sentences'}
        autoCorrect={false}
      />
      {rightIcon && (
        <TouchableOpacity onPress={onRightIconPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={rightIcon} size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const rootNavigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isModal = navigation.canGoBack();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = async () => {
    const { first_name, last_name, email, phone, password, password_confirmation } = form;
    if (!first_name.trim() || !last_name.trim()) {
      showAlert('Erreur', 'Veuillez saisir votre prénom et votre nom.');
      return;
    }
    if (!email.trim() && !phone.trim()) {
      showAlert('Erreur', 'Un email ou un numéro de téléphone est requis.');
      return;
    }
    if (!password) {
      showAlert('Erreur', 'Veuillez saisir un mot de passe.');
      return;
    }
    if (password.length < 6) {
      showAlert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== password_confirmation) {
      showAlert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      // Close modal after successful registration
      if (isModal) {
        rootNavigation.getParent()?.goBack();
      }
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        const msg = Object.values(errors).flat().join('\n');
        showAlert('Erreur', msg);
      } else {
        showAlert('Erreur', error.response?.data?.message || 'Inscription échouée.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header vert foncé */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        {isModal && (
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
        )}
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>TDA</Text>
        </View>
        <Text style={styles.brandName}>TDA Holding</Text>
        <Text style={styles.brandTagline}>IMMOBILIER · AUTOMOBILE · CHAUFFEURS</Text>
        <View style={styles.headerDecorLeft} />
        <View style={styles.headerDecorRight} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Tab switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={styles.tabBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.tabBtnText}>Connexion</Text>
          </TouchableOpacity>
          <View style={[styles.tabBtn, styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, styles.tabBtnTextActive]}>Inscription</Text>
          </View>
        </View>

        {/* Fields */}
        <View style={styles.fields}>
          <Text style={styles.fieldLabel}>Prénom</Text>
          <FieldInput
            icon="person-outline"
            placeholder="Adjoua"
            value={form.first_name}
            onChangeText={(v) => update('first_name', v)}
            autoCapitalize="words"
          />

          <Text style={styles.fieldLabel}>Nom</Text>
          <FieldInput
            icon="person-outline"
            placeholder="Konaté"
            value={form.last_name}
            onChangeText={(v) => update('last_name', v)}
            autoCapitalize="words"
          />

          <Text style={styles.fieldLabel}>Téléphone</Text>
          <FieldInput
            icon="call-outline"
            placeholder="+225 07 00 00 00 00"
            value={form.phone}
            onChangeText={(v) => update('phone', v)}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />

          <Text style={styles.fieldLabel}>Email</Text>
          <FieldInput
            icon="mail-outline"
            placeholder="votre@email.com"
            value={form.email}
            onChangeText={(v) => update('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.fieldLabel}>Mot de passe</Text>
          <FieldInput
            icon="lock-closed-outline"
            placeholder="••••••••"
            value={form.password}
            onChangeText={(v) => update('password', v)}
            secureTextEntry={!showPass}
            rightIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowPass(!showPass)}
          />

          <Text style={styles.fieldLabel}>Confirmer le mot de passe</Text>
          <FieldInput
            icon="lock-closed-outline"
            placeholder="••••••••"
            value={form.password_confirmation}
            onChangeText={(v) => update('password_confirmation', v)}
            secureTextEntry={!showPass}
          />
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaBtn, loading && styles.ctaBtnDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>{loading ? 'Inscription...' : 'Créer mon compte'}</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.footerLink} onPress={() => navigation.goBack()}>
          <Text style={styles.footerText}>
            Déjà un compte ? <Text style={styles.footerBold}>Se connecter</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingBottom: 32,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    top: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: { color: COLORS.primaryDark, fontWeight: '900', fontSize: 18, letterSpacing: 0.5 },
  brandName: { color: COLORS.white, fontSize: 26, fontWeight: '800', letterSpacing: 0.3 },
  brandTagline: { color: 'rgba(255,255,255,0.55)', fontSize: 11, letterSpacing: 1.5, marginTop: 6, fontWeight: '500' },
  headerDecorLeft: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.accent, opacity: 0.08, left: -30, bottom: -40 },
  headerDecorRight: { position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.accent, opacity: 0.1, right: 20, top: 20 },
  body: { flex: 1 },
  bodyContent: { padding: 24, paddingBottom: 40 },
  tabSwitcher: { flexDirection: 'row', backgroundColor: COLORS.cream[200], borderRadius: 14, padding: 4, marginBottom: 28 },
  tabBtn: { flex: 1, paddingVertical: 11, borderRadius: 11, alignItems: 'center' },
  tabBtnActive: { backgroundColor: COLORS.primary },
  tabBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  tabBtnTextActive: { color: COLORS.white },
  fields: { gap: 4, marginBottom: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 6, marginTop: 12 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  input: { flex: 1, fontSize: 14, color: COLORS.textPrimary, padding: 0 },
  ctaBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: 13, color: COLORS.textSecondary },
  footerLink: { alignItems: 'center' },
  footerText: { fontSize: 14, color: COLORS.textSecondary },
  footerBold: { fontWeight: '700', color: COLORS.primary },
});
