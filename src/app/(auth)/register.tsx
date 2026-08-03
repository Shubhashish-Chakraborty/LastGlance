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

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const handleSignup = useCallback(async () => {
    if (!validate()) return;
    const result = await signup(username.trim(), password);
    if (result.success) {
      setSuccessMsg(result.message || 'Account created!');
      setTimeout(() => router.replace({ pathname: '/login' }), 1200);
    }
  }, [password, signup, username, validate]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#1c1c1c' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#fff' }}>Create account</Text>
          <Text style={{ fontSize: 14, color: '#94a3b8' }}>Sign up to get started</Text>

          <View style={{ marginTop: 18 }}>
            <Text style={{ color: '#e2e8f0', marginBottom: 6 }}>Username</Text>
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
            <Text style={{ color: '#e2e8f0', marginBottom: 6 }}>Password</Text>
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
          {successMsg ? <Text style={{ color: '#4ade80', marginTop: 8 }}>{successMsg}</Text> : null}

          <Pressable
            onPress={handleSignup}
            disabled={loading}
            style={{ marginTop: 18, backgroundColor: '#f9cf26', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
          >
            <Text style={{ color: 'black', fontWeight: '600' }}>{loading ? 'Creating account...' : 'Sign Up'}</Text>
          </Pressable>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
            <Text style={{ color: '#94a3b8' }}>Already have an account?</Text>
            <Pressable onPress={() => router.push('/login' as never)}>
              <Text style={{ color: '#60a5fa', marginLeft: 6, fontWeight: '600' }}>Log in</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}