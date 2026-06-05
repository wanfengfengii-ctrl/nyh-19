export type ObjectiveStatus = 'normal' | 'scratched' | 'moldy' | 'scrapped';

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
  createdAt: string;
}

export interface MaintenanceRecord {
  id: string;
  objectiveId: string;
  testDate: string;
  clarityScore: number;
  hasMold: boolean;
  hasScratch: boolean;
  treatmentAdvice: string;
  createdAt: string;
}

export interface FilterOptions {
  status?: ObjectiveStatus;
  brand?: string;
  magnification?: number;
  search?: string;
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
  treatmentAdvice: string;
}

export const STATUS_LABELS: Record<ObjectiveStatus, string> = {
  normal: '完好',
  scratched: '有划痕',
  moldy: '有霉斑',
  scrapped: '已报废',
};

export const STATUS_COLORS: Record<ObjectiveStatus, string> = {
  normal: 'green',
  scratched: 'orange',
  moldy: 'yellow',
  scrapped: 'red',
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

export const COATING_OPTIONS = ['原厂镀膜完好', '轻微老化', '镀膜损伤', '无镀膜', '已重新镀膜'];
