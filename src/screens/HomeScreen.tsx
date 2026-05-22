import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { AnnualBenefit, UserCard } from '../types';
import { differenceInDays, parseISO, getCurrentPeriodEndDate, endOfCalendarYear } from '../utils/dateUtils';
import { getCurrentPeriodRemaining } from '../components/SegmentedBenefitBar';
import { navigate as goTo } from '../navigation/navigationRef';

interface ExpiringBenefit {
  benefit: AnnualBenefit;
  card: UserCard;
  effectiveExpiry: Date;
  daysLeft: number;
  remaining: number;
}

type ExpirySection = 'This Month' | 'This Quarter' | 'This Half' | 'End of Year';

function getExpirySection(effectiveExpiry: Date): ExpirySection {
  const endMonth = getCurrentPeriodEndDate(1);
  const endQuarter = getCurrentPeriodEndDate(3);
  const endHalf = getCurrentPeriodEndDate(6);
  if (effectiveExpiry <= endMonth) return 'This Month';
  if (effectiveExpiry <= endQuarter) return 'This Quarter';
  if (effectiveExpiry <= endHalf) return 'This Half';
  return 'End of Year';
}

const SECTION_ORDER: ExpirySection[] = ['This Month', 'This Quarter', 'This Half', 'End of Year'];

function getExpiringBenefits(cards: UserCard[]): ExpiringBenefit[] {
  const now = new Date();
  const results: ExpiringBenefit[] = [];

  for (const card of cards) {
    for (const benefit of card.benefits) {
      if (benefit.totalValue === -1) continue; // unlimited — no expiry concern
      if (benefit.totalValue === 0) continue;  // informational

      const remaining = benefit.periodMonths
        ? getCurrentPeriodRemaining(benefit)
        : benefit.totalValue - benefit.usedValue;

      if (remaining <= 0) continue; // fully used

      let effectiveExpiry: Date;
      if (benefit.periodMonths) {
        effectiveExpiry = getCurrentPeriodEndDate(benefit.periodMonths);
      } else if (benefit.expiresAt) {
        effectiveExpiry = parseISO(benefit.expiresAt);
      } else {
        continue; // no expiry date to sort by
      }

      const daysLeft = differenceInDays(effectiveExpiry, now);
      if (daysLeft < 0) continue; // already expired

      results.push({ benefit, card, effectiveExpiry, daysLeft, remaining });
    }
  }

  return results.sort((a, b) => a.daysLeft - b.daysLeft);
}

export default function HomeScreen() {
  const { cards } = useApp();
  const navigation = useNavigation();
  const expiring = getExpiringBenefits(cards);

  const totalAnnualFees = cards.reduce((s, c) => s + c.annualFee, 0);
  const totalBenefitValue = cards.reduce(
    (s, c) => s + c.benefits.filter((b) => b.type === 'credit').reduce((bs, b) => bs + b.totalValue, 0),
    0
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.wordmark}>Passpoint</Text>

        <View style={styles.summary}>
          <TouchableOpacity style={styles.summaryItem} onPress={() => navigation.navigate('Cards' as never)}>
            <Text style={styles.summaryValue}>{cards.length}</Text>
            <Text style={styles.summaryLabel}>Cards</Text>
          </TouchableOpacity>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>${totalAnnualFees.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Annual Fees</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>${totalBenefitValue.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Total Credits</Text>
          </View>
        </View>

        {cards.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No cards yet.</Text>
            <TouchableOpacity onPress={() => goTo('AddCard')}>
              <Text style={styles.emptyLink}>Add your first card →</Text>
            </TouchableOpacity>
          </View>
        ) : expiring.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>All benefits used or no upcoming expirations.</Text>
          </View>
        ) : (
          <>
            {SECTION_ORDER.map((section) => {
              const items = expiring.filter((e) => getExpirySection(e.effectiveExpiry) === section);
              if (items.length === 0) return null;
              return (
                <View key={section} style={styles.sectionGroup}>
                  <Text style={styles.sectionLabel}>{section}</Text>
                  {items.map(({ benefit, card, daysLeft, remaining }) => {
                    const urgent = daysLeft <= 14;
                    const soon = daysLeft <= 30;
                    return (
                      <TouchableOpacity
                        key={`${card.id}-${benefit.id}`}
                        style={[styles.row, urgent && styles.rowUrgent]}
                        onPress={() => goTo('CardDetail', { cardId: card.id })}
                        activeOpacity={0.7}
                      >
                        <View style={styles.rowLeft}>
                          <Text style={[styles.benefitName, urgent && styles.benefitNameUrgent]}>
                            {benefit.name}
                          </Text>
                          <Text style={[styles.cardName, urgent && styles.cardNameUrgent]}>
                            {card.name}
                          </Text>
                        </View>
                        <View style={styles.rowRight}>
                          <Text style={[styles.remaining, urgent && styles.remainingUrgent]}>
                            {benefit.type === 'credit'
                              ? `$${remaining.toFixed(0)}`
                              : benefit.type === 'visits'
                              ? `${remaining} visit${remaining !== 1 ? 's' : ''}`
                              : `${remaining.toLocaleString()} pts`}
                          </Text>
                          <Text style={[styles.daysLeft, urgent && styles.daysLeftUrgent, soon && !urgent && styles.daysLeftSoon]}>
                            {daysLeft === 0 ? 'today' : `${daysLeft}d`}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 24, paddingBottom: 120 },
  wordmark: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#000',
    marginBottom: 28,
  },
  sectionGroup: { marginBottom: 28 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#888',
    marginBottom: 12,
  },
  summary: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
    paddingVertical: 16,
    marginBottom: 32,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 18, fontWeight: '700', color: '#000' },
  summaryLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryDivider: { width: 1, backgroundColor: '#e0e0e0' },
  empty: { paddingTop: 48, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#888', marginBottom: 8, textAlign: 'center' },
  emptyLink: { fontSize: 14, color: '#000', fontWeight: '500' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  rowUrgent: {
    backgroundColor: '#000',
    paddingHorizontal: 14,
    marginHorizontal: -14,
    borderBottomColor: 'transparent',
    marginBottom: 1,
  },
  rowLeft: { flex: 1, paddingRight: 12 },
  benefitName: { fontSize: 14, fontWeight: '500', color: '#000', marginBottom: 2 },
  benefitNameUrgent: { color: '#fff' },
  cardName: { fontSize: 11, color: '#888' },
  cardNameUrgent: { color: '#aaa' },
  rowRight: { alignItems: 'flex-end' },
  remaining: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 2 },
  remainingUrgent: { color: '#fff' },
  daysLeft: { fontSize: 11, color: '#aaa' },
  daysLeftSoon: { color: '#888', fontWeight: '600' },
  daysLeftUrgent: { color: '#aaa' },
});
