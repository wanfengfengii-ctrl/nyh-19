export type ObjectiveStatus =
  | 'normal'
  | 'scratched'
  | 'moldy'
  | 'coating_damaged'
  | 'in_repair'
  | 'scrapped';

export type BorrowStatus = 'borrowed' | 'returned' | 'overdue' | 'pending_approval' | 'rejected' | 'renewal_pending';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type BorrowPriority = 'low' | 'medium' | 'high' | 'urgent';

export type PenaltyType = 'overdue_fee' | 'damage_compensation' | 'rule_violation';

export type RenewalStatus = 'pending' | 'approved' | 'rejected';

export type DamageType = 'mold' | 'scratch' | 'coating';

export type RepairStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type OperationType =
  | 'create'
  | 'update'
  | 'delete'
  | 'scrap'
  | 'restore'
  | 'add_record'
  | 'add_image'
  | 'batch_import'
  | 'batch_export';

export interface DamageDetail {
  type: DamageType;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  location?: string;
}

export interface ImageArchive {
  id: string;
  objectiveId: string;
  url: string;
  thumbnail?: string;
  type: 'before_cleaning' | 'after_cleaning' | 'damage' | 'general';
  description: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface RepairRecord {
  id: string;
  objectiveId: string;
  title: string;
  description: string;
  status: RepairStatus;
  startDate: string;
  endDate?: string;
  technician: string;
  cost?: number;
  notes: string;
  createdAt: string;
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
  approvalStatus?: ApprovalStatus;
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

export interface BorrowApplication {
  id: string;
  objectiveId: string;
  borrowerName: string;
  borrowerDepartment: string;
  borrowerContact: string;
  reason: string;
  requestedBorrowDate: string;
  requestedReturnDate: string;
  priority: BorrowPriority;
  status: ApprovalStatus;
  approvalNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  submittedAt: string;
  reviewedAt?: string;
}

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
  creditLevel: 'excellent' | 'good' | 'fair' | 'poor';
  lastUpdated: string;
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

export interface ScrappingRecord {
  id: string;
  objectiveId: string;
  reason: string;
  approvedBy: string;
  approvedAt: string;
  restoredAt?: string;
  restoredBy?: string;
}

export interface MaintenanceReminder {
  id: string;
  objectiveId: string;
  type: 'regular' | 'damage' | 'score_drop';
  message: string;
  dueDate: string;
  acknowledged: boolean;
  createdAt: string;
}

export interface OperationLog {
  id: string;
  type: OperationType;
  objectiveId?: string;
  description: string;
  operator: string;
  timestamp: string;
  details?: Record<string, unknown> | unknown;
}

export interface Objective {
  id: string;
  serialNumber: string;
  brand: string;
  magnification: number;
  numericalAperture: number;
  interfaceSpec: string;
  coatingStatus: string;
  storageLocation: string;
  status: ObjectiveStatus;
  damages: DamageDetail[];
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  scrappingRecord?: ScrappingRecord;
  createdAt: string;
}

export interface MaintenanceRecord {
  id: string;
  objectiveId: string;
  testDate: string;
  clarityScore: number;
  hasMold: boolean;
  hasScratch: boolean;
  hasCoatingDamage: boolean;
  damages: DamageDetail[];
  beforeImages: string[];
  afterImages: string[];
  treatmentAdvice: string;
  createdAt: string;
}

export interface FilterOptions {
  status?: ObjectiveStatus;
  brand?: string;
  magnification?: number;
  coatingStatus?: string;
  search?: string;
  hasMold?: boolean;
  hasScratch?: boolean;
  hasCoatingDamage?: boolean;
  damageTypes?: DamageType[];
  borrowStatus?: 'available' | 'borrowed' | 'overdue';
}

export interface ObjectiveFormData {
  serialNumber: string;
  brand: string;
  magnification: number;
  numericalAperture: number;
  interfaceSpec: string;
  coatingStatus: string;
  storageLocation: string;
  status: ObjectiveStatus;
}

export interface MaintenanceFormData {
  testDate: Date | null;
  clarityScore: number;
  hasMold: boolean;
  hasScratch: boolean;
  hasCoatingDamage: boolean;
  damages: DamageDetail[];
  treatmentAdvice: string;
}

export interface BatchImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export const STATUS_LABELS: Record<ObjectiveStatus, string> = {
  normal: '完好',
  scratched: '有划痕',
  moldy: '有霉斑',
  coating_damaged: '镀膜损伤',
  in_repair: '维修中',
  scrapped: '已报废',
};

export const STATUS_COLORS: Record<ObjectiveStatus, string> = {
  normal: 'green',
  scratched: 'orange',
  moldy: 'yellow',
  coating_damaged: 'pink',
  in_repair: 'blue',
  scrapped: 'red',
};

export const DAMAGE_TYPE_LABELS: Record<DamageType, string> = {
  mold: '霉斑',
  scratch: '划痕',
  coating: '镀膜损伤',
};

export const DAMAGE_TYPE_COLORS: Record<DamageType, string> = {
  mold: 'yellow',
  scratch: 'orange',
  coating: 'pink',
};

export const SEVERITY_LABELS: Record<string, string> = {
  mild: '轻微',
  moderate: '中度',
  severe: '严重',
};

export const SEVERITY_COLORS: Record<string, string> = {
  mild: 'green',
  moderate: 'yellow',
  severe: 'red',
};

export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  pending: '待处理',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
};

export const REPAIR_STATUS_COLORS: Record<RepairStatus, string> = {
  pending: 'yellow',
  in_progress: 'blue',
  completed: 'green',
  cancelled: 'gray',
};

export const BRAND_OPTIONS = [
  'Zeiss',
  'Leica',
  'Olympus',
  'Nikon',
  'Mitutoyo',
  'Reichert',
  'Wild',
  'Bausch & Lomb',
  '其他',
];

export const MAGNIFICATION_OPTIONS = [4, 10, 20, 40, 60, 100];

export const INTERFACE_OPTIONS = ['RMS', 'M25', 'M32', 'M26', 'DIN', '其他'];

export const COATING_OPTIONS = [
  '原厂镀膜完好',
  '轻微老化',
  '镀膜损伤',
  '无镀膜',
  '已重新镀膜',
];

export const IMAGE_TYPE_OPTIONS: {
  value: ImageArchive['type'];
  label: string;
}[] = [
  { value: 'before_cleaning', label: '清洁前' },
  { value: 'after_cleaning', label: '清洁后' },
  { value: 'damage', label: '损伤记录' },
  { value: 'general', label: '档案照片' },
];

export const BORROW_STATUS_LABELS: Record<BorrowStatus, string> = {
  borrowed: '借出中',
  returned: '已归还',
  overdue: '已超期',
  pending_approval: '待审批',
  rejected: '已拒绝',
  renewal_pending: '续借待审批',
};

export const BORROW_STATUS_COLORS: Record<BorrowStatus, string> = {
  borrowed: 'blue',
  returned: 'green',
  overdue: 'red',
  pending_approval: 'yellow',
  rejected: 'gray',
  renewal_pending: 'orange',
};

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: '待审批',
  approved: '已批准',
  rejected: '已拒绝',
};

