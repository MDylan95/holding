import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

const TAB_CONFIG = {
  Home:      { icon: 'home',     label: 'Accueil' },
  Catalogue: { icon: 'search',   label: 'Catalogue' },
  Bookings:  { icon: 'calendar', label: 'Réservations' },
  Profile:   { icon: 'person',   label: 'Profil' },
};

function TabItem({ route, isFocused, onPress, onLongPress }) {
  const config = TAB_CONFIG[route.name] || { icon: 'ellipse', label: route.name };

  const translateY = useRef(new Animated.Value(isFocused ? -18 : 0)).current;
  const bubbleScale = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const bubbleOpacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: isFocused ? -18 : 0,
        useNativeDriver: true,
        speed: 14,
        bounciness: 6,
      }),
      Animated.spring(bubbleScale, {
        toValue: isFocused ? 1 : 0,
        useNativeDriver: true,
        speed: 14,
        bounciness: 6,
      }),
      Animated.timing(bubbleOpacity, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  const iconName = isFocused ? config.icon : `${config.icon}-outline`;
  const tintColor = isFocused ? COLORS.white : 'rgba(0,0,0,0.4)';

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      style={styles.tabItem}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
    >
      {/* Bubble container (active icon elevated) */}
      <Animated.View
        style={[
          styles.bubbleWrapper,
          { transform: [{ translateY }] },
        ]}
      >
        {/* Green circle bubble */}
        <Animated.View
          style={[
            styles.bubble,
            {
              transform: [{ scale: bubbleScale }],
              opacity: bubbleOpacity,
            },
          ]}
        />
        {/* Icon */}
        <Ionicons
          name={iconName}
          size={22}
          color={tintColor}
          style={styles.icon}
        />
      </Animated.View>

      {/* Label */}
      <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
        {config.label}
      </Text>
    </TouchableOpacity>
  );
}

export default function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.outerContainer, { paddingBottom: bottomPadding }]}>
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#F4F4F6',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 40,
    paddingVertical: 10,
    paddingTop: 22,
    alignItems: 'flex-end',
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  bubbleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 46,
    height: 46,
  },
  bubble: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
  },
  icon: {
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(0,0,0,0.4)',
    marginTop: 4,
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
