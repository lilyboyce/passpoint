export type RewardCurrency = 'points' | 'miles' | 'cashback';

export type BenefitCategory =
  | 'dining'
  | 'travel'
  | 'groceries'
  | 'gas'
  | 'entertainment'
  | 'streaming'
  | 'transit'
  | 'hotels'
  | 'airlines'
  | 'drugstore'
  | 'home_improvement'
  | 'online_shopping'
  | 'wholesale'
  | 'general';

export interface CategoryRate {
  category: BenefitCategory;
  multiplier: number; // e.g. 3 = 3x points
  label: string; // e.g. "3x on dining"
}

export type BenefitType = 'credit' | 'visits' | 'points';

export interface AnnualBenefit {
  id: string;
  name: string;
  type: BenefitType;
  totalValue: number; // dollar amount or visit count or point amount
  usedValue: number;
  expiresAt: string | null; // ISO date string — anniversary date or calendar year
  expiryType: 'anniversary' | 'calendar_year' | 'statement';
  notes?: string;
  applicableMerchants?: string[]; // lowercase substrings matched against merchant query
  applicableCategories?: BenefitCategory[]; // MCC categories this benefit covers
  periodMonths?: 1 | 3 | 6; // monthly, quarterly, or semi-annual reset
  periodUsage?: { [periodKey: string]: number }; // usage keyed by e.g. "2026-M05", "2026-Q2", "2026-H1"
}

export interface CardTemplate {
  id: string;
  name: string;
  issuer: string;
  rewardCurrency: RewardCurrency;
  baseMultiplier: number;
  categories: CategoryRate[];
  annualFee: number;
  defaultBenefits: Omit<AnnualBenefit, 'id' | 'usedValue' | 'expiresAt'>[];
  color: string; // kept for future theming, currently unused
}

export interface UserCard {
  id: string; // unique instance id
  templateId: string;
  name: string; // can be customized
  issuer: string;
  rewardCurrency: RewardCurrency;
  baseMultiplier: number;
  categories: CategoryRate[];
  annualFee: number;
  benefits: AnnualBenefit[];
  pointsBalance: number;
  memberSince: string; // ISO date — used to compute anniversary
  lastUpdated: string;
}

export interface MerchantLookupResult {
  merchant: string;
  detectedCategory: BenefitCategory;
  categoryLabel: string;
  recommendations: CardRecommendation[];
}

export interface CardRecommendation {
  card: UserCard;
  multiplier: number;
  label: string;
  isBest: boolean;
}

export interface AppNotification {
  id: string;
  cardId: string;
  cardName: string;
  benefitName: string;
  message: string;
  urgency: 'high' | 'medium' | 'low';
  daysUntilExpiry: number;
}
