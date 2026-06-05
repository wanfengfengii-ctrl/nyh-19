import type {
  Objective,
  FilterOptions,
  BorrowRecord,
  BorrowFilterOptions,
  BorrowApplication,
  ApprovalFilterOptions,
  DepositRecord,
  PenaltyRecord,
  FinanceFilterOptions,
  CreditProfile,
} from '../types';
import { isDateInRange } from './dateUtils';

export function filterObjectives(
  objectives: Objective[],
  filters: FilterOptions,
  getCurrentBorrowRecord?: (id: string) => BorrowRecord | undefined
): Objective[] {
  return objectives.filter((obj) => {
    if (filters.status && obj.status !== filters.status) return false;
    if (filters.brand && obj.brand !== filters.brand) return false;
    if (filters.magnification && obj.magnification !== filters.magnification)
      return false;
    if (filters.coatingStatus && obj.coatingStatus !== filters.coatingStatus)
      return false;
    if (filters.hasMold && !obj.damages.some((d) => d.type === 'mold'))
      return false;
    if (filters.hasScratch && !obj.damages.some((d) => d.type === 'scratch'))
      return false;
    if (
      filters.hasCoatingDamage &&
      !obj.damages.some((d) => d.type === 'coating')
    )
      return false;
    if (filters.damageTypes?.length) {
      const hasDamage = filters.damageTypes.some((type) =>
        obj.damages.some((d) => d.type === type)
      );
      if (!hasDamage) return false;
    }
    if (filters.borrowStatus && getCurrentBorrowRecord) {
      const currentBorrow = getCurrentBorrowRecord(obj.id);
      if (filters.borrowStatus === 'available' && currentBorrow) {
        return false;
      }
      if (
        filters.borrowStatus === 'borrowed' &&
        (!currentBorrow || currentBorrow.status === 'overdue')
      ) {
        return false;
      }
      if (
        filters.borrowStatus === 'overdue' &&
        (!currentBorrow || currentBorrow.status !== 'overdue')
      ) {
        return false;
      }
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchFields = [
        obj.serialNumber,
        obj.brand,
        obj.storageLocation,
      ].join(' ');
      if (!searchFields.toLowerCase().includes(searchLower)) return false;
    }
    return true;
  });
}

export function filterBorrowRecords(
  records: BorrowRecord[],
  filters: BorrowFilterOptions
): BorrowRecord[] {
  return records.filter((r) => {
    if (filters.status && r.status !== filters.status) return false;
    if (
      filters.borrowerName &&
      !r.borrowerName.toLowerCase().includes(filters.borrowerName.toLowerCase())
    )
      return false;
    if (filters.department && r.borrowerDepartment !== filters.department)
      return false;
    if (filters.startDate || filters.endDate) {
      if (!isDateInRange(r.borrowDate, filters.startDate, filters.endDate))
        return false;
    }
    return true;
  });
}

export function filterBorrowApplications(
  applications: BorrowApplication[],
  filters: ApprovalFilterOptions
): BorrowApplication[] {
  return applications.filter((app) => {
    if (filters.status && app.status !== filters.status) return false;
    if (filters.priority && app.priority !== filters.priority) return false;
    if (
      filters.borrowerName &&
      !app.borrowerName.toLowerCase().includes(filters.borrowerName.toLowerCase())
    )
      return false;
    if (filters.department && app.borrowerDepartment !== filters.department)
      return false;
    if (filters.startDate || filters.endDate) {
      if (!isDateInRange(app.submittedAt, filters.startDate, filters.endDate))
        return false;
    }
    return true;
  });
}

export function filterFinanceRecords(
  deposits: DepositRecord[],
  penalties: PenaltyRecord[],
  filters: FinanceFilterOptions
): { deposits: DepositRecord[]; penalties: PenaltyRecord[] } {
  let filteredDeposits = [...deposits];
  let filteredPenalties = [...penalties];

  if (filters.type === 'deposit') {
    filteredPenalties = [];
  } else if (filters.type === 'penalty') {
    filteredDeposits = [];
  }

  if (filters.status === 'active') {
    filteredDeposits = filteredDeposits.filter((d) => !d.returned);
  } else if (filters.status === 'returned') {
    filteredDeposits = filteredDeposits.filter((d) => d.returned);
  } else if (filters.status === 'paid') {
    filteredPenalties = filteredPenalties.filter((p) => p.paid);
  } else if (filters.status === 'unpaid') {
    filteredPenalties = filteredPenalties.filter((p) => !p.paid);
  }

  if (filters.borrowerName) {
    const name = filters.borrowerName.toLowerCase();
    filteredDeposits = filteredDeposits.filter((d) =>
      d.borrowerName.toLowerCase().includes(name)
    );
    filteredPenalties = filteredPenalties.filter((p) =>
      p.borrowerName.toLowerCase().includes(name)
    );
  }

  if (filters.startDate || filters.endDate) {
    filteredDeposits = filteredDeposits.filter((d) =>
      isDateInRange(d.paidAt, filters.startDate, filters.endDate)
    );
    filteredPenalties = filteredPenalties.filter((p) =>
      isDateInRange(p.issuedAt, filters.startDate, filters.endDate)
    );
  }

  if (filters.penaltyType) {
    filteredPenalties = filteredPenalties.filter(
      (p) => p.type === filters.penaltyType
    );
  }

  return { deposits: filteredDeposits, penalties: filteredPenalties };
}

export function filterCreditProfiles(
  profiles: CreditProfile[],
  search?: string,
  minScore?: number,
  maxScore?: number
): CreditProfile[] {
  return profiles.filter((p) => {
    if (search && !p.borrowerName.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (minScore !== undefined && p.creditScore < minScore) return false;
    if (maxScore !== undefined && p.creditScore > maxScore) return false;
    return true;
  });
}
