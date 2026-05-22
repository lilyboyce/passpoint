import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { classifyMerchant, searchMerchants, MerchantSuggestion } from '../data/merchants';
import { AnnualBenefit, BenefitCategory, CardRecommendation } from '../types';
import { formatMultiplier } from '../utils/cardUtils';

type LookupResult = {
  merchant: string;
  category: BenefitCategory;
  categoryLabel: string;
  recommendations: CardRecommendation[];
};

function getMatchingBenefits(
  benefits: AnnualBenefit[],
  query: string,
  category: BenefitCategory
): AnnualBenefit[] {
  const q = query.toLowerCase();
  return benefits.filter((b) => {
    if (b.totalValue === 0) return false;
    if (b.totalValue > 0 && b.usedValue >= b.totalValue) return false;
    const merchantMatch = b.applicableMerchants?.some((m) => q.includes(m) || m.includes(q));
    const categoryMatch = b.applicableCategories?.includes(category);
    return merchantMatch || categoryMatch;
  });
}

function benefitRemaining(b: AnnualBenefit): string {
  if (b.totalValue === -1) return 'Unlimited';
  const remaining = b.totalValue - b.usedValue;
  if (b.type === 'credit') return `$${remaining.toFixed(0)} remaining`;
  if (b.type === 'visits') return `${remaining} visit${remaining !== 1 ? 's' : ''} remaining`;
  return `${remaining.toLocaleString()} pts remaining`;
}

export default function MerchantLookupScreen() {
  const { cards } = useApp();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MerchantSuggestion[]>([]);
  const [result, setResult] = useState<LookupResult | null>(null);

  function handleChangeText(text: string) {
    setQuery(text);
    setResult(null);
    setSuggestions(searchMerchants(text));
  }

  function runLookup(merchantName: string) {
    Keyboard.dismiss();
    setQuery(merchantName);
    setSuggestions([]);

    const { category, label } = classifyMerchant(merchantName);

    const recommendations: CardRecommendation[] = cards.map((card) => {
      const categoryMatch = card.categories.find((c) => c.category === category);
      const multiplier = categoryMatch ? categoryMatch.multiplier : card.baseMultiplier;
      const rateLabel = categoryMatch
        ? categoryMatch.label
        : `${formatMultiplier(card.baseMultiplier, card.rewardCurrency)} on all purchases`;
      return { card, multiplier, label: rateLabel, isBest: false };
    });

    const maxMultiplier = Math.max(...recommendations.map((r) => r.multiplier), 0);
    recommendations.forEach((r) => {
      r.isBest = r.multiplier === maxMultiplier && maxMultiplier > 0;
    });
    recommendations.sort((a, b) => b.multiplier - a.multiplier);

    setResult({ merchant: merchantName, category, categoryLabel: label, recommendations });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Best Card For</Text>
        <Text style={styles.subtitle}>Enter a merchant to find your best card.</Text>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Merchant name (e.g. Whole Foods)"
            placeholderTextColor="#aaa"
            value={query}
            onChangeText={handleChangeText}
            onSubmitEditing={() => query.trim() && runLookup(query.trim())}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => { setQuery(''); setSuggestions([]); setResult(null); }}
            >
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => query.trim() && runLookup(query.trim())}
          >
            <Text style={styles.searchBtnText}>→</Text>
          </TouchableOpacity>
        </View>

        {suggestions.length > 0 && (
          <View style={styles.suggestions}>
            {suggestions.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.suggestion, i < suggestions.length - 1 && styles.suggestionBorder]}
                onPress={() => runLookup(s.name)}
              >
                <Text style={styles.suggestionName}>{s.name}</Text>
                <Text style={styles.suggestionLabel}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {cards.length === 0 && (
          <Text style={styles.noCards}>Add cards first to get recommendations.</Text>
        )}

        {result && (
          <View style={styles.results}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>
                {result.merchant} · {result.categoryLabel}
              </Text>
            </View>

            {result.recommendations.length === 0 && (
              <Text style={styles.noCards}>No cards to compare.</Text>
            )}

            {result.recommendations.map((rec) => {
              const matchingBenefits = getMatchingBenefits(rec.card.benefits, result.merchant, result.category);
              return (
                <View
                  key={rec.card.id}
                  style={[styles.recRow, rec.isBest && styles.recRowBest]}
                >
                  <View style={styles.recLeft}>
                    {rec.isBest && <Text style={styles.bestTag}>BEST</Text>}
                    <Text style={[styles.recCardName, rec.isBest && styles.recCardNameBest]}>
                      {rec.card.name}
                    </Text>
                    <Text style={[styles.recLabel, rec.isBest && styles.recLabelBest]}>
                      {rec.label}
                    </Text>
                    {matchingBenefits.map((b) => (
                      <View key={b.id} style={styles.benefitTag}>
                        <Text style={[styles.benefitTagText, rec.isBest && styles.benefitTagTextBest]}>
                          {b.name} · {benefitRemaining(b)}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <Text style={[styles.recMultiplier, rec.isBest && styles.recMultiplierBest]}>
                    {formatMultiplier(rec.multiplier, rec.card.rewardCurrency)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 24, paddingBottom: 120 },
  title: { fontSize: 22, fontWeight: '700', color: '#000', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 24 },
  searchRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 0,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: '#000',
  },
  clearBtn: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtnText: { fontSize: 13, color: '#aaa' },
  searchBtn: {
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  searchBtnText: { color: '#fff', fontSize: 18 },
  suggestions: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#000',
    marginBottom: 24,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  suggestionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionName: { fontSize: 14, fontWeight: '500', color: '#000' },
  suggestionLabel: { fontSize: 12, color: '#aaa' },
  noCards: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 24 },
  results: { gap: 1, marginTop: 24 },
  categoryTag: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 10,
    marginBottom: 16,
  },
  categoryText: { fontSize: 12, color: '#444' },
  recRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  recRowBest: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
  recLeft: { flex: 1 },
  bestTag: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#fff',
    marginBottom: 4,
  },
  recCardName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  recCardNameBest: { color: '#fff' },
  recLabel: { fontSize: 12, color: '#888' },
  recLabelBest: { color: '#bbb' },
  recMultiplier: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    alignSelf: 'flex-start',
  },
  recMultiplierBest: { color: '#fff' },
  benefitTag: {
    marginTop: 6,
  },
  benefitTagText: {
    fontSize: 11,
    color: '#555',
  },
  benefitTagTextBest: { color: '#ccc' },
});
