import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { showAlert } from '../../utils/alert';

function FieldInput({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, rightIcon, onRightIconPress }) {
  return (
    <View style={styles.inputWrap}>
      <Ionicons name={icon} size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={autoCapitalize || 'none'}
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

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const rootNavigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isModal = navigation.canGoBack();

  const [activeTab, setActiveTab] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      setActiveTab('login');
    }, [])
  );

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      if (isModal) rootNavigation.getParent()?.goBack();
    } catch (error) {
      const msg = error.response?.data?.message || 'Identifiants incorrects.';
      showAlert('Erreur de connexion', msg);
    } finally {
      setLoading(false);
    }
  };

  const goRegister = () => {
    setActiveTab('register');
    navigation.navigate('Register');
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
          <TouchableOpacity style={styles.backBtn} onPress={() => rootNavigation.getParent()?.goBack()}>
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

      {/* Body */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Tab switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'login' && styles.tabBtnActive]}
            onPress={() => setActiveTab('login')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, activeTab === 'login' && styles.tabBtnTextActive]}>
              Connexion
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'register' && styles.tabBtnActive]}
            onPress={goRegister}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, activeTab === 'register' && styles.tabBtnTextActive]}>
              Inscription
            </Text>
          </TouchableOpacity>
        </View>

        {/* Fields */}
        <View style={styles.fields}>
          <Text style={styles.fieldLabel}>Email</Text>
          <FieldInput
            icon="mail-outline"
            placeholder="votre@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Text style={styles.fieldLabel}>Mot de passe</Text>
          <FieldInput
            icon="lock-closed-outline"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            rightIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowPass(!showPass)}
          />

          <TouchableOpacity style={styles.forgotWrap} onPress={() => {}}>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaBtn, loading && styles.ctaBtnDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Footer */}
        <TouchableOpacity style={styles.footerLink} onPress={goRegister}>
          <Text style={styles.footerText}>
            Pas encore de compte ?{' '}
            <Text style={styles.footerBold}>S'inscrire</Text>
          </Text>
        </TouchableOpacity>

        {isModal && (
          <TouchableOpacity style={styles.skipLink} onPress={() => rootNavigation.getParent()?.goBack()}>
            <Text style={styles.skipText}>Continuer sans compte</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
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
  logoText: {
    color: COLORS.primaryDark,
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  brandName: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  brandTagline: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    letterSpacing: 1.5,
    marginTop: 6,
    fontWeight: '500',
  },
  headerDecorLeft: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.accent,
    opacity: 0.08,
    left: -30,
    bottom: -40,
  },
  headerDecorRight: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.accent,
    opacity: 0.1,
    right: 20,
    top: 20,
  },

  // Body
  body: { flex: 1 },
  bodyContent: { padding: 24, paddingBottom: 40 },

  // Tab switcher
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: COLORS.cream[200],
    borderRadius: 14,
    padding: 4,
    marginBottom: 28,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 11,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabBtnTextActive: {
    color: COLORS.white,
  },

  // Fields
  fields: { gap: 4, marginBottom: 8 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
    marginTop: 12,
  },
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
  inputIcon: { },
  input: { flex: 1, fontSize: 14, color: COLORS.textPrimary, padding: 0 },
  forgotWrap: { alignItems: 'flex-end', marginTop: 8 },
  forgotText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },

  // CTA
  ctaBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: 13, color: COLORS.textSecondary },

  // Footer
  footerLink: { alignItems: 'center', marginBottom: 12 },
  footerText: { fontSize: 14, color: COLORS.textSecondary },
  footerBold: { fontWeight: '700', color: COLORS.primary },
  skipLink: { alignItems: 'center', marginTop: 8 },
  skipText: { fontSize: 13, color: COLORS.textSecondary },
});
