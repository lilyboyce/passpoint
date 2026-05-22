import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { navigate } from '../navigation/navigationRef';
import { CARD_TEMPLATES } from '../data/cardTemplates';

export default function AddCardScreen() {
  const navigation = useNavigation();

  const issuers = Array.from(new Set(CARD_TEMPLATES.map((t) => t.issuer)));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Card</Text>
          <View style={{ width: 60 }} />
        </View>

        {issuers.map((issuer) => (
          <View key={issuer} style={styles.issuerGroup}>
            <Text style={styles.issuerLabel}>{issuer.toUpperCase()}</Text>
            {CARD_TEMPLATES.filter((t) => t.issuer === issuer).map((template) => (
              <TouchableOpacity
                key={template.id}
                style={styles.cardOption}
                onPress={() => navigate('AddCardDate', { templateId: template.id })}
                activeOpacity={0.7}
              >
                <View style={styles.cardOptionLeft}>
                  <Text style={styles.cardOptionName}>{template.name}</Text>
                  <Text style={styles.cardOptionMeta}>
                    ${template.annualFee}/yr ·{' '}
                    {template.rewardCurrency === 'cashback'
                      ? 'Cash Back'
                      : template.rewardCurrency === 'points'
                      ? 'Points'
                      : 'Miles'}
                  </Text>
                </View>
                <Text style={styles.cardOptionArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 24, paddingBottom: 48 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  back: { fontSize: 14, color: '#000' },
  title: { fontSize: 16, fontWeight: '600', color: '#000' },
  issuerGroup: { marginBottom: 24 },
  issuerLabel: {
    fontSize: 10,
    letterSpacing: 1,
    color: '#888',
    marginBottom: 8,
  },
  cardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 14,
    marginBottom: 8,
  },
  cardOptionLeft: { flex: 1 },
  cardOptionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  cardOptionMeta: { fontSize: 12, color: '#888' },
  cardOptionArrow: { fontSize: 18, color: '#ccc' },
});
