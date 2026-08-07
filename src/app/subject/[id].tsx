import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Pressable, Text, View, FlatList, Modal, TextInput, Alert, StyleSheet, Image, RefreshControl } from 'react-native';
import { Redirect, router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/services/api';
import * as ImagePicker from 'expo-image-picker';

type Subject = {
  id: string;
  name: string;
  _count?: {
    notes: number;
  };
};

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  media?: { url: string; type: string }[];
};

export default function SubjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, token, isHydrated, initializeAuth } = useAuthStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id && id) {
        fetchNotes();
      }
    }, [user?.id, id])
  );

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

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/notes/subject/${id}`);
      setNotes(res.data);
    } catch (error) {
      console.error('Failed to fetch notes', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    if (!user?.id || !id) return;
    setIsRefreshing(true);
    try {
      const res = await apiClient.get(`/notes/subject/${id}`);
      setNotes(res.data);
    } catch (error) {
      console.error('Failed to refresh notes', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Opens the device gallery to pick an existing image
  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to attach an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Opens the device camera to take a new photo
  const takePhotoWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  
  const handlePickImage = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhotoWithCamera },
        { text: 'Choose from Gallery', onPress: pickImageFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleAddNote = async () => {
    if (!title && !content && !imageUri) {
      Alert.alert('Validation Error', 'Please provide a title, content, or an image');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('userId', user?.id || '');
      formData.append('subjectId', id || '');
      formData.append('title', title);
      formData.append('content', content);

      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('media', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }

      await apiClient.post('/notes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setTitle('');
      setContent('');
      setImageUri(null);
      setModalVisible(false);
      fetchNotes();
    } catch (error) {
      console.error('Failed to create note', error);
      Alert.alert('Error', 'Failed to create note');
    } finally {
      setIsUploading(false);
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

      {item.media && item.media.length > 0 && item.media[0].url && (
        <Image
          source={{ uri: item.media[0].url }}
          style={styles.noteImage}
          resizeMode="cover"
        />
      )}

      <Text style={styles.noteDate}>{new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ color: '#fff', fontSize: 24 }}>←</Text>
          </Pressable>
          <Text style={styles.welcomeText}>{subjects.find((s) => s.id === id)?.name || 'Subject'}</Text>
        </View>
      </View>

      {isLoading && !isRefreshing && notes.length === 0 ? (
        <ActivityIndicator size="large" color="#60a5fa" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={renderNote}
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
            <Text style={styles.emptyText}>No notes yet in {subjects.find((s) => s.id === id)?.name || 'Subject'}. Add something you need for last min revision!</Text>
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

            {imageUri && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <Pressable style={styles.removeImageBtn} onPress={() => setImageUri(null)}>
                  <Text style={styles.removeImageText}>X</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.mediaButtons}>
              <Pressable style={styles.mediaBtn} onPress={handlePickImage}>
                <Text style={styles.mediaBtnText}>📷 Image</Text>
              </Pressable>
              <Pressable style={styles.mediaBtn} onPress={handleUnderDevelopment}>
                <Text style={styles.mediaBtnText}>🎙️ Audio</Text>
              </Pressable>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={[styles.btn, styles.cancelBtn]} onPress={() => { setModalVisible(false); setImageUri(null); setTitle(''); setContent(''); }}>
                <Text style={styles.btnTextCancel}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.saveBtn]} onPress={handleAddNote} disabled={isUploading}>
                <Text style={styles.btnText}>{isUploading ? 'Saving...' : 'Save'}</Text>
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
  backBtn: { padding: 4 },
  welcomeText: { color: '#ffeacf', fontSize: 18, fontWeight: 'bold' },
  emptyText: { color: 'white', textAlign: 'center', marginTop: 40, fontSize: 16 },
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
  noteImage: { width: '100%', height: 200, borderRadius: 8, marginTop: 12 },
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
  previewContainer: { position: 'relative', marginBottom: 16 },
  previewImage: { width: '100%', height: 150, borderRadius: 12 },
  removeImageBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  removeImageText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
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