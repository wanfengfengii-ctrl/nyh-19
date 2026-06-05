export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface BorrowApplication {
  id: string;
  objectiveId: string;
  borrowerName: string;
  borrowerDepartment: string;
  borrowerContact: string;
  reason: string;
  requestedBorrowDate: string;
  requestedReturnDate: string;
  priority: string;
  status: ApprovalStatus;
  approvalNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface ApprovalFilterOptions {
  status?: ApprovalStatus;
  priority?: string;
  borrowerName?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
}
