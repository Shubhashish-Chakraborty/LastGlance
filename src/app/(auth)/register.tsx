import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Image
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { waitForServerWakeup } from '@/services/wakeupService';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isServerReady, setIsServerReady] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(true);
  const [serverStatus, setServerStatus] = useState('Connecting to server...');
  const [connectionError, setConnectionError] = useState('');

  const { signup, loading, error } = useAuth();

  const validate = useCallback((): boolean => {
    let valid = true;
    if (!username.trim()) {
      setUsernameError('Username is required.');
      valid = false;
    } else if (username.trim().length < 3) {
      setUsernameError('Username must be at least 3 characters.');
      valid = false;
    } else {
      setUsernameError('');
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  }, [password, username]);

  const ensureServerAwake = useCallback(async () => {
    if (isServerReady) return true;
    setConnectionError('');
    setIsWakingUp(true);

    const ready = await waitForServerWakeup((message) => {
      setServerStatus(message);
    });

    setIsServerReady(ready);
    setIsWakingUp(false);

    if (!ready) {
      setConnectionError('Unable to connect to server after 1 minute. Please try again.');
    }

    return ready;
  }, [isServerReady]);


  const handleSignup = useCallback(async () => {
    if (!validate()) return;

    const ready = await ensureServerAwake();
    if (!ready) return;

    const result = await signup(username.trim(), password);
    if (result.success) {
      setSuccessMsg(result.message || 'Account created!');
      setTimeout(() => router.replace({ pathname: '/login' }), 1200);
    }
  }, [ensureServerAwake, password, signup, username, validate]);

  useEffect(() => {
    let isMounted = true;

    const wake = async () => {
      const ready = await waitForServerWakeup((message) => {
        if (isMounted) setServerStatus(message);
      });

      if (!isMounted) return;
      setIsServerReady(ready);
      setIsWakingUp(false);
      if (!ready) {
        setConnectionError('Unable to connect to server after 1 minute. Please try again.');
      }
    };

    wake();

    return () => {
      isMounted = false;
    };
  }, []);


  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#1c1c1c' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View style={{ gap: 10 }}>
          <Animated.View style={{
            alignItems: 'center',
            paddingTop: 20,
          }}>
            <Image
              source={require('../../../assets/images/icon.png')}
              style={{
                width: 200,
                height: 200,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff', textAlign:'center' }}>Create Account</Text>
          <Text style={{ fontSize: 14, color: 'gray', textAlign:'center' }}>Sign up to get started</Text>

          <View style={{ marginTop: 18 }}>
            {/* <Text style={{ color: '#e2e8f0', marginBottom: 6 }}>Username</Text> */}
            <TextInput
              value={username}
              onChangeText={(value) => {
                setUsername(value);
                if (usernameError) setUsernameError('');
              }}
              placeholder="Choose a username"
              placeholderTextColor="#636363"
              autoCapitalize="none"
              style={{ backgroundColor: '#1c1c1c', borderColor: usernameError ? '#f87171' : '#636363', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#fff' }}
            />
            {usernameError ? <Text style={{ color: '#f87171', marginTop: 6 }}>{usernameError}</Text> : null}
          </View>

          <View style={{ marginTop: 12 }}>
            {/* <Text style={{ color: '#e2e8f0', marginBottom: 6 }}>Password</Text> */}
            <TextInput
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (passwordError) setPasswordError('');
              }}
              placeholder="Create a password"
              placeholderTextColor="#636363"
              secureTextEntry
              style={{ backgroundColor: '#1c1c1c', borderColor: passwordError ? '#f87171' : '#636363', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#fff' }}
            />
            {passwordError ? <Text style={{ color: '#f87171', marginTop: 6 }}>{passwordError}</Text> : null}
          </View>

          {error ? <Text style={{ color: '#f87171', marginTop: 8 }}>{error}</Text> : null}
          {connectionError ? <Text style={{ color: '#f87171', marginTop: 8 }}>{connectionError}</Text> : null}
          {isWakingUp ? <Text style={{ color: 'gray', marginTop: 8 }}>{serverStatus}</Text> : null}
          {successMsg ? <Text style={{ color: '#4ade80', marginTop: 8 }}>{successMsg}</Text> : null}

          <Pressable
            onPress={handleSignup}
            disabled={loading || isWakingUp}
            style={{
              marginTop: 18,
              backgroundColor: '#f9cf26',
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              opacity: loading || isWakingUp ? 0.7 : 1,
            }}
          >
            <Text style={{ color: 'black', fontWeight: '600' }}>
              {isWakingUp ? 'Connecting to server...' : loading ? 'Creating account...' : 'Sign Up'}
            </Text>
          </Pressable>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
            <Text style={{ color: 'gray' }}>Already have an account?</Text>
            <Pressable onPress={() => router.push('/login' as never)}>
              <Text style={{ color: '#60a5fa', marginLeft: 6, fontWeight: '600' }}>Log in</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}