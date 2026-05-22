import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { UserCard } from '../types';
import { currencyLabel, formatMultiplier } from '../utils/cardUtils';
import { getCardImage } from '../utils/cardImages';

interface Props {
  card: UserCard;
  onPress: () => void;
}

export default function CardRow({ card, onPress }: Props) {
  const totalBenefitValue = card.benefits
    .filter((b) => b.type === 'credit')
    .reduce((sum, b) => sum + b.totalValue, 0);

  const usedBenefitValue = card.benefits
    .filter((b) => b.type === 'credit')
    .reduce((sum, b) => sum + b.usedValue, 0);

  const image = getCardImage(card.templateId);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      
      <View style={styles.header}>
      {image ? (
        <Image source={image} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.placeholderIssuer}>{card.issuer.toUpperCase()}</Text>
          <Text style={styles.placeholderName}>{card.name}</Text>
        </View>
      )}
        <View style={styles.left}>
          <Text style={styles.name}>{card.name}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.base}>{formatMultiplier(card.baseMultiplier, card.rewardCurrency)} </Text>
          <Text style={styles.currency}>{currencyLabel(card.rewardCurrency)}</Text>
        </View>
      </View>
      {totalBenefitValue > 0 && (
        <View style={styles.benefitBar}>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${Math.min((usedBenefitValue / totalBenefitValue) * 100, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.benefitText}>
            ${usedBenefitValue.toFixed(0)} / ${totalBenefitValue.toFixed(0)} credits used
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: '#e0e0e0',
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  cardImage: {
    width: 56,
    height: 35,
    borderRadius: 4,
    backgroundColor: '#1a1a1a',
    marginRight: 12,
  },
  cardImagePlaceholder: {
    width: 56,
    height: 35,
    borderRadius: 4,
    backgroundColor: '#1a1a1a',
    marginRight: 12,
    paddingHorizontal: 6,
    paddingVertical: 5,
    justifyContent: 'space-between',
  },
  placeholderIssuer: {
    fontSize: 5,
    letterSpacing: 0.5,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
  },
  placeholderName: {
    fontSize: 6,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  left: {
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
  },
  issuer: {
    fontSize: 10,
    letterSpacing: 1,
    color: '#888',
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  base: {
    fontSize: 12,
    color: '#444',
  },
  currency: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  benefitBar: {
    marginTop: 10,
  },
  barTrack: {
    height: 2,
    backgroundColor: '#e0e0e0',
    marginBottom: 4,
  },
  barFill: {
    height: 2,
    backgroundColor: '#000',
  },
  benefitText: {
    fontSize: 11,
    color: '#888',
    alignSelf: 'flex-end',
  },
});
