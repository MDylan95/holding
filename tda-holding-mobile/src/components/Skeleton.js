import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';

const SCREEN_W = Dimensions.get('window').width;

function SkeletonBox({ width, height, borderRadius = 8, style }) {
  const shimmer = useRef(new Animated.Value(-SCREEN_W)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: SCREEN_W * 2,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View
      style={[
        { width, height, borderRadius, backgroundColor: COLORS.silver[200], overflow: 'hidden' },
        style,
      ]}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: SCREEN_W * 0.5,
          transform: [{ translateX: shimmer }],
          backgroundColor: 'rgba(255,255,255,0.55)',
          opacity: 0.9,
        }}
      />
    </View>
  );
}

export function CardSkeleton({ width: w = '100%', imageHeight = 130 }) {
  return (
    <View style={[skeletonStyles.card, { width: w }]}>
      <SkeletonBox width="100%" height={imageHeight} borderRadius={0} />
      <View style={skeletonStyles.cardBody}>
        <SkeletonBox width="75%" height={14} />
        <SkeletonBox width="50%" height={10} style={{ marginTop: 8 }} />
        <SkeletonBox width="40%" height={14} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function ListItemSkeleton() {
  return (
    <View style={skeletonStyles.listItem}>
      <SkeletonBox width={44} height={44} borderRadius={22} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <SkeletonBox width="70%" height={14} />
        <SkeletonBox width="45%" height={10} style={{ marginTop: 6 }} />
      </View>
      <SkeletonBox width={60} height={24} borderRadius={12} />
    </View>
  );
}

export function DetailSkeleton() {
  return (
    <View style={skeletonStyles.detail}>
      <SkeletonBox width="100%" height={260} borderRadius={0} />
      <View style={{ padding: 16 }}>
        <SkeletonBox width="65%" height={20} />
        <SkeletonBox width="40%" height={14} style={{ marginTop: 10 }} />
        <SkeletonBox width="100%" height={1} style={{ marginVertical: 16 }} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SkeletonBox width="30%" height={70} borderRadius={10} />
          <SkeletonBox width="30%" height={70} borderRadius={10} />
          <SkeletonBox width="30%" height={70} borderRadius={10} />
        </View>
        <SkeletonBox width="100%" height={80} style={{ marginTop: 16 }} borderRadius={10} />
      </View>
    </View>
  );
}

export default SkeletonBox;

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 8,
  },
  cardBody: { padding: 12 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  detail: { flex: 1, backgroundColor: COLORS.silver[50] },
});
