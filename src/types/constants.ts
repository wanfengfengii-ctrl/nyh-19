import type {
  ObjectiveStatus,
  DamageType,
  RepairStatus,
  BorrowStatus,
  ApprovalStatus,
  BorrowPriority,
  PenaltyType,
  RenewalStatus,
  CreditLevel,
} from './index';

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
  value: string;
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

export const CREDIT_LEVEL_LABELS: Record<CreditLevel, string> = {
  excellent: '优秀',
  good: '良好',
  fair: '一般',
  poor: '较差',
};

export const CREDIT_LEVEL_COLORS: Record<CreditLevel, string> = {
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

export const DEFAULT_CHECKLIST = [
  {
    id: '1',
    category: '外观检查',
    item: '镜身无明显划痕',
    checked: false,
    condition: 'excellent' as const,
  },
  {
    id: '2',
    category: '外观检查',
    item: '接口螺纹完好',
    checked: false,
    condition: 'excellent' as const,
  },
  {
    id: '3',
    category: '光学检查',
    item: '前镜片无霉斑',
    checked: false,
    condition: 'excellent' as const,
  },
  {
    id: '4',
    category: '光学检查',
    item: '后镜片无划痕',
    checked: false,
    condition: 'excellent' as const,
  },
  {
    id: '5',
    category: '光学检查',
    item: '镀膜完好无剥落',
    checked: false,
    condition: 'excellent' as const,
  },
  {
    id: '6',
    category: '机械检查',
    item: '调节环转动顺畅',
    checked: false,
    condition: 'excellent' as const,
  },
  {
    id: '7',
    category: '附件检查',
    item: '镜头盖齐全',
    checked: false,
    condition: 'excellent' as const,
  },
  {
    id: '8',
    category: '附件检查',
    item: '包装盒完好',
    checked: false,
    condition: 'excellent' as const,
  },
];

export const TAB_LABELS: Record<string, string> = {
  inventory: '物镜管理',
  borrow: '借用记录',
  approval: '借用审批',
  deposit: '押金费用',
  penalty: '逾期处罚',
  renewal: '续借审批',
  checklist: '验收清单',
  report: '报表导出',
  credit: '信用画像',
};
