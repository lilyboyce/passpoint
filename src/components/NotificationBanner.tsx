import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppNotification } from '../types';

interface Props {
  notification: AppNotification;
  onDismiss?: () => void;
}

export default function NotificationBanner({ notification, onDismiss }: Props) {
  const isHigh = notification.urgency === 'high';

  return (
    <View style={[styles.container, isHigh && styles.high]}>
      <View style={styles.body}>
        <Text style={styles.cardName}>{notification.cardName}</Text>
        <Text style={styles.benefitName}>{notification.benefitName}</Text>
        <Text style={styles.message}>{notification.message}</Text>
      </View>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.dismiss}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#000',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  high: {
    backgroundColor: '#000',
  },
  body: {
    flex: 1,
  },
  cardName: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#888',
    marginBottom: 2,
  },
  benefitName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: '#444',
  },
  dismiss: {
    fontSize: 14,
    color: '#000',
    paddingLeft: 12,
  },
});
