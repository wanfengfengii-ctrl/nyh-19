export type ObjectiveStatus =
  | 'normal'
  | 'scratched'
  | 'moldy'
  | 'coating_damaged'
  | 'in_repair'
  | 'scrapped';

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
