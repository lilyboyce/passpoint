import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { CARD_TEMPLATES } from '../data/cardTemplates';
import { templateToUserCard } from '../utils/cardUtils';
import { useApp } from '../context/AppContext';
import { RootStackParamList } from '../navigation';

type Route = RouteProp<RootStackParamList, 'AddCardDate'>;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const YEARS = Array.from({ length: 31 }, (_, i) => CURRENT_YEAR - i);

export default function AddCardDateScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { templateId, cardId } = route.params;
  const { addCard, updateMemberSince, cards } = useApp();

  const isEditMode = !!cardId;
  const existingCard = isEditMode ? cards.find((c) => c.id === cardId) : undefined;

  const parseExisting = (): { month: number; year: number } => {
    if (existingCard?.memberSince) {
      const [y, m] = existingCard.memberSince.split('-').map(Number);
      if (y && m) return { month: m, year: y };
    }
    return { month: now.getMonth() + 1, year: CURRENT_YEAR };
  };

  const initial = parseExisting();
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);

  function buildDate(m: number, y: number): string {
    return `${y}-${String(m).padStart(2, '0')}-01`;
  }

  async function handleSave(dateStr?: string) {
    const sinceDate = dateStr ?? buildDate(month, year);

    if (isEditMode && cardId) {
      await updateMemberSince(cardId, sinceDate);
      navigation.goBack();
    } else {
      const template = CARD_TEMPLATES.find((t) => t.id === templateId);
      if (!template) return;
      await addCard(templateToUserCard(template, sinceDate));
      navigation.dispatch(StackActions.popToTop());
    }
  }

  function handleSkip() {
    Alert.alert(
      'No Date Selected',
      "Today's date will be used for anniversary calculations. You can update this later.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => handleSave(new Date().toISOString().split('T')[0]),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{isEditMode ? 'Edit Opening Date' : 'Opening Date'}</Text>
          <View style={{ width: 60 }} />
        </View>

        <Text style={styles.subtitle}>
          {isEditMode
            ? 'When did you open this card?'
            : 'When did you open this card? Used to calculate your anniversary benefits.'}
        </Text>

        <View style={styles.pickerRow}>
          <View style={styles.pickerWrap}>
            <Text style={styles.pickerLabel}>MONTH</Text>
            <Picker
              selectedValue={month}
              onValueChange={(val) => setMonth(val as number)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {MONTHS.map((name, i) => (
                <Picker.Item key={i} label={name} value={i + 1} />
              ))}
            </Picker>
          </View>

          <View style={styles.pickerWrap}>
            <Text style={styles.pickerLabel}>YEAR</Text>
            <Picker
              selectedValue={year}
              onValueChange={(val) => setYear(val as number)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {YEARS.map((y) => (
                <Picker.Item key={y} label={String(y)} value={y} />
              ))}
            </Picker>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => handleSave()}>
          <Text style={styles.primaryBtnText}>
            {isEditMode ? 'Save' : 'Add Card'}
          </Text>
        </TouchableOpacity>

        {!isEditMode && (
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipBtnText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 24 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  back: { fontSize: 14, color: '#000' },
  title: { fontSize: 16, fontWeight: '600', color: '#000' },
  subtitle: { fontSize: 13, color: '#888', marginBottom: 32, lineHeight: 20 },
  pickerRow: { flexDirection: 'row', gap: 16, marginBottom: 40 },
  pickerWrap: { flex: 1 },
  pickerLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#888',
    marginBottom: 4,
  },
  picker: { width: '100%' },
  pickerItem: { fontSize: 16, color: '#000' },
  primaryBtn: {
    backgroundColor: '#000',
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  skipBtn: { padding: 16, alignItems: 'center' },
  skipBtnText: { fontSize: 14, color: '#888' },
});
