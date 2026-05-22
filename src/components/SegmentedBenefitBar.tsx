import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AnnualBenefit } from '../types';
import {
  getAllPeriodKeys,
  getCurrentPeriodKey,
  isPeriodPast,
  getPeriodLabel,
} from '../utils/dateUtils';

interface Props {
  benefit: AnnualBenefit;
  onPeriodPress?: (key: string) => void;
  selectedPeriodKey?: string;
}

export default function SegmentedBenefitBar({ benefit, onPeriodPress, selectedPeriodKey }: Props) {
  if (!benefit.periodMonths) return null;

  const periods = getAllPeriodKeys(benefit.periodMonths);
  const currentKey = getCurrentPeriodKey(benefit.periodMonths);
  const perPeriod = benefit.totalValue / periods.length;
  const isMonthly = benefit.periodMonths === 1;

  return (
    <View style={styles.container}>
      <View style={styles.barRow}>
        {periods.map((key, i) => {
          const used = benefit.periodUsage?.[key] ?? 0;
          const pct = perPeriod > 0 ? Math.min(used / perPeriod, 1) * 100 : 0;
          const past = isPeriodPast(key, benefit.periodMonths!);
          const current = key === currentKey;
          const selected = key === selectedPeriodKey;

          return (
            <TouchableOpacity
              key={key}
              onPress={onPeriodPress ? () => onPeriodPress(key) : undefined}
              activeOpacity={onPeriodPress ? 0.6 : 1}
              style={[styles.segment, i < periods.length - 1 && (isMonthly ? styles.segmentGapMonthly : styles.segmentGap)]}
            >
              <View style={[styles.track, past && styles.trackPast, selected && styles.trackSelected]}>
                <View
                  style={[
                    styles.fill,
                    { width: `${pct}%` as any },
                    past && styles.fillPast,
                    selected && styles.fillSelected,
                  ]}
                />
              </View>
              <Text style={[
                styles.label,
                isMonthly && styles.labelMonthly,
                past && styles.labelPast,
                current && styles.labelCurrent,
                selected && styles.labelSelected,
              ]}>
                {getPeriodLabel(key)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function getCurrentPeriodRemaining(benefit: AnnualBenefit): number {
  if (!benefit.periodMonths) return benefit.totalValue - benefit.usedValue;
  const perPeriod = benefit.totalValue / (12 / benefit.periodMonths);
  const key = getCurrentPeriodKey(benefit.periodMonths);
  const used = benefit.periodUsage?.[key] ?? 0;
  return Math.max(0, perPeriod - used);
}

export function getCurrentPeriodUsed(benefit: AnnualBenefit): number {
  if (!benefit.periodMonths) return benefit.usedValue;
  const key = getCurrentPeriodKey(benefit.periodMonths);
  return benefit.periodUsage?.[key] ?? 0;
}

const styles = StyleSheet.create({
  container: { marginTop: 2 },
  barRow: { flexDirection: 'row' },
  segment: { flex: 1 },
  segmentGap: { marginRight: 3 },
  segmentGapMonthly: { marginRight: 1 },
  track: {
    height: 2,
    backgroundColor: '#e0e0e0',
    marginBottom: 3,
  },
  trackPast: { backgroundColor: '#ebebeb' },
  trackSelected: { backgroundColor: '#bbb' },
  fill: { height: 2, backgroundColor: '#000' },
  fillPast: { backgroundColor: '#ccc' },
  fillSelected: { backgroundColor: '#555' },
  label: {
    fontSize: 9,
    color: '#aaa',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  labelMonthly: {
    fontSize: 7,
    letterSpacing: 0,
  },
  labelPast: { color: '#ccc' },
  labelCurrent: { color: '#000' },
  labelSelected: { color: '#555', fontWeight: '700' },
});
