import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserCard } from '../types';

// Storage abstraction — swap AsyncStorage for a remote client here when going multi-device

const CARDS_KEY = '@passpoint:cards';

export async function loadCards(): Promise<UserCard[]> {
  try {
    const json = await AsyncStorage.getItem(CARDS_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function saveCards(cards: UserCard[]): Promise<void> {
  await AsyncStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}

export async function addCard(card: UserCard): Promise<void> {
  const cards = await loadCards();
  await saveCards([...cards, card]);
}

export async function updateCard(updated: UserCard): Promise<void> {
  const cards = await loadCards();
  await saveCards(cards.map((c) => (c.id === updated.id ? updated : c)));
}

export async function deleteCard(cardId: string): Promise<void> {
  const cards = await loadCards();
  await saveCards(cards.filter((c) => c.id !== cardId));
}
