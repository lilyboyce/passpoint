function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
import { CardTemplate, UserCard, AnnualBenefit } from '../types';
import { nextAnniversary, endOfCalendarYear } from './dateUtils';

export function templateToUserCard(template: CardTemplate, memberSince: string): UserCard {
  const anniversary = nextAnniversary(memberSince).toISOString();
  const calendarYear = endOfCalendarYear().toISOString();

  const benefits: AnnualBenefit[] = template.defaultBenefits.map((b) => ({
    ...b,
    id: uid(),
    usedValue: 0,
    expiresAt:
      b.expiryType === 'anniversary'
        ? anniversary
        : b.expiryType === 'calendar_year'
        ? calendarYear
        : null,
  }));

  return {
    id: uid(),
    templateId: template.id,
    name: template.name,
    issuer: template.issuer,
    rewardCurrency: template.rewardCurrency,
    baseMultiplier: template.baseMultiplier,
    categories: template.categories,
    annualFee: template.annualFee,
    benefits,
    pointsBalance: 0,
    memberSince,
    lastUpdated: new Date().toISOString(),
  };
}

export function currencyLabel(currency: UserCard['rewardCurrency']): string {
  switch (currency) {
    case 'points': return 'pts';
    case 'miles': return 'mi';
    case 'cashback': return '%';
  }
}

export function formatMultiplier(multiplier: number, currency: UserCard['rewardCurrency']): string {
  if (currency === 'cashback') return `${multiplier}%`;
  return `${multiplier}x`;
}
