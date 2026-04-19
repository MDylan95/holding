import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Monday = 0
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export default function DatePicker({ value, onChange, placeholder, minDate, label }) {
  const [visible, setVisible] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = minDate ? parseDate(minDate) || today : today;

  const selected = parseDate(value);
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());

  const displayValue = useMemo(() => {
    if (!value) return null;
    const d = parseDate(value);
    if (!d) return value;
    return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
  }, [value]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const cells = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [viewYear, viewMonth, firstDay, daysInMonth]);

  const goToPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const goToNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const isDisabled = (day) => {
    if (!day) return true;
    const d = new Date(viewYear, viewMonth, day);
    return d < min;
  };

  const isSelected = (day) => {
    if (!day || !selected) return false;
    return selected.getFullYear() === viewYear &&
      selected.getMonth() === viewMonth &&
      selected.getDate() === day;
  };

  const isToday = (day) => {
    if (!day) return false;
    return today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day;
  };

  const handleSelect = (day) => {
    if (isDisabled(day)) return;
    const d = new Date(viewYear, viewMonth, day);
    onChange(formatDate(d));
    setVisible(false);
  };

  const handleOpen = () => {
    if (selected) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    } else {
      setViewYear(min.getFullYear());
      setViewMonth(min.getMonth());
    }
    setVisible(true);
  };

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.trigger} onPress={handleOpen} activeOpacity={0.8}>
        <Ionicons name="calendar-outline" size={18} color={value ? COLORS.green[600] : COLORS.silver[400]} />
        <Text style={[styles.triggerText, !value && styles.triggerPlaceholder]}>
          {displayValue || placeholder || 'Sélectionner une date'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={COLORS.silver[400]} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.calendarCard}>
            {/* Month nav */}
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={goToPrev} style={styles.navBtn}>
                <Ionicons name="chevron-back" size={20} color={COLORS.green[700]} />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>
                {MONTHS_FR[viewMonth]} {viewYear}
              </Text>
              <TouchableOpacity onPress={goToNext} style={styles.navBtn}>
                <Ionicons name="chevron-forward" size={20} color={COLORS.green[700]} />
              </TouchableOpacity>
            </View>

            {/* Day headers */}
            <View style={styles.weekRow}>
              {DAYS_FR.map((d) => (
                <Text key={d} style={styles.weekDay}>{d}</Text>
              ))}
            </View>

            {/* Day cells */}
            <View style={styles.daysGrid}>
              {cells.map((day, i) => {
                const disabled = isDisabled(day);
                const sel = isSelected(day);
                const td = isToday(day);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.dayCell,
                      sel && styles.dayCellSelected,
                      td && !sel && styles.dayCellToday,
                    ]}
                    onPress={() => day && handleSelect(day)}
                    disabled={disabled}
                    activeOpacity={0.7}
                  >
                    {day ? (
                      <Text style={[
                        styles.dayText,
                        disabled && styles.dayTextDisabled,
                        sel && styles.dayTextSelected,
                        td && !sel && styles.dayTextToday,
                      ]}>
                        {day}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => setVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              {value && (
                <TouchableOpacity onPress={() => { onChange(''); setVisible(false); }} style={styles.clearBtn}>
                  <Text style={styles.clearText}>Effacer</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const CELL_SIZE = (Dimensions.get('window').width - 80) / 7;

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '500', color: COLORS.silver[600], marginBottom: 6 },
  trigger: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.silver[300],
    borderRadius: SIZES.radiusSm, paddingHorizontal: SIZES.md,
    paddingVertical: 13, backgroundColor: COLORS.silver[50], gap: SIZES.sm,
  },
  triggerText: { flex: 1, fontSize: 15, color: COLORS.silver[800] },
  triggerPlaceholder: { color: COLORS.silver[400] },

  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  calendarCard: {
    backgroundColor: COLORS.white, borderRadius: 20,
    padding: SIZES.md, width: Dimensions.get('window').width - 48,
    maxWidth: 400, ...SHADOWS.lg,
  },

  monthNav: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SIZES.md,
  },
  navBtn: { padding: 8 },
  monthLabel: { fontSize: 16, fontWeight: '700', color: COLORS.green[700] },

  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekDay: {
    width: CELL_SIZE, textAlign: 'center',
    fontSize: 11, fontWeight: '700', color: COLORS.silver[400],
    textTransform: 'uppercase',
  },

  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: CELL_SIZE, height: CELL_SIZE,
    justifyContent: 'center', alignItems: 'center',
    borderRadius: CELL_SIZE / 2,
  },
  dayCellSelected: { backgroundColor: COLORS.green[700] },
  dayCellToday: { borderWidth: 1.5, borderColor: COLORS.green[500] },
  dayText: { fontSize: 14, fontWeight: '500', color: COLORS.silver[800] },
  dayTextDisabled: { color: COLORS.silver[300] },
  dayTextSelected: { color: COLORS.white, fontWeight: '700' },
  dayTextToday: { color: COLORS.green[700], fontWeight: '700' },

  actions: {
    flexDirection: 'row', justifyContent: 'flex-end',
    gap: SIZES.md, marginTop: SIZES.md,
    paddingTop: SIZES.sm, borderTopWidth: 1, borderTopColor: COLORS.silver[100],
  },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 16 },
  cancelText: { fontSize: 14, fontWeight: '600', color: COLORS.silver[500] },
  clearBtn: { paddingVertical: 8, paddingHorizontal: 16 },
  clearText: { fontSize: 14, fontWeight: '600', color: COLORS.danger },
});
