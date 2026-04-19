import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  ScrollView, StatusBar, Animated, ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import storage from '../../utils/storage';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    key: 'vehicles',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
    icon: 'car-sport',
    title: 'Location de véhicules\npremium',
    subtitle: 'SUV, berlines executive et 4x4 de luxe disponibles à Abidjan',
  },
  {
    key: 'properties',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    icon: 'business',
    title: 'Immobilier haut\nstanding',
    subtitle: 'Villas avec piscine, appartements vue lagune, résidences sécurisées',
  },
  {
    key: 'drivers',
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80',
    icon: 'car',
    title: 'Chauffeurs\nprofessionnels',
    subtitle: 'Discrets, ponctuels et expérimentés pour tous vos déplacements VIP',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (activeIndex + 1), animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      handleStart();
    }
  };

  const handleSkip = async () => {
    await storage.setItem('@tda_onboarding_done', 'true');
    navigation.replace('MainTabs');
  };

  const handleStart = async () => {
    await storage.setItem('@tda_onboarding_done', 'true');
    navigation.replace('MainTabs');
  };

  const onScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(idx);
  };

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        scrollEventThrottle={16}
        style={StyleSheet.absoluteFill}
      >
        {SLIDES.map((slide) => (
          <ImageBackground
            key={slide.key}
            source={{ uri: slide.image }}
            style={styles.slide}
            resizeMode="cover"
          >
            <View style={styles.overlay} />
          </ImageBackground>
        ))}
      </ScrollView>

      {/* Logo */}
      <View style={[styles.logoWrap, { top: insets.top + 20 }]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>TDA</Text>
        </View>
        <Text style={styles.brandName}>TDA Holding</Text>
      </View>

      {/* Skip */}
      {!isLast && (
        <TouchableOpacity
          style={[styles.skipBtn, { top: insets.top + 20 }]}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>
      )}

      {/* Bottom content */}
      <View style={[styles.bottomWrap, { paddingBottom: insets.bottom + 24 }]}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Icon */}
        <View style={styles.iconWrap}>
          <Ionicons name={SLIDES[activeIndex].icon} size={28} color={COLORS.accent} />
        </View>

        {/* Text */}
        <Text style={styles.slideTitle}>{SLIDES[activeIndex].title}</Text>
        <Text style={styles.slideSubtitle}>{SLIDES[activeIndex].subtitle}</Text>

        {/* Buttons */}
        <View style={styles.btnsRow}>
          {!isLast && (
            <TouchableOpacity style={styles.btnSkip} onPress={handleSkip} activeOpacity={0.8}>
              <Text style={styles.btnSkipText}>Passer</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.btnNext, isLast && styles.btnNextFull]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.btnNextText}>
              {isLast ? 'Commencer maintenant' : 'Suivant'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.primary} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  slide: {
    width,
    height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,20,10,0.55)',
  },
  logoWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: COLORS.primaryDark,
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  brandName: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  skipBtn: {
    position: 'absolute',
    right: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  bottomWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 28,
    backgroundColor: COLORS.accent,
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(212,160,48,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212,160,48,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  slideTitle: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 12,
  },
  slideSubtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 36,
  },
  btnsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btnSkip: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSkipText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  btnNext: {
    flex: 2,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnNextFull: {
    flex: 1,
  },
  btnNextText: {
    color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: '700',
  },
});
