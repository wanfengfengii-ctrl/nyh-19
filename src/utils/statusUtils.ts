import type {
  ObjectiveStatus,
  DamageDetail,
  BorrowRecord,
  BorrowStatus,
} from '../types';

export function determineObjectiveStatus(
  damages: DamageDetail[],
  currentStatus?: ObjectiveStatus
): ObjectiveStatus {
  if (currentStatus === 'scrapped' || currentStatus === 'in_repair') {
    return currentStatus;
  }

  const damageTypes = new Set(damages.map((d) => d.type));

  if (damageTypes.has('coating')) return 'coating_damaged';
  if (damageTypes.has('scratch')) return 'scratched';
  if (damageTypes.has('mold')) return 'moldy';
  return 'normal';
}

export function determineBorrowStatus(record: BorrowRecord): BorrowStatus {
  if (record.actualReturnDate) return 'returned';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expectedReturn = new Date(record.expectedReturnDate);
  expectedReturn.setHours(0, 0, 0, 0);

  if (record.status === 'renewal_pending') return 'renewal_pending';
  if (expectedReturn < today) return 'overdue';
  return 'borrowed';
}

export function getBorrowStatusText(status: BorrowStatus): string {
  const statusMap: Record<BorrowStatus, string> = {
    borrowed: '借出中',
    returned: '已归还',
    overdue: '已超期',
    pending_approval: '待审批',
    rejected: '已拒绝',
    renewal_pending: '续借待审批',
  };
  return statusMap[status];
}

export function getBorrowStatusColor(status: BorrowStatus): string {
  const colorMap: Record<BorrowStatus, string> = {
    borrowed: 'blue',
    returned: 'green',
    overdue: 'red',
    pending_approval: 'yellow',
    rejected: 'gray',
    renewal_pending: 'orange',
  };
  return colorMap[status];
}

export function isObjectiveAvailable(
  status: ObjectiveStatus,
  currentBorrow?: BorrowRecord
): boolean {
  if (status === 'scrapped' || status === 'in_repair') return false;
  if (currentBorrow && !currentBorrow.actualReturnDate) return false;
  return true;
}

export function canBorrowObjective(
  status: ObjectiveStatus,
  currentBorrow?: BorrowRecord
): { canBorrow: boolean; reason?: string } {
  if (status === 'scrapped') {
    return { canBorrow: false, reason: '已报废物镜不能借出' };
  }
  if (status === 'in_repair') {
    return { canBorrow: false, reason: '维修中物镜不能借出' };
  }
  if (currentBorrow && !currentBorrow.actualReturnDate) {
    return { canBorrow: false, reason: '物镜未归还，不能重复借出' };
  }
  return { canBorrow: true };
}

export function calculateCreditScore(params: {
  totalBorrows: number;
  onTimeReturns: number;
  overdueCount: number;
  totalOverdueDays: number;
  damageCount: number;
  penaltyCount: number;
}): number {
  const {
    totalBorrows,
    overdueCount,
    totalOverdueDays,
    damageCount,
    penaltyCount,
  } = params;

  let score = 100;
  if (totalBorrows === 0) return 80;

  score -= overdueCount * 10;
  score -= Math.min(totalOverdueDays * 2, 30);
  score -= penaltyCount * 15;
  score -= damageCount * 20;

  return Math.max(0, Math.min(100, score));
}

export function getCreditLevel(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

export function getPendingStatus(status: string | BorrowStatus): boolean {
  return (
    status === 'borrowed' ||
    status === 'overdue' ||
    status === 'renewal_pending'
  );
}

export function isBorrowActive(status: BorrowStatus): boolean {
  return (
    status === 'borrowed' ||
    status === 'overdue' ||
    status === 'renewal_pending'
  );
}
