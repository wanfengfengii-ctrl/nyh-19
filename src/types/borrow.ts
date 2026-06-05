export type BorrowStatus =
  | 'borrowed'
  | 'returned'
  | 'overdue'
  | 'pending_approval'
  | 'rejected'
  | 'renewal_pending';

export type BorrowPriority = 'low' | 'medium' | 'high' | 'urgent';

export type RenewalStatus = 'pending' | 'approved' | 'rejected';

export interface StatusCheckItem {
  id: string;
  category: string;
  item: string;
  checked: boolean;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
  checkedBy?: string;
  checkedAt?: string;
}

export interface BorrowRecord {
  id: string;
  objectiveId: string;
  borrowerName: string;
  borrowerDepartment: string;
  borrowerContact: string;
  reason: string;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: BorrowStatus;
  notes?: string;
  createdAt: string;
  priority?: BorrowPriority;
  approvalStatus?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  depositAmount?: number;
  depositReturned?: boolean;
  depositReturnedAt?: string;
  usageFee?: number;
  renewalCount?: number;
  hasPenalty?: boolean;
  checkOutChecklist?: StatusCheckItem[];
  checkInChecklist?: StatusCheckItem[];
}

export interface RenewalRequest {
  id: string;
  borrowRecordId: string;
  objectiveId: string;
  borrowerName: string;
  currentReturnDate: string;
  requestedReturnDate: string;
  reason: string;
  status: RenewalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  submittedAt: string;
}

export interface BorrowConflict {
  objectiveId: string;
  objectiveSerialNumber: string;
  existingBorrow: {
    id: string;
    borrowerName: string;
    borrowDate: string;
    expectedReturnDate: string;
  };
  requestedBorrow: {
    borrowerName: string;
    requestedBorrowDate: string;
    requestedReturnDate: string;
  };
  overlapDays: number;
}

export interface BorrowFormData {
  borrowerName: string;
  borrowerDepartment: string;
  borrowerContact: string;
  reason: string;
  borrowDate: Date | null;
  expectedReturnDate: Date | null;
  notes?: string;
}

export interface ReturnFormData {
  actualReturnDate: Date | null;
  notes?: string;
}

export interface BorrowFilterOptions {
  status?: BorrowStatus;
  borrowerName?: string;
  startDate?: string;
  endDate?: string;
  department?: string;
}
