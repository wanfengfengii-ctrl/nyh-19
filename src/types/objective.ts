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
  details?: Record<string, unknown>;
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
