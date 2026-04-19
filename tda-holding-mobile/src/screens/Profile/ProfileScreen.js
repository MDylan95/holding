import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI, bookingsAPI, notificationsAPI } from '../../services/api';
import { showAlert, confirmAlert } from '../../utils/alert';

function SectionCard({ title, icon, children, action, onAction }) {
  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      <View style={styles.card}>
        {action && (
          <View style={styles.cardHead}>
            <View style={styles.cardIconWrap}>
              <Ionicons name={icon} size={15} color={COLORS.primary} />
            </View>
            <TouchableOpacity onPress={onAction} style={styles.cardAction}>
              <Text style={styles.cardActionText}>{action}</Text>
            </TouchableOpacity>
          </View>
        )}
        {children}
      </View>
    </View>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={15} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value || '—'}</Text>
    </View>
  );
}

function MenuItem({ icon, label, onPress, danger, badge }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.menuIconWrap, danger && styles.menuIconDanger]}>
        <Ionicons name={icon} size={17} color={danger ? COLORS.danger : COLORS.primary} />
      </View>
      <Text style={[styles.menuLabel, danger && { color: COLORS.danger }]}>{label}</Text>
      {badge ? (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      ) : null}
      {!danger && <Ionicons name="chevron-forward" size={15} color={COLORS.textSecondary} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, logout, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    phone:      user?.phone      || '',
    address:    user?.address    || '',
    city:       user?.city       || '',
  });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, spent: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPwd, setShowPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    bookingsAPI.list({ per_page: 100 })
      .then(r => {
        const bs = r.data.data?.data || r.data.data || [];
        const completed = bs.filter(b => b.status === 'completed');
        const pending = bs.filter(b => b.status === 'pending');
        const spent = completed.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
        setStats({ total: bs.length, confirmed: completed.length, pending: pending.length, spent });
      })
      .catch(() => {});
    notificationsAPI.list()
      .then(r => setUnreadCount(r.data.unread_count || 0))
      .catch(() => {});
  }, []);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile(form);
      await refreshUser();
      setEditing(false);
      showAlert('Succès', 'Profil mis à jour.');
    } catch {
      showAlert('Erreur', 'Impossible de mettre à jour.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    confirmAlert('Déconnexion', 'Voulez-vous vous déconnecter ?', async () => {
      await logout();
      navigation.getParent()?.navigate('AuthModal', { screen: 'Login' });
    });
  };

  const handlePwdSave = async () => {
    if (!pwdForm.current_password || !pwdForm.password || !pwdForm.password_confirmation) {
      showAlert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }
    if (pwdForm.password !== pwdForm.password_confirmation) {
      showAlert('Erreur', 'Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    if (pwdForm.password.length < 8) {
      showAlert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setSavingPwd(true);
    try {
      await authAPI.changePassword({
        current_password: pwdForm.current_password,
        password: pwdForm.password,
        password_confirmation: pwdForm.password_confirmation,
      });
      showAlert('Succès', 'Mot de passe mis à jour.');
      setShowPwd(false);
      setPwdForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (e) {
      showAlert('Erreur', e.response?.data?.message || 'Impossible de changer le mot de passe.');
    } finally {
      setSavingPwd(false);
    }
  };

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();
  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ── HEADER ─────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerDecor1} />
          <View style={styles.headerDecor2} />

          {/* Badge Premium */}
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={10} color="#C9A227" />
            <Text style={styles.premiumBadgeText}>Client TDA Premium</Text>
          </View>

          {/* Avatar + infos */}
          <View style={styles.headerRow}>
            <View style={styles.avatarWrap}>
              {user?.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{initials || 'U'}</Text>
                </View>
              )}
              <View style={styles.avatarBadge}>
                <Ionicons name="checkmark" size={10} color={COLORS.white} />
              </View>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>{fullName || 'Utilisateur'}</Text>
              <Text style={styles.headerEmail}>{user?.email}</Text>
              <Text style={styles.headerMember}>
                Membre depuis {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                  : 'récemment'}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statItem, styles.statItemActive]}>
              <Ionicons name="calendar-outline" size={16} color="#C9A227" style={{ marginBottom: 3 }} />
              <Text style={[styles.statVal, styles.statValActive]}>{stats.total}</Text>
              <Text style={[styles.statLbl, styles.statLblActive]}>Réservations</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="rgba(255,255,255,0.5)" style={{ marginBottom: 3 }} />
              <Text style={styles.statVal}>{stats.confirmed}</Text>
              <Text style={styles.statLbl}>Terminées</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.5)" style={{ marginBottom: 3 }} />
              <Text style={styles.statVal}>{stats.pending}</Text>
              <Text style={styles.statLbl}>En attente</Text>
            </View>
          </View>

          {/* Total dépensé */}
          <View style={styles.totalRow}>
            <View style={styles.totalIconWrap}>
              <Ionicons name="cash-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.totalLabel}>Total dépensé</Text>
              <Text style={styles.totalValue}>{stats.spent > 0 ? `${Number(stats.spent).toLocaleString('fr-FR')} FCFA` : '0 FCFA'}</Text>
            </View>
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>Confirmé</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* ── INFOS PERSONNELLES ─────────────── */}
          <SectionCard
            title="Informations personnelles"
            icon="person-outline"
            action={editing ? 'Annuler' : 'Modifier'}
            onAction={() => {
              if (editing) {
                setForm({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '', address: user?.address || '', city: user?.city || '' });
              }
              setEditing(!editing);
            }}
          >
            {editing ? (
              <View style={styles.editForm}>
                <View style={styles.editRow}>
                  <View style={[styles.inputWrap, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Prénom</Text>
                    <TextInput style={styles.input} value={form.first_name} onChangeText={v => update('first_name', v)} />
                  </View>
                  <View style={[styles.inputWrap, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Nom</Text>
                    <TextInput style={styles.input} value={form.last_name} onChangeText={v => update('last_name', v)} />
                  </View>
                </View>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>Téléphone</Text>
                  <TextInput style={styles.input} value={form.phone} onChangeText={v => update('phone', v)} keyboardType="phone-pad" />
                </View>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>Adresse</Text>
                  <TextInput style={styles.input} value={form.address} onChangeText={v => update('address', v)} />
                </View>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>Ville</Text>
                  <TextInput style={styles.input} value={form.city} onChangeText={v => update('city', v)} />
                </View>
                <TouchableOpacity
                  style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.primaryDark} />
                  <Text style={styles.saveBtnText}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 0 }}>
                <InfoRow icon="call-outline"     label="Téléphone" value={user?.phone}   />
                <InfoRow icon="location-outline" label="Adresse"   value={user?.address} />
                <InfoRow icon="business-outline" label="Ville"     value={user?.city}    />
                <InfoRow icon="flag-outline"     label="Pays"      value={user?.country} />
              </View>
            )}
          </SectionCard>

          {/* ── MON COMPTE ─────────────────── */}
          <SectionCard title="Mon compte" icon="grid-outline">
            <MenuItem icon="calendar-outline" label="Mes réservations" badge={stats.total > 0 ? stats.total : null} onPress={() => navigation.getParent()?.navigate('Bookings')} />
            <MenuItem icon="clock-outline"    label="Mes rendez-vous"  onPress={() => navigation.navigate('Appointments')} />
            <MenuItem icon="heart-outline"    label="Mes favoris"      onPress={() => navigation.navigate('Favorites')} />
          </SectionCard>

          {/* ── SÉCURITÉ : section mot de passe ─ */}
          <SectionCard
            title="Sécurité"
            icon="shield-checkmark-outline"
            action={showPwd ? 'Annuler' : 'Modifier'}
            onAction={() => {
              setShowPwd(!showPwd);
              setPwdForm({ current_password: '', password: '', password_confirmation: '' });
            }}
          >
            {showPwd ? (
              <View style={styles.editForm}>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>Mot de passe actuel</Text>
                  <TextInput
                    style={styles.input}
                    value={pwdForm.current_password}
                    onChangeText={v => setPwdForm(p => ({ ...p, current_password: v }))}
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.silver[400]}
                  />
                </View>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
                  <TextInput
                    style={styles.input}
                    value={pwdForm.password}
                    onChangeText={v => setPwdForm(p => ({ ...p, password: v }))}
                    secureTextEntry
                    placeholder="Min. 8 caractères"
                    placeholderTextColor={COLORS.silver[400]}
                  />
                </View>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
                  <TextInput
                    style={styles.input}
                    value={pwdForm.password_confirmation}
                    onChangeText={v => setPwdForm(p => ({ ...p, password_confirmation: v }))}
                    secureTextEntry
                    placeholder="Identique au nouveau"
                    placeholderTextColor={COLORS.silver[400]}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.saveBtn, savingPwd && { opacity: 0.6 }]}
                  onPress={handlePwdSave}
                  disabled={savingPwd}
                >
                  <Ionicons name="lock-closed" size={18} color={COLORS.primaryDark} />
                  <Text style={styles.saveBtnText}>{savingPwd ? 'Enregistrement…' : 'Mettre à jour'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.infoRow}>
                <Ionicons name="lock-closed-outline" size={15} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                <Text style={styles.infoLabel}>Mot de passe</Text>
                <Text style={styles.infoValue}>••••••••</Text>
              </View>
            )}
          </SectionCard>

          {/* ── PARAMÈTRES ────────────────── */}
          <SectionCard title="Paramètres" icon="settings-outline">
            <MenuItem icon="notifications-outline"      label="Notifications"            badge={unreadCount > 0 ? unreadCount : null} onPress={() => navigation.navigate('Notifications')} />
            <MenuItem icon="shield-checkmark-outline"   label="Sécurité & Confidentialité" onPress={() => {}} />
            <MenuItem icon="language-outline"           label="Langue"                   onPress={() => {}} />
          </SectionCard>

          {/* ── SUPPORT ───────────────────── */}
          <SectionCard title="Support" icon="help-circle-outline">
            <MenuItem icon="help-buoy-outline" label="Aide & Support"         onPress={() => {}} />
            <MenuItem icon="star-outline"      label="Évaluer l’application"   onPress={() => {}} />
          </SectionCard>

          {/* ── BRAND BAR ────────────────── */}
          <View style={styles.brandBar}>
            <View style={styles.brandLogoWrap}>
              <Text style={styles.brandLogoText}>TDA</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.brandName}>TDA Holding</Text>
              <Text style={styles.brandSub}>Immobilier · Automobile · Chauffeur</Text>
            </View>
            <View style={styles.brandVersion}>
              <Text style={styles.brandVersionText}>v1.0</Text>
            </View>
          </View>

          {/* ── DÉCONNEXION ───────────────── */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'rgb(245, 243, 238)' },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 16,
    position: 'relative',
    overflow: 'hidden',
    gap: 10,
  },
  headerDecor1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: COLORS.white, opacity: 0.05, top: -60, right: -50 },
  headerDecor2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: '#C9A227', opacity: 0.15, bottom: -40, left: -40 },

  // Badge premium
  premiumBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(201,162,39,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  premiumBadgeText: { color: '#C9A227', fontSize: 11, fontWeight: '700' },

  // Avatar row
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerInfo: { flex: 1, gap: 2 },

  // Avatar
  avatarWrap: { position: 'relative' },
  avatarImg: { width: 72, height: 72, borderRadius: 36, borderWidth: 2.5, borderColor: '#C9A227' },
  avatarPlaceholder: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 2.5, borderColor: '#C9A227' },
  avatarInitials: { fontSize: 24, fontWeight: '900', color: COLORS.white },
  avatarBadge: { position: 'absolute', bottom: 2, right: 2, width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.success, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.primary },
  headerName: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  headerEmail: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  headerMember: { color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 1 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    overflow: 'hidden',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 2 },
  statItemActive: { backgroundColor: 'rgba(201,162,39,0.18)' },
  statVal: { color: 'rgba(255,255,255,0.5)', fontSize: 17, fontWeight: '800' },
  statValActive: { color: '#C9A227' },
  statLbl: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '500', textAlign: 'center' },
  statLblActive: { color: 'rgba(201,162,39,0.7)' },

  // Total dépensé
  totalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, borderRadius: 14, padding: 12 },
  totalIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(44,113,68,0.1)', justifyContent: 'center', alignItems: 'center' },
  totalLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 2 },
  totalValue: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  totalBadge: { backgroundColor: 'rgba(201,162,39,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  totalBadgeText: { fontSize: 11, fontWeight: '700', color: '#C9A227' },

  // Content
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 16, backgroundColor: 'rgb(245, 243, 238)' },

  // Section block
  sectionBlock: { gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: 'rgb(107, 114, 128)', letterSpacing: 0.6, paddingHorizontal: 4 },

  // Section card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgb(245, 243, 238)' },
  cardIconWrap: { width: 32, height: 32, borderRadius: 12, backgroundColor: 'rgb(245, 243, 238)', justifyContent: 'center', alignItems: 'center' },
  cardTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  cardAction: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: COLORS.cream[200] },
  cardActionText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },

  // Info rows
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgb(245, 243, 238)' },
  infoLabel: { fontSize: 10, color: 'rgb(156, 163, 175)', flex: 1 },
  infoValue: { fontSize: 14, fontWeight: '600', color: 'rgb(55, 65, 81)', maxWidth: '60%', textAlign: 'right' },

  // Edit form
  editForm: { gap: 10 },
  editRow: { flexDirection: 'row' },
  inputWrap: { marginBottom: 0 },
  inputLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 4 },
  input: {
    backgroundColor: COLORS.cream[100],
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 13, marginTop: 4,
  },
  saveBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },

  // Menu items
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgb(245, 243, 238)' },
  menuIconWrap: { width: 32, height: 32, borderRadius: 12, backgroundColor: 'rgb(245, 243, 238)', justifyContent: 'center', alignItems: 'center' },
  menuIconDanger: { backgroundColor: '#FEF2F2' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: 'rgb(55, 65, 81)' },
  menuBadge: { backgroundColor: 'rgb(15, 61, 37)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, marginRight: 4 },
  menuBadgeText: { fontSize: 10, fontWeight: '700', color: '#C9A227' },

  // Brand bar
  brandBar: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.primary, borderRadius: 16, padding: 16 },
  brandLogoWrap: { width: 40, height: 40, borderRadius: 999, backgroundColor: '#C9A227', justifyContent: 'center', alignItems: 'center' },
  brandLogoText: { fontSize: 11, fontWeight: '900', color: COLORS.primary },
  brandName: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  brandSub: { fontSize: 11, color: '#C9A227', marginTop: 1 },
  brandVersion: { backgroundColor: 'rgba(201,162,39,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  brandVersionText: { fontSize: 11, fontWeight: '700', color: '#C9A227' },

  // Logout
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgb(254, 242, 242)', borderRadius: 16, padding: 16, marginBottom: 8 },
  logoutText: { fontSize: 14, fontWeight: '700', color: COLORS.danger },
});
