import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, GestureResponderEvent, Pressable, Text, View, FlatList, Modal, TextInput, Alert, StyleSheet, RefreshControl, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Redirect, router, useFocusEffect } from 'expo-router';
import { MoreVertical, Trash2, CircleQuestionMark } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/services/api';
import { waitForServerWakeup } from '@/services/wakeupService';

type Subject = {
  id: string;
  name: string;
  _count?: {
    notes: number;
  };
};

export default function Index() {
  const { user, token, isHydrated, initializeAuth, clearAuth } = useAuthStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState('');
  const [serverStatus, setServerStatus] = useState('');
  const [activeMenuSubjectId, setActiveMenuSubjectId] = useState<string | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchSubjects();
      }
    }, [user?.id])
  );

  const fetchSubjects = async () => {
    if (!user?.id) return;

    try {
      setServerStatus('Waking server...');
      setIsLoading(true);
      const isAwake = await waitForServerWakeup((message) => setServerStatus(message));
      if (!isAwake) {
        return;
      }

      const res = await apiClient.get(`/subjects/${user.id}`);
      setSubjects(res.data);
    } catch (error) {
      console.error('Failed to fetch subjects', error);
    } finally {
      setIsLoading(false);
      setServerStatus('');
    }
  };

  const onRefresh = async () => {
    if (!user?.id) return;
    setIsRefreshing(true);
    try {
      const isAwake = await waitForServerWakeup((message) => setServerStatus(message));
      if (!isAwake) {
        return;
      }
      const res = await apiClient.get(`/subjects/${user.id}`);
      setSubjects(res.data);
    } catch (error) {
      console.error('Failed to refresh subjects', error);
    } finally {
      setIsRefreshing(false);
      setServerStatus('');
    }
  };

  const handleAddSubject = async () => {
    if (isUploading) return;
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please provide a subject name');
      return;
    }

    try {
      setIsUploading(true);
      await apiClient.post('/subjects', {
        userId: user?.id,
        name: name.trim()
      });
      setName('');
      setModalVisible(false);
      fetchSubjects();
    } catch (error: any) {
      console.error('Failed to create subject', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to create subject');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isHydrated) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#f9cf26" />
        <Text style={styles.loadingText}>Checking your session...</Text>
      </View>
    );
  }

  if (!user || !token) {
    return <Redirect href="/login" />;
  }

  const toggleSubjectMenu = (event: GestureResponderEvent, subjectId: string) => {
    event.stopPropagation();
    setActiveMenuSubjectId((current) => (current === subjectId ? null : subjectId));
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (deletingSubjectId === subjectId) return;

    Alert.alert(
      'Delete Subject',
      'Are you sure you want to delete this Subject? This will delete everything permanently.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setActiveMenuSubjectId(null) },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingSubjectId(subjectId);
            try {
              await apiClient.delete(`/subjects/${subjectId}`);
              setSubjects((prev) => prev.filter((subject) => subject.id !== subjectId));
              setActiveMenuSubjectId(null);
            } catch (error) {
              console.error('Failed to delete subject', error);
              Alert.alert('Error', 'Failed to delete subject');
            } finally {
              setDeletingSubjectId(null);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderSubject = ({ item }: { item: Subject }) => (
    <Pressable
      style={styles.subjectCard}
      onPress={() => router.push(`/subject/${item.id}` as never)}
    >
      <View style={styles.subjectHeader}>
        <View>
          <Text style={styles.subjectName}>{item.name}</Text>
          <Text style={styles.noteCount}>
            {item._count?.notes || 0} {item._count?.notes === 1 ? 'note' : 'notes'}
          </Text>
        </View>

        <Pressable
          style={styles.cardMenuButton}
          onPress={(event) => toggleSubjectMenu(event, item.id)}
        >
          <MoreVertical size={20} color="#fff" />
        </Pressable>
      </View>

      {activeMenuSubjectId === item.id && (
        <View style={styles.cardMenu}>
          <Pressable
            style={[styles.cardMenuItem, deletingSubjectId === item.id && styles.disabledBtn]}
            onPress={() => handleDeleteSubject(item.id)}
            disabled={deletingSubjectId === item.id}
          >
            <Trash2 size={16} color="#ef4444" />
            <Text style={styles.cardMenuItemText}>
              {deletingSubjectId === item.id ? 'Deleting...' : 'Delete Subject & Notes'}
            </Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Wassup {user.username} ;)</Text>
          <Text style={styles.subtitle}>Your Subjects</Text>
        </View>
        <Pressable style={{}} onPress={() => router.push("/about")}>
          <CircleQuestionMark size={32} color="#f9cf26" />
        </Pressable>
      </View>

      {isLoading && !isRefreshing && subjects.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <ActivityIndicator size="large" color="#f9cf26" />
          {serverStatus ? <Text style={{ color: '#fff', marginTop: 12 }}>{serverStatus}</Text> : null}
        </View>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id}
          renderItem={renderSubject}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#f9cf26"
              colors={["#f9cf26"]}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No subjects yet. Add one to start organizing!</Text>
          }
        />
      )}

      <Pressable
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <Modal visible={isModalVisible} animationType="fade" transparent={true}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Create a Subject</Text>

              <TextInput
                style={styles.input}
                placeholder="e.g. Engineering Physics"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
                autoFocus
              />

              <View style={styles.modalActions}>
                <Pressable style={[styles.btn, styles.cancelBtn]} onPress={() => { setModalVisible(false); setName(''); }}>
                  <Text style={styles.btnTextCancel}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.btn, styles.saveBtn, isUploading && styles.disabledBtn]}
                  onPress={handleAddSubject}
                  disabled={isUploading}
                >
                  <Text style={styles.btnText}>{isUploading ? 'Saving...' : 'Save'}</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c1c' },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#1c1c1c',
  },
  welcomeText: { color: '#ffeacf', fontSize: 18, fontWeight: 'bold' },
  subtitle: { color: 'gray', fontSize: 14, marginTop: 4 },
  emptyText: { color: 'white', textAlign: 'center', marginTop: 40, fontSize: 16 },
  subjectCard: {
    backgroundColor: '#212020',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#636363',
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cardMenuButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cardMenu: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  cardMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  cardMenuItemText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  subjectName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  noteCount: { color: '#e3cb00', fontSize: 14, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f9cf26',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabText: { color: 'black', fontSize: 32, fontWeight: 'bold', marginTop: -4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center' },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  modalContent: {
    backgroundColor: '#1c1c1c',
    borderRadius: 20,
    padding: 24,
    minHeight: 250,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    backgroundColor: '#121212',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 16
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#121212', borderWidth: 1, borderColor: '#334155' },
  saveBtn: { backgroundColor: '#e3cb00' },
  disabledBtn: { opacity: 0.65 },
  btnText: { color: 'black', fontWeight: '600', fontSize: 16 },
  btnTextCancel: { color: '#fff', fontWeight: '600', fontSize: 16 }
});
