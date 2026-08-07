import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.88);
  const glowOpacity = useSharedValue(0.4);
  const loadingWidth = useSharedValue(0);
  const [showSplash, setShowSplash] = useState(true);
  const [hasBootstrapped, setHasBootstrapped] = useState(false);
  const { user, token, isHydrated, initializeAuth } = useAuthStore();

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const loadingBarStyle = useAnimatedStyle(() => ({
    width: `${loadingWidth.value}%` as unknown as number,
  }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
    scale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.2)) });

    glowOpacity.value = withRepeat(
      withTiming(0.8, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );

    loadingWidth.value = withTiming(100, { duration: 1800, easing: Easing.inOut(Easing.quad) });
  }, [glowOpacity, loadingWidth, opacity, scale]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      if (user && token) {
        await new Promise((resolve) => setTimeout(resolve, 2200));
        if (!isMounted) return;
        router.replace('/home');
        return;
      }

      await initializeAuth();

      if (!isMounted) return;

      const authState = useAuthStore.getState();
      await new Promise((resolve) => setTimeout(resolve, 2200));
      if (!isMounted) return;

      if (authState.user && authState.token) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [initializeAuth, token, user]);

  useEffect(() => {
    if (isHydrated) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isHydrated, token, user]);

  if (!showSplash && (user || token)) {
    return null;
  }

  if (!showSplash && isHydrated && !user && !token) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animStyle]}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.logoBadge}
          resizeMode="contain"
        />

        <Text style={styles.tagline}>Developed By: Shubhashish Chakraborty</Text>
      </Animated.View>

      <View style={styles.loadingBarContainer}>
        <Animated.View style={[styles.loadingBar, loadingBarStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    top: '25%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#f9cf26',
    opacity: 0.15,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 300,
    height: 300,
    borderRadius: 24,
    // backgroundColor: Colors.brand.blueGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    // shadowColor: Colors.brand.blue,
    // shadowOffset: { width: 0, height: 0 },
    // shadowOpacity: 0.7,
    // shadowRadius: 20,
    // elevation: 10,
  },
  logoIcon: {
    fontSize: 36,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: '#ffeacf',
    letterSpacing: 0.3,
  },
  loadingBarContainer: {
    position: 'absolute',
    bottom: 80,
    left: 60,
    right: 60,
    height: 3,
    backgroundColor: '#121212',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingBar: {
    height: '100%',
    backgroundColor: '#ffeacf',
    borderRadius: 2,
  },
});