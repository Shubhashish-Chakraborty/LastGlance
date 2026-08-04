import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View, FlatList, Modal, TextInput, Alert, StyleSheet } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/services/api';

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function Index() {
  const { user, token, isHydrated, initializeAuth, clearAuth } = useAuthStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (user?.id) {
      fetchNotes();
    }
  }, [user?.id]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/notes/${user?.id}`);
      setNotes(res.data);
    } catch (error) {
      console.error('Failed to fetch notes', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!title && !content) {
      Alert.alert('Validation Error', 'Please provide a title or content');
      return;
    }
    try {
      await apiClient.post('/notes', {
        userId: user?.id,
        title,
        content
      });
      setTitle('');
      setContent('');
      setModalVisible(false);
      fetchNotes();
    } catch (error) {
      console.error('Failed to create note', error);
      Alert.alert('Error', 'Failed to create note');
    }
  };

  const handleUnderDevelopment = () => {
    Alert.alert('Notice', 'This feature is currently under development!');
  };

  if (!isHydrated) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#60a5fa" />
        <Text style={styles.loadingText}>Checking your session...</Text>
      </View>
    );
  }

  if (!user || !token) {
    return <Redirect href="/login" />;
  }

  const renderNote = ({ item }: { item: Note }) => (
    <View style={styles.noteCard}>
      {item.title ? <Text style={styles.noteTitle}>{item.title}</Text> : null}
      {item.content ? <Text style={styles.noteContent}>{item.content}</Text> : null}
      <Text style={styles.noteDate}>{new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome {user.username} ;)</Text>
          {/* <Text style={styles.subtitle}>Your Last Glance Gallery</Text> */}
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

      {isLoading ? (
        <ActivityIndicator size="large" color="#60a5fa" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={renderNote}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No notes yet. Add something you need for last min revision!</Text>
          }
        />
      )}

      {/* Floating Action Button */}
      <Pressable
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      {/* Add Note Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Add a Note</Text>

            <TextInput
              style={styles.input}
              placeholder="Title (optional)"
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Dump your text notes here..."
              placeholderTextColor="#9ca3af"
              multiline
              value={content}
              onChangeText={setContent}
            />

            <View style={styles.mediaButtons}>
              <Pressable style={styles.mediaBtn} onPress={handleUnderDevelopment}>
                <Text style={styles.mediaBtnText}>📷 Image</Text>
              </Pressable>
              <Pressable style={styles.mediaBtn} onPress={handleUnderDevelopment}>
                <Text style={styles.mediaBtnText}>🎙️ Audio</Text>
              </Pressable>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={[styles.btn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnTextCancel}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.saveBtn]} onPress={handleAddNote}>
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
  welcomeText: { color: '#e3cb00', fontSize: 18, fontWeight: 'bold' },
  subtitle: { color: '#94a3b8', fontSize: 14, marginTop: 4 },
  logoutBtn: { backgroundColor: 'red', borderWidth: 1, borderColor: '#334155', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  emptyText: { color: '#94a3b8', textAlign: 'center', marginTop: 40, fontSize: 16 },
  noteCard: {
    backgroundColor: '#212020',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#636363',
  },
  noteTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  noteContent: { color: '#e2e8f0', fontSize: 16, lineHeight: 24 },
  noteDate: { color: '#686767', fontSize: 12, marginTop: 12, textAlign: 'right' },
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
    minHeight: 400
  },
  modalHeader: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    backgroundColor: '#121212',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 16
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  mediaButtons: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  mediaBtn: {
    flex: 1,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  mediaBtnText: { color: '#e2e8f0', fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#121212', borderWidth: 1, borderColor: '#334155' },
  saveBtn: { backgroundColor: '#e3cb00' },
  btnText: { color: 'black', fontWeight: '600', fontSize: 16 },
  btnTextCancel: { color: '#fff', fontWeight: '600', fontSize: 16 }
});
