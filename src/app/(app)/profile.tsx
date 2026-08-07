import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Switch,
  Modal,
  TextInput,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { Check, Lock, MessageSquare, User as UserIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { changeUsername, changePassword } from '@/services/authService';

const Colors = {
  background: '#1c1c1c',
  surface: '#212020',
  surfaceAlt: '#121212',
  border: '#636363',
  text: '#ffffff',
  muted: '#9ca3af',
  yellow: '#f9cf26',
  red: '#ef4444',
  white: '#ffffff',
};

function AvatarCircle({ username }: { username: string }) {
  const initial = username.charAt(0).toUpperCase();
  return (
    <View style={styles.avatarContainer}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.verifiedBadge}>
        <Check size={14} color={Colors.white} strokeWidth={3} />
      </View>
    </View>
  );
}

interface SettingItem {
  icon: React.ElementType;
  label: string;
  value?: string;
  isToggle?: boolean;
  onPress?: () => void;
  destructive?: boolean;
}

export default function ProfileScreen() {
  const { user, token, setAuth, clearAuth } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [newUsername, setNewUsername] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState('');

  const appVersion = '0.1.0';

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      Alert.alert('Validation', 'Please enter a username.');
      return;
    }

    if (newUsername.trim() === user?.username) {
      setModalVisible(false);
      return;
    }

    setSaving(true);
    try {
      const res = await changeUsername(newUsername.trim());
      const nextUser = res?.user ?? user;
      if (res?.success && token && nextUser) {
        setAuth(nextUser, token);
        setModalVisible(false);
        Alert.alert('Success', 'Username updated successfully.');
      } else {
        Alert.alert('Error', 'Could not update username right now.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (!currentPassword || !newPassword) {
      setPasswordError('Please fill both fields.');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res?.success) {
        setPasswordModalVisible(false);
        setCurrentPassword('');
        setNewPassword('');
        Alert.alert('Success', 'Password changed successfully.');
      } else {
        setPasswordError(res?.message || 'Failed to change password.');
      }
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || 'Something went wrong.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      clearAuth();
      router.replace('/login');
    } catch (err) {
      console.warn('Failed to log out', err);
      setLoggingOut(false);
    }
  };

  const renderSettingItem = ({ icon, label, value, isToggle, onPress, destructive }: SettingItem) => (
    <Pressable style={styles.settingItem} onPress={onPress} disabled={isToggle} key={label}>
      <View style={styles.settingIconContainer}>
        {React.createElement(icon, { size: 18, color: destructive ? Colors.red : Colors.yellow })}
      </View>
      <Text style={[styles.settingLabel, destructive && { color: Colors.red }]}> {label}</Text>
      {isToggle ? (
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: Colors.surfaceAlt, true: Colors.yellow }}
          thumbColor={Colors.white}
        />
      ) : (
        <View style={styles.settingValueContainer}>
          {value ? <Text style={styles.settingValue}>{value}</Text> : null}
          <Text style={styles.settingArrow}>›</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AvatarCircle username={user?.username ?? 'User'} />
          <Text style={styles.username}>{user?.username ?? '—'}</Text>
          {/* <Text style={styles.email}>{user?.email ?? '—'}</Text> */}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionCard}>
            {renderSettingItem({
              icon: UserIcon,
              label: 'Change Username (bug)',
              onPress: () => {
                setNewUsername(user?.username || '');
                setModalVisible(true);
              },
            })}
            <View style={styles.divider} />
            {renderSettingItem({
              icon: Lock,
              label: 'Change Password',
              onPress: () => {
                setPasswordError('');
                setCurrentPassword('');
                setNewPassword('');
                setPasswordModalVisible(true);
              },
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionCard}>
            {renderSettingItem({
              icon: MessageSquare,
              label: 'Help & Feedback',
              onPress: () => Linking.openURL('https://docs.google.com/forms/d/e/1FAIpQLSfIlxw4ZESHTB0wT8f3dNsB62dxGJF7VpEw83tIpqrT-9PyvA/viewform'),
            })}
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: loggingOut, busy: loggingOut }}
            disabled={loggingOut}
            onPress={handleLogout}
            style={({ pressed }) => [styles.logoutButton, (pressed || loggingOut) && styles.logoutButtonPressed]}
          >
            {loggingOut ? (
              <View style={styles.logoutLoadingContent}>
                <ActivityIndicator size="small" color={Colors.white} />
                <Text style={styles.logoutButtonText}>Logging out…</Text>
              </View>
            ) : (
              <Text style={styles.logoutButtonText}>Log Out</Text>
            )}
          </Pressable>

          <Text style={styles.appVersion}>Version {appVersion}</Text>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Username</Text>
            <TextInput
              style={styles.modalInput}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Enter new username"
              placeholderTextColor={Colors.muted}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalBtnCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalBtnSave} onPress={handleSaveUsername} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={styles.modalBtnSaveText}>Save</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={passwordModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            {!!passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            <TextInput
              style={styles.modalInput}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current Password"
              placeholderTextColor={Colors.muted}
              secureTextEntry
            />
            <TextInput
              style={styles.modalInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New Password"
              placeholderTextColor={Colors.muted}
              secureTextEntry
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalBtnCancel} onPress={() => setPasswordModalVisible(false)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalBtnSave} onPress={handleChangePassword} disabled={changingPassword}>
                {changingPassword ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={styles.modalBtnSaveText}>Update</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
    top: 50,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: Colors.yellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.background,
    fontSize: 28,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  username: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    color: Colors.muted,
    fontSize: 13,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    color: Colors.muted,
    fontSize: 13,
  },
  settingArrow: {
    color: Colors.muted,
    fontSize: 20,
    marginTop: -2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 14,
  },
  footer: {
    marginTop: 8,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    backgroundColor: 'red',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonPressed: {
    opacity: 0.9,
  },
  logoutLoadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  appVersion: {
    color: Colors.muted,
    fontSize: 12,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.64)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: Colors.text,
    marginBottom: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtnCancel: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnCancelText: {
    color: Colors.text,
    fontWeight: '600',
  },
  modalBtnSave: {
    flex: 1,
    backgroundColor: Colors.yellow,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnSaveText: {
    color: Colors.background,
    fontWeight: '700',
  },
  errorText: {
    color: Colors.red,
    marginBottom: 8,
  },
});
