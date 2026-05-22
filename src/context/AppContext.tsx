import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { UserCard, AnnualBenefit, AppNotification } from '../types';
import { loadCards, saveCards } from '../services/storage';
import { differenceInDays, parseISO, isValid, nextAnniversary, endOfCalendarYear, getCurrentPeriodKey } from '../utils/dateUtils';
import { CARD_TEMPLATES } from '../data/cardTemplates';

interface AppContextValue {
  cards: UserCard[];
  loading: boolean;
  addCard: (card: UserCard) => Promise<void>;
  updateCard: (card: UserCard) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  updateBenefitUsage: (cardId: string, benefitId: string, usedValue: number, periodKey?: string) => Promise<void>;
  updatePointsBalance: (cardId: string, balance: number) => Promise<void>;
  updateMemberSince: (cardId: string, memberSince: string) => Promise<void>;
  notifications: AppNotification[];
  refreshNotifications: () => void;
}

function migrateCardsFromTemplates(cards: UserCard[]): UserCard[] {
  return cards.map((card) => {
    const template = CARD_TEMPLATES.find((t) => t.id === card.templateId);
    if (!template) return card;

    const anniversary = nextAnniversary(card.memberSince).toISOString();
    const calendarYear = endOfCalendarYear().toISOString();

    const benefits = card.benefits.map((benefit) => {
      const tb = template.defaultBenefits.find((t) => t.name === benefit.name);
      if (!tb) return benefit;

      const expiresAt =
        tb.expiryType !== benefit.expiryType
          ? tb.expiryType === 'anniversary'
            ? anniversary
            : tb.expiryType === 'calendar_year'
            ? calendarYear
            : null
          : benefit.expiresAt;

      return {
        ...benefit, // preserves id, usedValue, periodUsage
        type: tb.type,
        totalValue: tb.totalValue,
        expiryType: tb.expiryType,
        notes: tb.notes,
        applicableMerchants: tb.applicableMerchants,
        applicableCategories: tb.applicableCategories,
        periodMonths: tb.periodMonths,
        expiresAt,
      };
    });

    return { ...card, benefits };
  });
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    loadCards().then((data) => {
      const migrated = migrateCardsFromTemplates(data);
      if (JSON.stringify(migrated) !== JSON.stringify(data)) {
        saveCards(migrated);
      }
      setCards(migrated);
      setLoading(false);
    });
  }, []);

  const persist = useCallback(async (updated: UserCard[]) => {
    setCards(updated);
    await saveCards(updated);
  }, []);

  const addCard = useCallback(
    async (card: UserCard) => {
      await persist([...cards, card]);
    },
    [cards, persist]
  );

  const updateCard = useCallback(
    async (card: UserCard) => {
      await persist(cards.map((c) => (c.id === card.id ? card : c)));
    },
    [cards, persist]
  );

  const deleteCard = useCallback(
    async (cardId: string) => {
      await persist(cards.filter((c) => c.id !== cardId));
    },
    [cards, persist]
  );

  const updateBenefitUsage = useCallback(
    async (cardId: string, benefitId: string, usedValue: number, periodKey?: string) => {
      const updated = cards.map((card) => {
        if (card.id !== cardId) return card;
        return {
          ...card,
          benefits: card.benefits.map((b) => {
            if (b.id !== benefitId) return b;
            if (b.periodMonths) {
              const key = periodKey ?? getCurrentPeriodKey(b.periodMonths);
              const periodUsage = { ...(b.periodUsage ?? {}), [key]: usedValue };
              const totalUsed = Object.values(periodUsage).reduce((s, v) => s + v, 0);
              return { ...b, periodUsage, usedValue: totalUsed };
            }
            return { ...b, usedValue };
          }),
          lastUpdated: new Date().toISOString(),
        };
      });
      await persist(updated);
    },
    [cards, persist]
  );

  const updatePointsBalance = useCallback(
    async (cardId: string, balance: number) => {
      const updated = cards.map((card) =>
        card.id === cardId
          ? { ...card, pointsBalance: balance, lastUpdated: new Date().toISOString() }
          : card
      );
      await persist(updated);
    },
    [cards, persist]
  );

  const updateMemberSince = useCallback(
    async (cardId: string, memberSince: string) => {
      const anniversary = nextAnniversary(memberSince).toISOString();
      const calendarYear = endOfCalendarYear().toISOString();
      const updated = cards.map((card) => {
        if (card.id !== cardId) return card;
        return {
          ...card,
          memberSince,
          benefits: card.benefits.map((b) => ({
            ...b,
            expiresAt:
              b.expiryType === 'anniversary'
                ? anniversary
                : b.expiryType === 'calendar_year'
                ? calendarYear
                : b.expiresAt,
          })),
          lastUpdated: new Date().toISOString(),
        };
      });
      await persist(updated);
    },
    [cards, persist]
  );

  const computeNotifications = useCallback((): AppNotification[] => {
    const notes: AppNotification[] = [];
    const now = new Date();

    for (const card of cards) {
      for (const benefit of card.benefits) {
        if (!benefit.expiresAt) continue;

        const expiry = parseISO(benefit.expiresAt);
        if (!isValid(expiry)) continue;

        const days = differenceInDays(expiry, now);
        if (days < 0) continue; // already expired

        const remaining =
          benefit.type === 'credit'
            ? benefit.totalValue - benefit.usedValue
            : benefit.type === 'visits' && benefit.totalValue > 0
            ? benefit.totalValue - benefit.usedValue
            : 0;

        const hasRemainingValue =
          benefit.type === 'points'
            ? benefit.usedValue === 0
            : remaining > 0;

        if (!hasRemainingValue) continue;

        let urgency: AppNotification['urgency'] = 'low';
        if (days <= 14) urgency = 'high';
        else if (days <= 30) urgency = 'medium';
        else if (days > 60) continue; // not urgent enough to surface

        const valueStr =
          benefit.type === 'credit'
            ? `$${remaining.toFixed(0)} remaining`
            : benefit.type === 'visits' && benefit.totalValue > 0
            ? `${remaining} visit${remaining !== 1 ? 's' : ''} remaining`
            : 'unused';

        notes.push({
          id: `${card.id}-${benefit.id}`,
          cardId: card.id,
          cardName: card.name,
          benefitName: benefit.name,
          message: `${valueStr} — expires in ${days} day${days !== 1 ? 's' : ''}`,
          urgency,
          daysUntilExpiry: days,
        });
      }
    }

    return notes.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [cards]);

  const refreshNotifications = useCallback(() => {
    setNotifications(computeNotifications());
  }, [computeNotifications]);

  useEffect(() => {
    refreshNotifications();
  }, [cards, refreshNotifications]);

  return (
    <AppContext.Provider
      value={{
        cards,
        loading,
        addCard,
        updateCard,
        deleteCard,
        updateBenefitUsage,
        updatePointsBalance,
        updateMemberSince,
        notifications,
        refreshNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
