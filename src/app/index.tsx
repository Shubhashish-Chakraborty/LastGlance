import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Pressable, Text, View, FlatList, Modal, TextInput, Alert, StyleSheet, RefreshControl } from 'react-native';
import { Redirect, router, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/services/api';

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
  const [name, setName] = useState('');

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
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/subjects/${user?.id}`);
      setSubjects(res.data);
    } catch (error) {
      console.error('Failed to fetch subjects', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    if (!user?.id) return;
    setIsRefreshing(true);
    try {
      const res = await apiClient.get(`/subjects/${user?.id}`);
      setSubjects(res.data);
    } catch (error) {
      console.error('Failed to refresh subjects', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddSubject = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please provide a subject name');
      return;
    }

    try {
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

  const renderSubject = ({ item }: { item: Subject }) => (
    <Pressable
      style={styles.subjectCard}
      onPress={() => router.push(`/subject/${item.id}` as never)}
    >
      <Text style={styles.subjectName}>{item.name}</Text>
      <Text style={styles.noteCount}>
        {item._count?.notes || 0} {item._count?.notes === 1 ? 'note' : 'notes'}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Wassup {user.username} ;)</Text>
          <Text style={styles.subtitle}>Your Subjects</Text>
        </View>
        <Pressable
          onPress={() => {
            clearAuth();
            router.replace('/login');
          }}
          style={styles.logoutBtn}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>

      {isLoading && !isRefreshing && subjects.length === 0 ? (
        <ActivityIndicator size="large" color="#f9cf26" style={{ marginTop: 40 }} />
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

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Create a Subject</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Engineering Physics"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
            />

            <View style={styles.modalActions}>
              <Pressable style={[styles.btn, styles.cancelBtn]} onPress={() => { setModalVisible(false); setName(''); }}>
                <Text style={styles.btnTextCancel}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.saveBtn]} onPress={handleAddSubject}>
                <Text style={styles.btnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
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
  logoutBtn: { backgroundColor: 'red', borderWidth: 1, borderColor: '#334155', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  emptyText: { color: 'white', textAlign: 'center', marginTop: 40, fontSize: 16 },
  subjectCard: {
    backgroundColor: '#212020',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#636363',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#1c1c1c',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 250
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
  btnText: { color: 'black', fontWeight: '600', fontSize: 16 },
  btnTextCancel: { color: '#fff', fontWeight: '600', fontSize: 16 }
});
