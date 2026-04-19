import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/theme';
import { notificationsAPI } from '../../services/api';

const TYPE_CONFIG = {
  new_booking:       { icon: 'calendar-outline',      color: COLORS.green[600], bg: COLORS.green[50] },
  booking_confirmed: { icon: 'checkmark-circle-outline', color: '#2563EB',       bg: '#EFF6FF' },
  booking_cancelled: { icon: 'close-circle-outline',  color: '#DC2626',         bg: '#FEF2F2' },
  payment_confirmed: { icon: 'card-outline',          color: '#7C3AED',         bg: '#F5F3FF' },
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return `Il y a ${Math.floor(diff / 86400)} j`;
}

function NotifItem({ item, onRead }) {
  const cfg = TYPE_CONFIG[item.data?.type] || { icon: 'notifications-outline', color: COLORS.green[600], bg: COLORS.green[50] };
  const isUnread = !item.read_at;

  return (
    <TouchableOpacity
      style={[styles.item, isUnread && styles.itemUnread]}
      onPress={() => !item.read_at && onRead(item.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon} size={22} color={cfg.color} />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, isUnread && styles.itemTitleUnread]}>
          {item.data?.title || 'Notification'}
        </Text>
        <Text style={styles.itemBody} numberOfLines={2}>
          {item.data?.body}
        </Text>
        <Text style={styles.itemTime}>{timeAgo(item.created_at)}</Text>
      </View>
      {isUnread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await notificationsAPI.list();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchNotifications(); }, []);

  async function handleMarkOne(id) {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (_) {}
  }

  async function handleMarkAll() {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
      setUnreadCount(0);
    } catch (_) {}
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAll}>
            <Ionicons name="checkmark-done-outline" size={20} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.markAllBtn} />
        )}
      </View>

      {/* Unread summary */}
      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Ionicons name="notifications-circle" size={16} color={COLORS.gold[600]} />
          <Text style={styles.unreadBannerText}>
            {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <FlatList
        style={styles.listContainer}
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <NotifItem item={item} onRead={handleMarkOne} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(true); }}
            colors={[COLORS.accent]} tintColor={COLORS.accent} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={56} color={COLORS.silver[300]} />
              <Text style={styles.emptyTitle}>Aucune notification</Text>
              <Text style={styles.emptySubtitle}>Vous serez notifié ici lors des activités importantes.</Text>
            </View>
          )
        }
        contentContainerStyle={notifications.length === 0 && styles.emptyContainer}
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
  markAllBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },

  listContainer: { flex: 1, backgroundColor: COLORS.white },

  unreadBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.gold[50],
    paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.gold[200],
  },
  unreadBannerText: { fontSize: 12, color: COLORS.gold[700], fontWeight: '700' },

  item: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  itemUnread: { backgroundColor: COLORS.cream[100] },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary, marginBottom: 3 },
  itemTitleUnread: { fontWeight: '700', color: COLORS.textPrimary },
  itemBody: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  itemTime: { fontSize: 11, color: COLORS.silver[400], marginTop: 4 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.accent, marginTop: 6, flexShrink: 0,
  },

  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textSecondary, marginTop: 16 },
  emptySubtitle: { fontSize: 13, color: COLORS.silver[400], textAlign: 'center', marginTop: 8, lineHeight: 20 },
  emptyContainer: { flexGrow: 1 },
});
