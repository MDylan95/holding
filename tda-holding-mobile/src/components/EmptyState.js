import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

export default function EmptyState({ icon = 'search-outline', title, message }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={COLORS.silver[300]} />
      <Text style={styles.title}>{title || 'Aucun résultat'}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.silver[600],
    marginTop: SIZES.md,
  },
  message: {
    fontSize: 13,
    color: COLORS.silver[400],
    marginTop: SIZES.xs,
    textAlign: 'center',
  },
});
