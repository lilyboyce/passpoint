import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/dateUtils';
import { AnnualBenefit, UserCard } from '../types';
import { navigate as goTo } from '../navigation/navigationRef';
import SegmentedBenefitBar, { getCurrentPeriodRemaining } from '../components/SegmentedBenefitBar';

type BenefitGroup = 'Hotels' | 'Flights' | 'Entertainment' | 'Food' | 'Shopping' | 'Other' | 'Lounges';

const GROUP_ORDER: BenefitGroup[] = ['Hotels', 'Flights', 'Entertainment', 'Food', 'Shopping', 'Other', 'Lounges'];

function getBenefitGroup(benefit: AnnualBenefit): BenefitGroup {
  const cats = new Set(benefit.applicableCategories ?? []);
  const merchants = benefit.applicableMerchants ?? [];
  const name = benefit.name.toLowerCase();

  const hasHotels = cats.has('hotels');
  const hasAirlines = cats.has('airlines');
  const hasLounges =
    name.includes('lounge') ||
    name.includes('centurion') ||
    name.includes('priority pass') ||
    name.includes('sky club') ||
    merchants.some((m) => m.includes('lounge') || m.includes('centurion') || m.includes('priority pass'));
  if (hasLounges) return 'Lounges';
  if (hasHotels && !hasAirlines) return 'Hotels';
  if (hasAirlines && !hasHotels) return 'Flights';
  if (cats.has('streaming') || cats.has('entertainment') || name.includes('entertainment') || name.includes('streaming') || name.includes('digital')) return 'Entertainment';
  if (
    cats.has('dining') || cats.has('groceries') ||
    name.includes('dining') || name.includes('dunkin') || name.includes('uber cash') ||
    merchants.some((m) => ['grubhub', 'cheesecake factory', 'goldbelly', 'milk bar', 'dunkin', 'uber'].includes(m))
  ) return 'Food';
  if (
    cats.has('online_shopping') || cats.has('wholesale') ||
    merchants.some((m) => ['walmart', 'lululemon', 'oura'].includes(m))
  ) return 'Shopping';

  return 'Other';
}

export default function BenefitsScreen() {
  const { cards } = useApp();

  const allBenefits: { benefit: AnnualBenefit; card: UserCard }[] = cards.flatMap((card) =>
    card.benefits
      .filter((b) => b.totalValue !== 0 || b.type === 'visits')
      .map((benefit) => ({ benefit, card }))
  );

  const creditBenefits = allBenefits.filter((x) => x.benefit.type === 'credit');
  const totalCredits = creditBenefits.reduce((s, x) => s + x.benefit.totalValue, 0);
  const usedCredits = creditBenefits.reduce((s, x) => s + x.benefit.usedValue, 0);
  const remainingCredits = totalCredits - usedCredits;

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: allBenefits.filter((x) => getBenefitGroup(x.benefit) === group),
  })).filter((g) => g.items.length > 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Benefits</Text>

        {cards.length === 0 && (
          <Text style={styles.empty}>Add cards to track your benefits.</Text>
        )}

        {totalCredits > 0 && (
          <View style={styles.summary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>${remainingCredits.toFixed(0)}</Text>
              <Text style={styles.summaryLabel}>Remaining</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>${usedCredits.toFixed(0)}</Text>
              <Text style={styles.summaryLabel}>Used</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>${totalCredits.toFixed(0)}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
          </View>
        )}

        {grouped.map(({ group, items }) => (
          <BenefitSection
            key={group}
            title={group}
            items={items}
            onCardPress={(cardId) => goTo('CardDetail', { cardId })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function BenefitSection({
  title,
  items,
  onCardPress,
}: {
  title: string;
  items: { benefit: AnnualBenefit; card: UserCard }[];
  onCardPress: (cardId: string) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {items.map(({ benefit, card }) => {
        const isUnlimited = benefit.totalValue === -1;
        const isPeriodic = !!benefit.periodMonths;
        const remaining = isPeriodic
          ? getCurrentPeriodRemaining(benefit)
          : benefit.totalValue - benefit.usedValue;
        const pct = !isUnlimited && benefit.totalValue > 0
          ? Math.min((benefit.usedValue / benefit.totalValue) * 100, 100)
          : 0;
        const isFullyUsed = !isUnlimited && remaining <= 0;

        return (
          <TouchableOpacity
            key={`${card.id}-${benefit.id}`}
            style={styles.item}
            onPress={() => onCardPress(card.id)}
            activeOpacity={0.7}
          >
            <View style={styles.itemHeader}>
              <View style={styles.itemLeft}>
                <Text style={styles.cardName}>{card.name}</Text>
                <Text style={styles.benefitName}>{benefit.name}</Text>
              </View>
              <View style={styles.itemRight}>
                {isUnlimited ? (
                  <Text style={styles.unlimitedBadge}>∞</Text>
                ) : (
                  <Text style={[styles.remainingValue, isFullyUsed && styles.fullyUsed]}>
                    {benefit.type === 'credit'
                      ? `$${remaining.toFixed(0)} left`
                      : benefit.type === 'visits'
                      ? `${remaining} left`
                      : `${remaining.toLocaleString()} pts`}
                  </Text>
                )}
              </View>
            </View>

            {!isUnlimited && benefit.totalValue > 0 && (
              isPeriodic
                ? <SegmentedBenefitBar benefit={benefit} />
                : (
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%` }, isFullyUsed && styles.barFillFull]} />
                  </View>
                )
            )}

            {benefit.expiresAt && (
              <Text style={styles.expiry}>Expires {formatDate(benefit.expiresAt)}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 24, paddingBottom: 120 },
  title: { fontSize: 22, fontWeight: '700', color: '#000', marginBottom: 24 },
  empty: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 40 },
  summary: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
    paddingVertical: 16,
    marginBottom: 28,
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
  section: { marginBottom: 28 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#888',
    marginBottom: 12,
  },
  item: {
    paddingVertical: 14,
    // borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemLeft: { flex: 1, paddingRight: 8 },
  itemRight: { alignItems: 'flex-end' },
  cardName: { fontSize: 10, color: '#888', letterSpacing: 0.5, marginBottom: 2 },
  benefitName: { fontSize: 14, fontWeight: '500', color: '#000' },
  remainingValue: { fontSize: 14, fontWeight: '600', color: '#000' },
  fullyUsed: { color: '#aaa' },
  unlimitedBadge: { fontSize: 16, color: '#888' },
  barTrack: { height: 2, backgroundColor: '#e0e0e0', marginBottom: 6 },
  barFill: { height: 2, backgroundColor: '#000' },
  barFillFull: { backgroundColor: '#ccc' },
  expiry: { fontSize: 11, color: '#aaa' },
});
