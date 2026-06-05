export type CreditLevel = 'excellent' | 'good' | 'fair' | 'poor';

export interface CreditProfile {
  id: string;
  borrowerName: string;
  totalBorrows: number;
  onTimeReturns: number;
  overdueCount: number;
  totalOverdueDays: number;
  damageCount: number;
  penaltyCount: number;
  creditScore: number;
  creditLevel: CreditLevel;
  lastUpdated: string;
}

export interface CreditScoreTrendItem {
  date: string;
  score: number;
}
