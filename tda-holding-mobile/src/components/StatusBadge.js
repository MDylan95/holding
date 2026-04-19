import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BOOKING_STATUS, TRANSACTION_STATUS } from '../constants/config';

export default function StatusBadge({ status, type = 'booking' }) {
  const map = type === 'transaction' ? TRANSACTION_STATUS : BOOKING_STATUS;
  const info = map[status] || { label: status, color: '#9E9E9E' };

  return (
    <View style={[styles.badge, { backgroundColor: info.color + '20' }]}>
      <View style={[styles.dot, { backgroundColor: info.color }]} />
      <Text style={[styles.text, { color: info.color }]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
