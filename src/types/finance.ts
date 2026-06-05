export type PenaltyType = 'overdue_fee' | 'damage_compensation' | 'rule_violation';

export interface DepositRecord {
  id: string;
  borrowRecordId: string;
  objectiveId: string;
  borrowerName: string;
  amount: number;
  paidAt: string;
  returned: boolean;
  returnedAt?: string;
  notes?: string;
}

export interface PenaltyRecord {
  id: string;
  borrowRecordId: string;
  objectiveId: string;
  borrowerName: string;
  type: PenaltyType;
  amount: number;
  reason: string;
  paid: boolean;
  paidAt?: string;
  issuedAt: string;
  issuedBy: string;
}

export interface FinanceFilterOptions {
  type?: 'deposit' | 'penalty';
  status?: 'active' | 'returned' | 'paid' | 'unpaid';
  borrowerName?: string;
  startDate?: string;
  endDate?: string;
  penaltyType?: PenaltyType;
}
