import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import CardRow from '../components/CardRow';
import { navigate as goTo } from '../navigation/navigationRef';

export default function CardsScreen() {
  const { cards } = useApp();

  const issuers = Array.from(new Set(cards.map((c) => c.issuer)));
  const totalAnnualFees = cards.reduce((s, c) => s + c.annualFee, 0);
  const totalBenefitValue = cards.reduce(
    (s, c) => s + c.benefits.filter((b) => b.type === 'credit').reduce((bs, b) => bs + b.totalValue, 0),
    0
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Cards</Text>
          <TouchableOpacity onPress={() => goTo('AddCard')}>
            <Text style={styles.addBtn}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{cards.length}</Text>
            <Text style={styles.summaryLabel}>Cards</Text>
          </View>
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
        ) : (
          issuers.map((issuer) => (
            <View key={issuer} style={styles.issuerGroup}>
              <Text style={styles.issuerLabel}>{issuer.toUpperCase()}</Text>
              {cards
                .filter((c) => c.issuer === issuer)
                .map((card) => (
                  <CardRow
                    key={card.id}
                    card={card}
                    onPress={() => goTo('CardDetail', { cardId: card.id })}
                  />
                ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 24, paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#000' },
  addBtn: { fontSize: 14, color: '#000', fontWeight: '500' },
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
  emptyText: { fontSize: 14, color: '#888', marginBottom: 8 },
  emptyLink: { fontSize: 14, color: '#000', fontWeight: '500' },
  issuerGroup: { marginBottom: 28 },
  issuerLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#888',
    marginBottom: 10,
  },
});
