import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext';
import Chip from '../components/Chip';
import FormField from '../components/FormField';

const colors = {
  background: '#F1F0FA',
  card: '#FFFFFF',
  primary: '#5B4FE9',
  primaryDark: '#4438D1',
  text: '#1E1B2E',
  muted: '#6E6A8A',
  error: '#D92D20',
};

const allInterests = ['Food', 'Adventure', 'Nightlife', 'Chill', 'Games', 'Your Mom'];
const timeOptions = [
  { label: '1 hr', value: 1 },
  { label: '2 hrs', value: 2 },
  { label: '3 hrs', value: 3 },
  { label: 'Half Day', value: 6 },
  { label: '67 hrs', value: 67 },
  { label: '69 hrs', value: 69 },
];

export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useUser();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [budget, setBudget] = useState(String(user.budgetPref));
  const [time, setTime] = useState(user.timePref);
  const [interests, setInterests] = useState(user.interests);
  const [image, setImage] = useState(user.profileImage);
  const [nameError, setNameError] = useState('');
  const [budgetError, setBudgetError] = useState('');
  const [timeError, setTimeError] = useState('');

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo permission needed', 'Please enable photo permissions in settings to choose a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  }

  function toggleInterest(item) {
    if (interests.includes(item)) setInterests(interests.filter((x) => x !== item));
    else setInterests([...interests, item]);
  }

  async function handleSave() {
    let ok = true;
    if (name.trim() === '') {
      setNameError('Please enter your name.');
      ok = false;
    } else setNameError('');
    const budgetNumber = Number(budget);
    if (budget.trim() === '' || isNaN(budgetNumber) || budgetNumber <= 0) {
      setBudgetError('Enter a budget above 0.');
      ok = false;
    } else setBudgetError('');
    if (!time || time <= 0) {
      setTimeError('Pick how much time you have.');
      ok = false;
    } else setTimeError('');
    if (!ok) return;
    await updateUser({
      name: name.trim(),
      bio: bio,
      budgetPref: budgetNumber,
      timePref: time,
      interests: interests,
      profileImage: image,
    });
    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Pressable onPress={pickImage} style={styles.avatarWrap}>
          {image ? <Image source={{ uri: image }} style={styles.avatar} /> : (
            <View style={[styles.avatar, styles.avatarEmpty]}>
              <Ionicons name="person" size={48} color={colors.muted} />
            </View>
          )}
          <View style={styles.badge}>
            <Ionicons name="camera" size={16} color={colors.card} />
          </View>
        </Pressable>
        {image ? (
          <Pressable onPress={() => setImage(null)} style={styles.removeWrap}>
            <Text style={styles.removeText}>Remove Photo</Text>
          </Pressable>
        ) : null}
        <FormField
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          error={nameError}
        />
        <FormField
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder="A line about you"
          multiline={true}
          tall={true}
        />
        <FormField
          label={'Max budget per outing (\u20B9)'}
          value={budget}
          onChangeText={setBudget}
          placeholder="300"
          keyboardType="numeric"
          error={budgetError}
        />
        <Text style={styles.label}>Available time</Text>
        <View style={styles.chips}>
          {timeOptions.map((o) => (
            <Chip key={o.label} label={o.label} selected={time === o.value} onPress={() => setTime(o.value)} />
          ))}
        </View>
        {timeError !== '' ? <Text style={styles.error}>{timeError}</Text> : null}
        <Text style={styles.label}>Interests</Text>
        <View style={styles.chips}>
          {allInterests.map((item) => (
            <Chip key={item} label={item} selected={interests.includes(item)} onPress={() => toggleInterest(item)} />
          ))}
        </View>
        <Pressable onPress={handleSave} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20 },
  avatarWrap: { alignSelf: 'center', marginTop: 8, marginBottom: 4 },
  avatar: { width: 104, height: 104, borderRadius: 52 },
  avatarEmpty: { backgroundColor: '#ECEAFF', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', right: 0, bottom: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.card },
  removeWrap: { alignSelf: 'center', padding: 10, marginBottom: 8 },
  removeText: { color: colors.error, fontSize: 14, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 14, marginBottom: 6 },
  error: { marginTop: 6, color: colors.error, fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  button: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 24, marginBottom: 12, minHeight: 48, justifyContent: 'center' },
  pressed: { backgroundColor: colors.primaryDark },
  buttonText: { color: colors.card, fontSize: 16, fontWeight: '700' },
});
