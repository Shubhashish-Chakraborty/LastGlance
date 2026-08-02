import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const { user, token, isHydrated, initializeAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#60a5fa" />
        <Text style={{ color: '#fff', marginTop: 12 }}>Checking your session...</Text>
      </View>
    );
  }

  if (!user || !token) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#1c1c1c', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ color: 'yellow', fontSize: 28, fontWeight: '700', textAlign: 'center' }}>Welcome {user.username}!</Text>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700', textAlign: 'center' }}>To The Last Glance App</Text>
      <Text style={{ color: 'cyan', fontSize: 14, fontWeight: 'light', textAlign: 'center' }}>Under Development</Text>

      <Pressable
        onPress={() => {
          clearAuth();
          router.replace('/login');
        }}
        style={{ marginTop: 20, backgroundColor: '#ef4444', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 10 }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>Log out</Text>
      </Pressable>
    </View>
  );
}
