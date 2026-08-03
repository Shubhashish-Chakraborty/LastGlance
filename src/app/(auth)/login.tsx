import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { login, loading, error } = useAuth();

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

  const handleLogin = useCallback(async () => {
    if (!validate()) return;
    await login(username.trim(), password);
  }, [login, password, username, validate]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#1c1c1c' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#fff' }}>Welcome back</Text>
          <Text style={{ fontSize: 14, color: '#94a3b8' }}>Sign in to continue</Text>

          <View style={{ marginTop: 18 }}>
            <Text style={{ color: '#e2e8f0', marginBottom: 6 }}>Username</Text>
            <TextInput
              value={username}
              onChangeText={(value) => {
                setUsername(value);
                if (usernameError) setUsernameError('');
              }}
              placeholder="Enter your username"
              placeholderTextColor="#636363"
              autoCapitalize="none"
              style={{ backgroundColor: '#1c1c1c', borderColor: usernameError ? '#f87171' : '#636363', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#fff' }}
            />
            {usernameError ? <Text style={{ color: '#f87171', marginTop: 6 }}>{usernameError}</Text> : null}
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={{ color: '#e2e8f0', marginBottom: 6 }}>Password</Text>
            <TextInput
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (passwordError) setPasswordError('');
              }}
              placeholder="Enter your password"
              placeholderTextColor="#636363"
              secureTextEntry
              style={{ backgroundColor: '#1c1c1c', borderColor: passwordError ? '#f87171' : '#636363', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#fff' }}
            />
            {passwordError ? <Text style={{ color: '#f87171', marginTop: 6 }}>{passwordError}</Text> : null}
          </View>

          {error ? <Text style={{ color: '#f87171', marginTop: 8 }}>{error}</Text> : null}

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={{ marginTop: 18, backgroundColor: '#f9cf26', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
          >
            <Text style={{ color: 'black', fontWeight: '600' }}>{loading ? 'Signing in...' : 'Log In'}</Text>
          </Pressable>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
            <Text style={{ color: '#94a3b8' }}>No account yet?</Text>
            <Pressable onPress={() => router.push('/register' as never)}>
              <Text style={{ color: '#60a5fa', marginLeft: 6, fontWeight: '600' }}>Register</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
