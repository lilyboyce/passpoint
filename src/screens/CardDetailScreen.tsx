import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { navigate } from '../navigation/navigationRef';
import { useApp } from '../context/AppContext';
import { RootStackParamList } from '../navigation';
import { formatMultiplier, currencyLabel } from '../utils/cardUtils';
import { formatDate, getCurrentPeriodKey, getPeriodLongLabel } from '../utils/dateUtils';
import { AnnualBenefit } from '../types';
import SegmentedBenefitBar, { getCurrentPeriodUsed, getCurrentPeriodRemaining } from '../components/SegmentedBenefitBar';

type Route = RouteProp<RootStackParamList, 'CardDetail'>;

export default function CardDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { cards, updateBenefitUsage, updatePointsBalance, deleteCard } = useApp();
  const card = cards.find((c) => c.id === route.params.cardId);
  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');

  if (!card) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ padding: 24 }}>Card not found.</Text>
      </SafeAreaView>
    );
  }

  function handleManage() {
    Alert.alert(card!.name, undefined, [
      {
        text: 'Edit Opening Date',
        onPress: () => navigate('AddCardDate', { templateId: card!.templateId, cardId: card!.id }),
      },
      {
        text: 'Remove Card',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Remove Card', `Remove ${card!.name}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Remove',
              style: 'destructive',
              onPress: async () => {
                await deleteCard(card!.id);
                navigation.goBack();
              },
            },
          ]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function handleSaveBalance() {
    const val = parseFloat(balanceInput);
    if (!isNaN(val)) {
      await updatePointsBalance(card!.id, Math.max(0, val));
    }
    setEditingBalance(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleManage}>
            <Text style={styles.deleteBtn}>Manage</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.issuer}>{card.issuer.toUpperCase()}</Text>
        <Text style={styles.name}>{card.name}</Text>
        <Text style={styles.meta}>
          ${card.annualFee}/yr · {card.rewardCurrency}
        </Text>

        {/* Points balance */}
        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.sectionLabel}>Balance</Text>
            {editingBalance ? (
              <View style={styles.balanceEdit}>
                <TextInput
                  style={styles.balanceInput}
                  value={balanceInput}
                  onChangeText={setBalanceInput}
                  autoFocus
                  selectTextOnFocus
                  placeholder={String(card.pointsBalance)}
                  placeholderTextColor="#aaa"
                />
                <TouchableOpacity onPress={handleSaveBalance}>
                  <Text style={styles.saveBtn}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setBalanceInput('');
                  setEditingBalance(true);
                }}
              >
                <Text style={styles.balance}>
                  {card.pointsBalance.toLocaleString()}{' '}
                  <Text style={styles.balanceCurrency}>{currencyLabel(card.rewardCurrency)}</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Earning rates */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Earning Rates</Text>
          <View style={styles.rateRow}>
            <Text style={styles.rateLabel}>All purchases</Text>
            <Text style={styles.rateValue}>
              {formatMultiplier(card.baseMultiplier, card.rewardCurrency)}
            </Text>
          </View>
          {card.categories.map((cat, i) => (
            <View key={i} style={styles.rateRow}>
              <Text style={styles.rateLabel}>{cat.label}</Text>
              <Text style={styles.rateValue}>
                {formatMultiplier(cat.multiplier, card.rewardCurrency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Benefits */}
        {card.benefits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Annual Benefits</Text>
            {[...card.benefits].sort((a, b) => {
              const isDone = (b: typeof a) => {
                if (b.totalValue === -1 || b.totalValue === 0) return false;
                const rem = b.periodMonths ? getCurrentPeriodRemaining(b) : b.totalValue - b.usedValue;
                return rem <= 0;
              };
              return Number(isDone(a)) - Number(isDone(b));
            }).map((benefit) => (
              <BenefitItem
                key={benefit.id}
                benefit={benefit}
                currency={card.rewardCurrency}
                onUpdate={(val, periodKey) => updateBenefitUsage(card.id, benefit.id, val, periodKey)}
              />
            ))}
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function BenefitItem({
  benefit,
  currency,
  onUpdate,
}: {
  benefit: AnnualBenefit;
  currency: string;
  onUpdate: (val: number, periodKey?: string) => void;
}) {
  const [editingPeriodKey, setEditingPeriodKey] = useState<string | null>(null);
  const [input, setInput] = useState('');

  const isUnlimited = benefit.totalValue === -1;
  const isPeriodic = !!benefit.periodMonths;
  const currentKey = isPeriodic ? getCurrentPeriodKey(benefit.periodMonths!) : null;
  const currentPeriodUsed = isPeriodic && currentKey ? (benefit.periodUsage?.[currentKey] ?? 0) : benefit.usedValue;
  const perPeriod = isPeriodic ? benefit.totalValue / (12 / benefit.periodMonths!) : benefit.totalValue;
  const pct = !isUnlimited && benefit.totalValue > 0
    ? Math.min((benefit.usedValue / benefit.totalValue) * 100, 100)
    : 0;
  const currentPeriodLabel = isPeriodic && currentKey ? getPeriodLongLabel(currentKey) : null;
  const isDone = !isUnlimited && benefit.totalValue > 0 &&
    (isPeriodic ? getCurrentPeriodRemaining(benefit) <= 0 : benefit.totalValue - benefit.usedValue <= 0);

  const editing = editingPeriodKey !== null;
  const editingLabel = editing && editingPeriodKey ? getPeriodLongLabel(editingPeriodKey) : null;
  const isEditingPastPeriod = editing && editingPeriodKey !== currentKey;

  function handlePeriodPress(key: string) {
    setEditingPeriodKey(key);
    setInput('');
  }

  function handleEditCurrent() {
    setEditingPeriodKey(currentKey ?? '');
    setInput('');
  }

  function handleSave() {
    const val = parseFloat(input);
    if (!isNaN(val)) {
      const cap = isPeriodic ? perPeriod : (benefit.totalValue > 0 ? benefit.totalValue : Infinity);
      onUpdate(Math.max(0, Math.min(val, cap)), editingPeriodKey ?? undefined);
    }
    setEditingPeriodKey(null);
  }

  function handleCancel() {
    setEditingPeriodKey(null);
  }

  return (
    <View style={styles.benefitItem}>
      <View style={styles.benefitHeader}>
        <Text style={styles.benefitName}>{benefit.name}</Text>
        {isDone ? (
          <View style={styles.doneCircle}>
            <Text style={styles.doneCheck}>✓</Text>
          </View>
        ) : benefit.expiresAt ? (
          <Text style={styles.benefitExpiry}>Exp {formatDate(benefit.expiresAt)}</Text>
        ) : null}
      </View>

      {benefit.notes ? <Text style={styles.benefitNotes}>{benefit.notes}</Text> : null}

      {!isUnlimited && benefit.totalValue > 0 && (
        <>
          {isPeriodic
            ? <SegmentedBenefitBar
                benefit={benefit}
                onPeriodPress={handlePeriodPress}
                selectedPeriodKey={editing ? editingPeriodKey ?? undefined : undefined}
              />
            : (
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%` }]} />
              </View>
            )
          }

          <View style={styles.benefitUsageRow}>
            {editing ? (
              <View style={styles.usageEdit}>
                {isEditingPastPeriod && (
                  <Text style={styles.editingPeriodLabel}>{editingLabel}</Text>
                )}
                <TextInput
                  style={styles.usageInput}
                  value={input}
                  onChangeText={setInput}
                  autoFocus
                  placeholder={String(editingPeriodKey && isPeriodic ? (benefit.periodUsage?.[editingPeriodKey] ?? 0) : benefit.usedValue)}
                  placeholderTextColor="#aaa"
                />
                <TouchableOpacity onPress={handleSave}>
                  <Text style={styles.saveBtn}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={[styles.saveBtn, { color: '#888', marginLeft: 8 }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={handleEditCurrent}>
                <Text style={styles.usageText}>
                  {benefit.type === 'credit'
                    ? `$${currentPeriodUsed.toFixed(0)} of $${perPeriod.toFixed(0)} used${currentPeriodLabel ? ` in ${currentPeriodLabel}` : ''}`
                    : benefit.type === 'visits'
                    ? `${currentPeriodUsed} of ${perPeriod} visits used`
                    : `${currentPeriodUsed.toLocaleString()} of ${perPeriod.toLocaleString()} pts used`}
                  {'  '}
                  <Text style={styles.editLink}>Edit</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      {isUnlimited && (
        <Text style={styles.usageText}>Unlimited</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 24, paddingBottom: 120 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  back: { fontSize: 14, color: '#000' },
  deleteBtn: { fontSize: 14, color: '#999' },
  issuer: { fontSize: 10, letterSpacing: 1, color: '#888', marginBottom: 4 },
  name: { fontSize: 22, fontWeight: '700', color: '#000', marginBottom: 4 },
  meta: { fontSize: 13, color: '#888', marginBottom: 24 },
  balanceRow: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
    paddingVertical: 16,
    marginBottom: 28,
  },
  balance: { fontSize: 28, fontWeight: '700', color: '#000', marginTop: 4 },
  balanceCurrency: { fontSize: 16, fontWeight: '400', color: '#888' },
  balanceEdit: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 12 },
  balanceInput: {
    borderBottomWidth: 1,
    borderColor: '#000',
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    minWidth: 100,
    paddingBottom: 2,
  },
  saveBtn: { fontSize: 14, fontWeight: '600', color: '#000' },
  section: { marginBottom: 28 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#888',
    marginBottom: 12,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  rateLabel: { fontSize: 14, color: '#000', flex: 1, paddingRight: 8 },
  rateValue: { fontSize: 14, fontWeight: '600', color: '#000' },
  benefitItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  benefitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  benefitName: { fontSize: 14, fontWeight: '500', color: '#000', flex: 1, paddingRight: 8 },
  benefitExpiry: { fontSize: 11, color: '#888' },
  doneCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneCheck: { fontSize: 11, color: '#fff', lineHeight: 14 },
  benefitNotes: { fontSize: 12, color: '#888', marginBottom: 8 },
  barTrack: { height: 2, backgroundColor: '#e0e0e0', marginVertical: 8 },
  barFill: { height: 2, backgroundColor: '#000' },
  benefitUsageRow: { marginTop: 2 },
  editingPeriodLabel: { fontSize: 10, color: '#555', fontWeight: '600', letterSpacing: 0.5, marginRight: 8 },
  usageEdit: { flexDirection: 'row', alignItems: 'center' },
  usageInput: {
    borderBottomWidth: 1,
    borderColor: '#000',
    fontSize: 14,
    color: '#000',
    minWidth: 60,
    paddingBottom: 2,
    marginRight: 12,
  },
  usageText: { fontSize: 12, color: '#888' },
  editLink: { color: '#000', fontWeight: '500' },
});