export const APPROVAL_STATUS_COLORS: Record<ApprovalStatus, string> = {
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
};

export const PRIORITY_LABELS: Record<BorrowPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

export const PRIORITY_COLORS: Record<BorrowPriority, string> = {
  low: 'gray',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
};

export const PENALTY_TYPE_LABELS: Record<PenaltyType, string> = {
  overdue_fee: '逾期费用',
  damage_compensation: '损坏赔偿',
  rule_violation: '违规处罚',
};

export const RENEWAL_STATUS_LABELS: Record<RenewalStatus, string> = {
  pending: '待审批',
  approved: '已批准',
  rejected: '已拒绝',
};

export const RENEWAL_STATUS_COLORS: Record<RenewalStatus, string> = {
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
};

export const CONDITION_LABELS: Record<string, string> = {
  excellent: '优秀',
  good: '良好',
  fair: '一般',
  poor: '较差',
};

export const CONDITION_COLORS: Record<string, string> = {
  excellent: 'green',
  good: 'blue',
  fair: 'yellow',
  poor: 'red',
};

export const CREDIT_LEVEL_LABELS: Record<string, string> = {
  excellent: '优秀',
  good: '良好',
  fair: '一般',
  poor: '较差',
};

export const CREDIT_LEVEL_COLORS: Record<string, string> = {
  excellent: 'green',
  good: 'blue',
  fair: 'yellow',
  poor: 'red',
};

export const BORROW_FILTER_OPTIONS = [
  { value: 'available', label: '可借用' },
  { value: 'borrowed', label: '已借出' },
  { value: 'overdue', label: '已超期' },
];

export const DEPARTMENT_OPTIONS = [
  '生物学实验室',
  '医学实验室',
  '材料科学实验室',
  '化学实验室',
  '物理学实验室',
  '教学实验室',
  '其他',
];
