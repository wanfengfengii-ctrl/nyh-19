import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Objective,
  ObjectiveStatus,
  MaintenanceRecord,
  FilterOptions,
  ImageArchive,
  RepairRecord,
  OperationLog,
  MaintenanceReminder,
  ScrappingRecord,
  ObjectiveFormData,
  BatchImportResult,
  BorrowRecord,
  BorrowApplication,
  DepositRecord,
  PenaltyRecord,
  RenewalRequest,
  StatusCheckItem,
  CreditProfile,
  BorrowConflict,
  TabType,
} from '../types';
import { mockObjectives, mockRecords, mockImages, mockRepairs, mockLogs, mockReminders, mockBorrowRecords, mockBorrowApplications, mockDepositRecords, mockPenaltyRecords, mockRenewalRequests, mockCreditProfiles } from '../utils/mockData';
import { validateBatchImportItem } from '../utils/validation';

interface ObjectiveStore {
  objectives: Objective[];
  records: MaintenanceRecord[];
  images: ImageArchive[];
  repairs: RepairRecord[];
  operationLogs: OperationLog[];
  reminders: MaintenanceReminder[];
  borrowRecords: BorrowRecord[];
  borrowApplications: BorrowApplication[];
  depositRecords: DepositRecord[];
  penaltyRecords: PenaltyRecord[];
  renewalRequests: RenewalRequest[];
  creditProfiles: CreditProfile[];
  selectedObjective: Objective | null;
  selectedIds: string[];
  filters: FilterOptions;
  isObjectiveModalOpen: boolean;
  editingObjective: Objective | null;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  activeTab: TabType;
  isApprovalModalOpen: boolean;
  isDepositModalOpen: boolean;
  isPenaltyModalOpen: boolean;
  isRenewalModalOpen: boolean;
  isChecklistModalOpen: boolean;
  isReportModalOpen: boolean;
  isCreditModalOpen: boolean;
  selectedBorrowRecord: BorrowRecord | null;
  selectedApplication: BorrowApplication | null;

  addObjective: (obj: Omit<Objective, 'id' | 'createdAt' | 'damages'>) => void;
  updateObjective: (id: string, data: Partial<Objective>) => void;
  deleteObjective: (id: string) => void;
  addRecord: (record: Omit<MaintenanceRecord, 'id' | 'createdAt'>) => void;
  addImage: (image: Omit<ImageArchive, 'id' | 'uploadedAt'>) => void;
  addRepair: (repair: Omit<RepairRecord, 'id' | 'createdAt'>) => void;
  updateRepair: (id: string, data: Partial<RepairRecord>) => void;
  scrapObjective: (id: string, reason: string, approvedBy: string) => void;
  restoreObjective: (id: string, restoredBy: string) => void;
  addOperationLog: (log: Omit<OperationLog, 'id' | 'timestamp'>) => void;
  setSelectedObjective: (obj: Objective | null) => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSelectedId: (id: string) => void;
  clearSelectedIds: () => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  setObjectiveModalOpen: (open: boolean) => void;
  setEditingObjective: (obj: Objective | null) => void;
  setNotification: (notification: { message: string; type: 'success' | 'error' | 'info' } | null) => void;
  acknowledgeReminder: (id: string) => void;
  resetFilters: () => void;
  resetToMockData: () => void;

  batchScrap: (ids: string[], reason: string, approvedBy: string) => void;
  batchRestore: (ids: string[], restoredBy: string) => void;
  batchExport: (ids: string[]) => string;
  batchImport: (data: ObjectiveFormData[]) => BatchImportResult;

  getFilteredObjectives: () => Objective[];
  getRecordsByObjectiveId: (id: string) => MaintenanceRecord[];
  getImagesByObjectiveId: (id: string) => ImageArchive[];
  getRepairsByObjectiveId: (id: string) => RepairRecord[];
  getLogsByObjectiveId: (id: string) => OperationLog[];
  getActiveReminders: () => MaintenanceReminder[];
  isSerialNumberUnique: (sn: string, excludeId?: string) => boolean;
  getUniqueBrands: () => string[];
  getUniqueMagnifications: () => number[];
  getScoreTrend: (id: string) => { date: string; score: number }[];

  addBorrowRecord: (record: Omit<BorrowRecord, 'id' | 'status' | 'createdAt'>) => void;
  returnObjective: (borrowId: string, actualReturnDate: string, notes?: string) => void;
  getBorrowRecordsByObjectiveId: (id: string) => BorrowRecord[];
  getCurrentBorrowRecord: (id: string) => BorrowRecord | undefined;
  isObjectiveAvailable: (id: string) => boolean;
  canBorrowObjective: (id: string) => { canBorrow: boolean; reason?: string };
  updateOverdueStatus: () => void;
  getOverdueRecords: () => BorrowRecord[];
  getBorrowedCount: () => number;
  getOverdueCount: () => number;
  getAvailableCount: () => number;

  setActiveTab: (tab: 'inventory' | 'borrow' | 'approval' | 'deposit' | 'penalty' | 'report' | 'credit') => void;
  setSelectedBorrowRecord: (record: BorrowRecord | null) => void;
  setSelectedApplication: (app: BorrowApplication | null) => void;
  setApprovalModalOpen: (open: boolean) => void;
  setDepositModalOpen: (open: boolean) => void;
  setPenaltyModalOpen: (open: boolean) => void;
  setRenewalModalOpen: (open: boolean) => void;
  setChecklistModalOpen: (open: boolean) => void;
  setReportModalOpen: (open: boolean) => void;
  setCreditModalOpen: (open: boolean) => void;

  submitBorrowApplication: (app: Omit<BorrowApplication, 'id' | 'status' | 'submittedAt'>) => void;
  approveBorrowApplication: (id: string, approvedBy: string, notes?: string) => void;
  rejectBorrowApplication: (id: string, rejectedBy: string, reason: string) => void;
  getPendingApplications: () => BorrowApplication[];
  getApplicationsByBorrower: (name: string) => BorrowApplication[];

  addDepositRecord: (record: Omit<DepositRecord, 'id' | 'returned'>) => void;
  returnDeposit: (id: string, notes?: string) => void;
  getDepositRecordsByBorrowId: (borrowId: string) => DepositRecord[];
  getUnreturnedDeposits: () => DepositRecord[];

  addPenaltyRecord: (record: Omit<PenaltyRecord, 'id' | 'paid' | 'issuedAt'>) => void;
  markPenaltyPaid: (id: string) => void;
  getPenaltiesByBorrowId: (borrowId: string) => PenaltyRecord[];
  getUnpaidPenalties: () => PenaltyRecord[];
  calculateOverduePenalty: (borrowId: string, dailyRate?: number) => number;

  submitRenewalRequest: (request: Omit<RenewalRequest, 'id' | 'status' | 'submittedAt'>) => void;
  approveRenewalRequest: (id: string, approvedBy: string) => void;
  rejectRenewalRequest: (id: string, rejectedBy: string, reason: string) => void;
  getPendingRenewals: () => RenewalRequest[];

  saveCheckOutChecklist: (borrowId: string, checklist: StatusCheckItem[]) => void;
  saveCheckInChecklist: (borrowId: string, checklist: StatusCheckItem[]) => void;
  generateDefaultChecklist: () => StatusCheckItem[];

  detectBorrowConflict: (objectiveId: string, startDate: string, endDate: string) => BorrowConflict | null;
  batchDetectConflicts: (objectiveIds: string[], startDate: string, endDate: string) => BorrowConflict[];

  batchSendReminders: (borrowIds: string[], message: string) => void;
  getDueSoonRecords: (days?: number) => BorrowRecord[];

  exportBorrowReport: (filters?: { startDate?: string; endDate?: string; status?: string }) => string;
  generateBorrowStatistics: (startDate?: string, endDate?: string) => Record<string, unknown>;

  getCreditProfile: (borrowerName: string) => CreditProfile | undefined;
  updateCreditProfile: (borrowerName: string) => void;
  getAllCreditProfiles: () => CreditProfile[];
  getBorrowerRanking: () => CreditProfile[];

  getPendingApprovalCount: () => number;
  getUnpaidPenaltyCount: () => number;
  getPendingRenewalCount: () => number;
}

export const useObjectiveStore = create<ObjectiveStore>()(
  persist(
    (set, get) => ({
      objectives: mockObjectives,
      records: mockRecords,
      images: mockImages,
      repairs: mockRepairs,
      operationLogs: mockLogs,
      reminders: mockReminders,
      borrowRecords: mockBorrowRecords,
      borrowApplications: mockBorrowApplications,
      depositRecords: mockDepositRecords,
      penaltyRecords: mockPenaltyRecords,
      renewalRequests: mockRenewalRequests,
      creditProfiles: mockCreditProfiles,
      selectedObjective: null,
      selectedIds: [],
      filters: {},
      isObjectiveModalOpen: false,
      editingObjective: null,
      notification: null,
      activeTab: 'inventory',
      isApprovalModalOpen: false,
      isDepositModalOpen: false,
      isPenaltyModalOpen: false,
      isRenewalModalOpen: false,
      isChecklistModalOpen: false,
      isReportModalOpen: false,
      isCreditModalOpen: false,
      selectedBorrowRecord: null,
      selectedApplication: null,

      addObjective: (obj) => {
        const newObj = {
          ...obj,
          id: `obj-${Date.now()}`,
          damages: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          objectives: [...state.objectives, newObj],
        }));
        get().addOperationLog({
          type: 'create',
          objectiveId: newObj.id,
          description: `新增物镜: ${obj.serialNumber}`,
          operator: '当前用户',
        });
      },

      updateObjective: (id, data) => {
        const oldObj = get().objectives.find((o) => o.id === id);
        set((state) => ({
          objectives: state.objectives.map((o) =>
            o.id === id ? { ...o, ...data } : o
          ),
          selectedObjective:
            state.selectedObjective?.id === id
              ? { ...state.selectedObjective, ...data }
              : state.selectedObjective,
        }));
        get().addOperationLog({
          type: 'update',
          objectiveId: id,
          description: `更新物镜信息: ${oldObj?.serialNumber || id}`,
          operator: '当前用户',
        });
      },

      deleteObjective: (id) => {
        const obj = get().objectives.find((o) => o.id === id);
        set((state) => ({
          objectives: state.objectives.filter((o) => o.id !== id),
          records: state.records.filter((r) => r.objectiveId !== id),
          images: state.images.filter((i) => i.objectiveId !== id),
          repairs: state.repairs.filter((r) => r.objectiveId !== id),
          selectedObjective:
            state.selectedObjective?.id === id ? null : state.selectedObjective,
          selectedIds: state.selectedIds.filter((i) => i !== id),
        }));
        get().addOperationLog({
          type: 'delete',
          objectiveId: id,
          description: `删除物镜: ${obj?.serialNumber || id}`,
          operator: '当前用户',
        });
      },

      addRecord: (record) => {
        const newRecord = {
          ...record,
          id: `rec-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          records: [...state.records, newRecord],
        }));

        const obj = get().objectives.find((o) => o.id === record.objectiveId);
        if (obj && record.damages?.length) {
          const existingDamageTypes = new Set(obj.damages.map((d) => d.type));
          const newDamages = [...obj.damages];
          
          record.damages.forEach((damage) => {
            if (!existingDamageTypes.has(damage.type)) {
              newDamages.push(damage);
              existingDamageTypes.add(damage.type);
            }
          });

          let newStatus = obj.status;
          const damageTypes = new Set(newDamages.map((d) => d.type));
          if (damageTypes.has('coating')) {
            newStatus = 'coating_damaged';
          } else if (damageTypes.has('scratch')) {
            newStatus = 'scratched';
          } else if (damageTypes.has('mold')) {
            newStatus = 'moldy';
          } else {
            newStatus = 'normal';
          }

          get().updateObjective(record.objectiveId, {
            damages: newDamages,
            status: obj.status === 'scrapped' ? 'scrapped' : newStatus,
          });
        }

        get().addOperationLog({
          type: 'add_record',
          objectiveId: record.objectiveId,
          description: `添加保养记录，评分: ${record.clarityScore}`,
          operator: '当前用户',
        });
      },

      addImage: (image) => {
        const newImage = {
          ...image,
          id: `img-${Date.now()}`,
          uploadedAt: new Date().toISOString(),
        };
        set((state) => ({
          images: [...state.images, newImage],
        }));
        get().addOperationLog({
          type: 'add_image',
          objectiveId: image.objectiveId,
          description: `上传图片: ${image.description}`,
          operator: image.uploadedBy,
        });
      },

      addRepair: (repair) => {
        const newRepair = {
          ...repair,
          id: `repair-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          repairs: [...state.repairs, newRepair],
        }));
      },

      updateRepair: (id, data) => {
        set((state) => ({
          repairs: state.repairs.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        }));
      },

      scrapObjective: (id, reason, approvedBy) => {
        const scrappingRecord: ScrappingRecord = {
          id: `scrap-${Date.now()}`,
          objectiveId: id,
          reason,
          approvedBy,
          approvedAt: new Date().toISOString(),
        };
        get().updateObjective(id, {
          status: 'scrapped',
          scrappingRecord,
        });
        get().addOperationLog({
          type: 'scrap',
          objectiveId: id,
          description: `报废物镜，原因: ${reason}`,
          operator: approvedBy,
        });
      },

      restoreObjective: (id, restoredBy) => {
        const obj = get().objectives.find((o) => o.id === id);
        if (obj?.scrappingRecord) {
          let newStatus: ObjectiveStatus = 'normal';
          const damageTypes = new Set(obj.damages.map((d) => d.type));
          if (damageTypes.has('coating')) {
            newStatus = 'coating_damaged';
          } else if (damageTypes.has('scratch')) {
            newStatus = 'scratched';
          } else if (damageTypes.has('mold')) {
            newStatus = 'moldy';
          }

          get().updateObjective(id, {
            status: newStatus,
            scrappingRecord: {
              ...obj.scrappingRecord,
              restoredAt: new Date().toISOString(),
              restoredBy,
            },
          });
          get().addOperationLog({
            type: 'restore',
            objectiveId: id,
            description: '恢复已报废物镜',
            operator: restoredBy,
          });
        }
      },

      addOperationLog: (log) => {
        set((state) => ({
          operationLogs: [
            {
              ...log,
              id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: new Date().toISOString(),
            },
            ...state.operationLogs,
          ].slice(0, 500),
        }));
      },

      setSelectedObjective: (obj) => set({ selectedObjective: obj }),
      setSelectedIds: (ids) => set({ selectedIds: ids }),
      toggleSelectedId: (id) =>
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((i) => i !== id)
            : [...state.selectedIds, id],
        })),
      clearSelectedIds: () => set({ selectedIds: [] }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      setObjectiveModalOpen: (open) => set({ isObjectiveModalOpen: open }),
      setEditingObjective: (obj) => set({ editingObjective: obj }),
      setNotification: (notification) => set({ notification }),

      acknowledgeReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, acknowledged: true } : r
          ),
        })),

      resetFilters: () => set({ filters: {} }),

      resetToMockData: () =>
        set({
          objectives: mockObjectives,
          records: mockRecords,
          images: mockImages,
          repairs: mockRepairs,
          operationLogs: mockLogs,
          reminders: mockReminders,
          borrowRecords: mockBorrowRecords,
          borrowApplications: mockBorrowApplications,
          depositRecords: mockDepositRecords,
          penaltyRecords: mockPenaltyRecords,
          renewalRequests: mockRenewalRequests,
          creditProfiles: mockCreditProfiles,
          selectedIds: [],
        }),

      batchScrap: (ids, reason, approvedBy) => {
        ids.forEach((id) => get().scrapObjective(id, reason, approvedBy));
        get().addOperationLog({
          type: 'scrap',
          description: `批量报废 ${ids.length} 个物镜`,
          operator: approvedBy,
          details: { count: ids.length },
        });
      },

      batchRestore: (ids, restoredBy) => {
        ids.forEach((id) => get().restoreObjective(id, restoredBy));
        get().addOperationLog({
          type: 'restore',
          description: `批量恢复 ${ids.length} 个物镜`,
          operator: restoredBy,
          details: { count: ids.length },
        });
      },

      batchExport: (ids) => {
        const objs = get().objectives.filter((o) => ids.includes(o.id));
        get().addOperationLog({
          type: 'batch_export',
          description: `导出 ${objs.length} 个物镜数据`,
          operator: '当前用户',
          details: { count: objs.length },
        });
        return JSON.stringify(objs, null, 2);
      },

      batchImport: (data) => {
        const result: BatchImportResult = {
          success: 0,
          failed: 0,
          errors: [],
        };

        const seenSerialNumbers = new Set<string>();
        const existingSerialNumbers = new Set(
          get().objectives.map((o) => o.serialNumber)
        );

        data.forEach((item, index) => {
          const validation = validateBatchImportItem(item, index);
          if (!validation.valid) {
            result.failed++;
            result.errors.push(...validation.errors);
            return;
          }

          if (seenSerialNumbers.has(item.serialNumber)) {
            result.failed++;
            result.errors.push(`第 ${index + 1} 行: 编号 ${item.serialNumber} 在导入数据中重复`);
            return;
          }

          if (existingSerialNumbers.has(item.serialNumber)) {
            result.failed++;
            result.errors.push(`第 ${index + 1} 行: 编号 ${item.serialNumber} 已存在`);
            return;
          }

          try {
            get().addObjective(item);
            seenSerialNumbers.add(item.serialNumber);
            existingSerialNumbers.add(item.serialNumber);
            result.success++;
          } catch (e) {
            result.failed++;
            result.errors.push(`第 ${index + 1} 行: 导入失败`);
          }
        });

        get().addOperationLog({
          type: 'batch_import',
          description: `批量导入: 成功 ${result.success} 条，失败 ${result.failed} 条`,
          operator: '当前用户',
          details: result as unknown as Record<string, unknown>,
        });
        return result;
      },

      getFilteredObjectives: () => {
        const { objectives, filters, getCurrentBorrowRecord } = get();
        return objectives.filter((obj) => {
          if (filters.status && obj.status !== filters.status) return false;
          if (filters.brand && obj.brand !== filters.brand) return false;
          if (
            filters.magnification &&
            obj.magnification !== filters.magnification
          )
            return false;
          if (
            filters.coatingStatus &&
            obj.coatingStatus !== filters.coatingStatus
          )
            return false;
          if (filters.hasMold && !obj.damages.some((d) => d.type === 'mold'))
            return false;
          if (filters.hasScratch && !obj.damages.some((d) => d.type === 'scratch'))
            return false;
          if (filters.hasCoatingDamage && !obj.damages.some((d) => d.type === 'coating'))
            return false;
          if (filters.damageTypes?.length) {
            const hasDamage = filters.damageTypes.some((type) =>
              obj.damages.some((d) => d.type === type)
            );
            if (!hasDamage) return false;
          }
          if (filters.borrowStatus) {
            const currentBorrow = getCurrentBorrowRecord(obj.id);
            if (filters.borrowStatus === 'available' && currentBorrow) {
              return false;
            }
            if (filters.borrowStatus === 'borrowed' && (!currentBorrow || currentBorrow.status === 'overdue')) {
              return false;
            }
            if (filters.borrowStatus === 'overdue' && (!currentBorrow || currentBorrow.status !== 'overdue')) {
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
      },

      getRecordsByObjectiveId: (id) => {
        return get()
          .records.filter((r) => r.objectiveId === id)
          .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());
      },

      getImagesByObjectiveId: (id) => {
        return get()
          .images.filter((i) => i.objectiveId === id)
          .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      },

      getRepairsByObjectiveId: (id) => {
        return get()
          .repairs.filter((r) => r.objectiveId === id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getLogsByObjectiveId: (id) => {
        return get().operationLogs.filter((l) => l.objectiveId === id);
      },

      getActiveReminders: () => {
        return get()
          .reminders.filter((r) => !r.acknowledged)
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      },

      isSerialNumberUnique: (sn, excludeId) => {
        const { objectives } = get();
        return !objectives.some(
          (o) => o.serialNumber === sn && o.id !== excludeId
        );
      },

      getUniqueBrands: () => {
        const brands = new Set(get().objectives.map((o) => o.brand));
        return Array.from(brands).sort();
      },

      getUniqueMagnifications: () => {
        const mags = new Set(get().objectives.map((o) => o.magnification));
        return Array.from(mags).sort((a, b) => a - b);
      },

      getScoreTrend: (id) => {
        return get()
          .getRecordsByObjectiveId(id)
          .slice()
          .reverse()
          .map((r) => ({
            date: r.testDate,
            score: r.clarityScore,
          }));
      },

      addBorrowRecord: (record) => {
        const { canBorrow, reason } = get().canBorrowObjective(record.objectiveId);
        if (!canBorrow) {
          get().setNotification({
            message: reason || '无法借出',
            type: 'error',
          });
          return;
        }

        const newRecord: BorrowRecord = {
          ...record,
          id: `borrow-${Date.now()}`,
          status: 'borrowed',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          borrowRecords: [...state.borrowRecords, newRecord],
        }));
        get().addOperationLog({
          type: 'update',
          objectiveId: record.objectiveId,
          description: `借出物镜: ${record.borrowerName} - ${record.reason}`,
          operator: '当前用户',
        });
        get().setNotification({
          message: '借出登记成功',
          type: 'success',
        });
      },

      returnObjective: (borrowId, actualReturnDate, notes) => {
        const record = get().borrowRecords.find((r) => r.id === borrowId);
        if (!record) return;

        if (new Date(actualReturnDate) < new Date(record.borrowDate)) {
          get().setNotification({
            message: '归还日期不能早于借出日期',
            type: 'error',
          });
          return;
        }

        set((state) => ({
          borrowRecords: state.borrowRecords.map((r) =>
            r.id === borrowId
              ? {
                  ...r,
                  status: 'returned',
                  actualReturnDate,
                  notes: notes || r.notes,
                }
              : r
          ),
        }));
        get().addOperationLog({
          type: 'update',
          objectiveId: record.objectiveId,
          description: `归还物镜`,
          operator: '当前用户',
        });
        get().setNotification({
          message: '归还登记成功',
          type: 'success',
        });
      },

      getBorrowRecordsByObjectiveId: (id) => {
        return get()
          .borrowRecords.filter((r) => r.objectiveId === id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getCurrentBorrowRecord: (id) => {
        return get().borrowRecords.find(
          (r) => r.objectiveId === id && (r.status === 'borrowed' || r.status === 'overdue')
        );
      },

      isObjectiveAvailable: (id) => {
        const current = get().getCurrentBorrowRecord(id);
        return !current;
      },

      canBorrowObjective: (id) => {
        const obj = get().objectives.find((o) => o.id === id);
        if (!obj) {
          return { canBorrow: false, reason: '物镜不存在' };
        }
        if (obj.status === 'scrapped') {
          return { canBorrow: false, reason: '已报废物镜不能借出' };
        }
        if (obj.status === 'in_repair') {
          return { canBorrow: false, reason: '维修中物镜不能借出' };
        }
        if (!get().isObjectiveAvailable(id)) {
          return { canBorrow: false, reason: '物镜未归还，不能重复借出' };
        }
        return { canBorrow: true };
      },

      updateOverdueStatus: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        set((state) => ({
          borrowRecords: state.borrowRecords.map((r) => {
            if (r.status === 'borrowed' && new Date(r.expectedReturnDate) < today) {
              return { ...r, status: 'overdue' };
            }
            return r;
          }),
        }));
      },

      getOverdueRecords: () => {
        get().updateOverdueStatus();
        return get().borrowRecords.filter((r) => r.status === 'overdue');
      },

      getBorrowedCount: () => {
        return get().borrowRecords.filter(
          (r) => r.status === 'borrowed' || r.status === 'overdue'
        ).length;
      },

      getOverdueCount: () => {
        return get().getOverdueRecords().length;
      },

      getAvailableCount: () => {
        const borrowedIds = new Set(
          get()
            .borrowRecords.filter((r) => r.status === 'borrowed' || r.status === 'overdue')
            .map((r) => r.objectiveId)
        );
        return get().objectives.filter(
          (o) =>
            !borrowedIds.has(o.id) && o.status !== 'scrapped' && o.status !== 'in_repair'
        ).length;
      },

      setActiveTab: (tab) => set({ activeTab: tab }),
      setSelectedBorrowRecord: (record) => set({ selectedBorrowRecord: record }),
      setSelectedApplication: (app) => set({ selectedApplication: app }),
      setApprovalModalOpen: (open) => set({ isApprovalModalOpen: open }),
      setDepositModalOpen: (open) => set({ isDepositModalOpen: open }),
      setPenaltyModalOpen: (open) => set({ isPenaltyModalOpen: open }),
      setRenewalModalOpen: (open) => set({ isRenewalModalOpen: open }),
      setChecklistModalOpen: (open) => set({ isChecklistModalOpen: open }),
      setReportModalOpen: (open) => set({ isReportModalOpen: open }),
      setCreditModalOpen: (open) => set({ isCreditModalOpen: open }),

      submitBorrowApplication: (app) => {
        const newApp: BorrowApplication = {
          ...app,
          id: `app-${Date.now()}`,
          status: 'pending',
          submittedAt: new Date().toISOString(),
        };
        set((state) => ({
          borrowApplications: [...state.borrowApplications, newApp],
        }));
        get().addOperationLog({
          type: 'update',
          objectiveId: app.objectiveId,
          description: `提交借用申请: ${app.borrowerName}`,
          operator: app.borrowerName,
        });
        get().setNotification({
          message: '借用申请已提交，等待审批',
          type: 'success',
        });
      },

      approveBorrowApplication: (id, approvedBy, notes) => {
        const app = get().borrowApplications.find((a) => a.id === id);
        if (!app) return;

        set((state) => ({
          borrowApplications: state.borrowApplications.map((a) =>
            a.id === id
              ? { ...a, status: 'approved', approvedBy, approvedAt: new Date().toISOString(), approvalNotes: notes, reviewedAt: new Date().toISOString() }
              : a
          ),
        }));

        const newBorrowRecord: BorrowRecord = {
          id: `borrow-${Date.now()}`,
          objectiveId: app.objectiveId,
          borrowerName: app.borrowerName,
          borrowerDepartment: app.borrowerDepartment,
          borrowerContact: app.borrowerContact,
          reason: app.reason,
          borrowDate: app.requestedBorrowDate,
          expectedReturnDate: app.requestedReturnDate,
          status: 'borrowed',
          priority: app.priority as BorrowRecord['priority'],
          approvalStatus: 'approved',
          approvedBy,
          approvedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          renewalCount: 0,
          hasPenalty: false,
        };
        set((state) => ({
          borrowRecords: [...state.borrowRecords, newBorrowRecord],
        }));

        get().addOperationLog({
          type: 'update',
          objectiveId: app.objectiveId,
          description: `批准借用申请: ${app.borrowerName}`,
          operator: approvedBy,
        });
        get().setNotification({
          message: '借用申请已批准',
          type: 'success',
        });
      },

      rejectBorrowApplication: (id, rejectedBy, reason) => {
        const app = get().borrowApplications.find((a) => a.id === id);
        if (!app) return;

        set((state) => ({
          borrowApplications: state.borrowApplications.map((a) =>
            a.id === id
              ? { ...a, status: 'rejected', approvedBy: rejectedBy, approvedAt: new Date().toISOString(), rejectionReason: reason, reviewedAt: new Date().toISOString() }
              : a
          ),
        }));

        get().addOperationLog({
          type: 'update',
          objectiveId: app.objectiveId,
          description: `拒绝借用申请: ${app.borrowerName}, 原因: ${reason}`,
          operator: rejectedBy,
        });
        get().setNotification({
          message: '借用申请已拒绝',
          type: 'info',
        });
      },

      getPendingApplications: () => {
        return get()
          .borrowApplications.filter((a) => a.status === 'pending')
          .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
      },

      getApplicationsByBorrower: (name) => {
        return get().borrowApplications.filter((a) => a.borrowerName === name);
      },

      addDepositRecord: (record) => {
        const newRecord: DepositRecord = {
          ...record,
          id: `deposit-${Date.now()}`,
          returned: false,
        };
        set((state) => ({
          depositRecords: [...state.depositRecords, newRecord],
        }));
        set((state) => ({
          borrowRecords: state.borrowRecords.map((r) =>
            r.id === record.borrowRecordId
              ? { ...r, depositAmount: record.amount, depositReturned: false }
              : r
          ),
        }));
        get().addOperationLog({
          type: 'update',
          objectiveId: record.objectiveId,
          description: `收取押金: ¥${record.amount}`,
          operator: '当前用户',
        });
        get().setNotification({
          message: '押金登记成功',
          type: 'success',
        });
      },

      returnDeposit: (id, notes) => {
        const record = get().depositRecords.find((r) => r.id === id);
        if (!record) return;

        set((state) => ({
          depositRecords: state.depositRecords.map((r) =>
            r.id === id
              ? { ...r, returned: true, returnedAt: new Date().toISOString(), notes: notes || r.notes }
              : r
          ),
        }));
        set((state) => ({
          borrowRecords: state.borrowRecords.map((r) =>
            r.id === record.borrowRecordId
              ? { ...r, depositReturned: true, depositReturnedAt: new Date().toISOString() }
              : r
          ),
        }));
        get().addOperationLog({
          type: 'update',
          objectiveId: record.objectiveId,
          description: `退还押金: ¥${record.amount}`,
          operator: '当前用户',
        });
        get().setNotification({
          message: '押金退还成功',
          type: 'success',
        });
      },

      getDepositRecordsByBorrowId: (borrowId) => {
        return get().depositRecords.filter((r) => r.borrowRecordId === borrowId);
      },

      getUnreturnedDeposits: () => {
        return get().depositRecords.filter((r) => !r.returned);
      },

      addPenaltyRecord: (record) => {
        const newRecord: PenaltyRecord = {
          ...record,
          id: `penalty-${Date.now()}`,
          paid: false,
          issuedAt: new Date().toISOString(),
        };
        set((state) => ({
          penaltyRecords: [...state.penaltyRecords, newRecord],
        }));
        set((state) => ({
          borrowRecords: state.borrowRecords.map((r) =>
            r.id === record.borrowRecordId
              ? { ...r, hasPenalty: true }
              : r
          ),
        }));
        get().addOperationLog({
          type: 'update',
          objectiveId: record.objectiveId,
          description: `开具处罚: ¥${record.amount}, ${record.reason}`,
          operator: record.issuedBy,
        });
        get().setNotification({
          message: '处罚记录已添加',
          type: 'info',
        });
      },

      markPenaltyPaid: (id) => {
        set((state) => ({
          penaltyRecords: state.penaltyRecords.map((r) =>
            r.id === id
              ? { ...r, paid: true, paidAt: new Date().toISOString() }
              : r
          ),
        }));
        get().setNotification({
          message: '罚款已确认缴纳',
          type: 'success',
        });
      },

      getPenaltiesByBorrowId: (borrowId) => {
        return get().penaltyRecords.filter((r) => r.borrowRecordId === borrowId);
      },

      getUnpaidPenalties: () => {
        return get().penaltyRecords.filter((r) => !r.paid);
      },

      calculateOverduePenalty: (borrowId, dailyRate = 10) => {
        const record = get().borrowRecords.find((r) => r.id === borrowId);
        if (!record || record.status !== 'overdue') return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expectedReturn = new Date(record.expectedReturnDate);
        expectedReturn.setHours(0, 0, 0, 0);
        const overdueDays = Math.ceil((today.getTime() - expectedReturn.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, overdueDays) * dailyRate;
      },

      submitRenewalRequest: (request) => {
        const newRequest: RenewalRequest = {
          ...request,
          id: `renewal-${Date.now()}`,
          status: 'pending',
          submittedAt: new Date().toISOString(),
        };
        set((state) => ({
          renewalRequests: [...state.renewalRequests, newRequest],
        }));
        set((state) => ({
          borrowRecords: state.borrowRecords.map((r) =>
            r.id === request.borrowRecordId
              ? { ...r, status: 'renewal_pending' }
              : r
          ),
        }));
        get().addOperationLog({
          type: 'update',
          objectiveId: request.objectiveId,
          description: `提交续借申请: ${request.borrowerName}`,
          operator: request.borrowerName,
        });
        get().setNotification({
          message: '续借申请已提交',
          type: 'success',
        });
      },

      approveRenewalRequest: (id, approvedBy) => {
        const request = get().renewalRequests.find((r) => r.id === id);
        if (!request) return;

        set((state) => ({
          renewalRequests: state.renewalRequests.map((r) =>
            r.id === id
              ? { ...r, status: 'approved', approvedBy, approvedAt: new Date().toISOString() }
              : r
          ),
        }));

        set((state) => ({
          borrowRecords: state.borrowRecords.map((r) =>
            r.id === request.borrowRecordId
              ? {
                  ...r,
                  expectedReturnDate: request.requestedReturnDate,
                  status: 'borrowed',
                  renewalCount: (r.renewalCount || 0) + 1,
                }
              : r
          ),
        }));

        get().addOperationLog({
          type: 'update',
          objectiveId: request.objectiveId,
          description: `批准续借申请: ${request.borrowerName}`,
          operator: approvedBy,
        });
        get().setNotification({
          message: '续借申请已批准',
          type: 'success',
        });
      },

      rejectRenewalRequest: (id, rejectedBy, reason) => {
        const request = get().renewalRequests.find((r) => r.id === id);
        if (!request) return;

        set((state) => ({
          renewalRequests: state.renewalRequests.map((r) =>
            r.id === id
              ? { ...r, status: 'rejected', approvedBy: rejectedBy, approvedAt: new Date().toISOString(), rejectionReason: reason }
              : r
          ),
        }));
        set((state) => ({
          borrowRecords: state.borrowRecords.map((r) =>
            r.id === request.borrowRecordId
              ? { ...r, status: 'borrowed' }
              : r
          ),
        }));
        get().addOperationLog({
          type: 'update',
          objectiveId: request.objectiveId,
          description: `拒绝续借申请: ${request.borrowerName}, 原因: ${reason}`,
          operator: rejectedBy,
        });
        get().setNotification({
          message: '续借申请已拒绝',
          type: 'info',
        });
      },

      getPendingRenewals: () => {
        return get()
          .renewalRequests.filter((r) => r.status === 'pending')
          .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
      },

      saveCheckOutChecklist: (borrowId, checklist) => {
        set((state) => ({
          borrowRecords: state.borrowRecords.map((r) =>
            r.id === borrowId
              ? { ...r, checkOutChecklist: checklist }
              : r
          ),
        }));
        get().setNotification({
          message: '借出验收清单已保存',
          type: 'success',
        });
      },

      saveCheckInChecklist: (borrowId, checklist) => {
        set((state) => ({
          borrowRecords: state.borrowRecords.map((r) =>
            r.id === borrowId
              ? { ...r, checkInChecklist: checklist }
              : r
          ),
        }));
        get().setNotification({
          message: '归还验收清单已保存',
          type: 'success',
        });
      },

      generateDefaultChecklist: () => {
        return [
          { id: '1', category: '外观检查', item: '镜身无明显划痕', checked: false, condition: 'excellent' as const },
          { id: '2', category: '外观检查', item: '接口螺纹完好', checked: false, condition: 'excellent' as const },
          { id: '3', category: '光学检查', item: '前镜片无霉斑', checked: false, condition: 'excellent' as const },
          { id: '4', category: '光学检查', item: '后镜片无划痕', checked: false, condition: 'excellent' as const },
          { id: '5', category: '光学检查', item: '镀膜完好无剥落', checked: false, condition: 'excellent' as const },
          { id: '6', category: '机械检查', item: '调节环转动顺畅', checked: false, condition: 'excellent' as const },
          { id: '7', category: '附件检查', item: '镜头盖齐全', checked: false, condition: 'excellent' as const },
          { id: '8', category: '附件检查', item: '包装盒完好', checked: false, condition: 'excellent' as const },
        ];
      },

      detectBorrowConflict: (objectiveId, startDate, endDate) => {
        const objective = get().objectives.find((o) => o.id === objectiveId);
        if (!objective) return null;

        const start = new Date(startDate);
        const end = new Date(endDate);

        const existingBorrows = get().borrowRecords.filter(
          (r) => r.objectiveId === objectiveId && (r.status === 'borrowed' || r.status === 'overdue')
        );

        for (const borrow of existingBorrows) {
          const borrowStart = new Date(borrow.borrowDate);
          const borrowEnd = new Date(borrow.expectedReturnDate);

          const overlapStart = start > borrowStart ? start : borrowStart;
          const overlapEnd = end < borrowEnd ? end : borrowEnd;

          if (overlapStart <= overlapEnd) {
            const overlapDays = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            return {
              objectiveId,
              objectiveSerialNumber: objective.serialNumber,
              existingBorrow: {
                id: borrow.id,
                borrowerName: borrow.borrowerName,
                borrowDate: borrow.borrowDate,
                expectedReturnDate: borrow.expectedReturnDate,
              },
              requestedBorrow: {
                borrowerName: '申请人',
                requestedBorrowDate: startDate,
                requestedReturnDate: endDate,
              },
              overlapDays,
            };
          }
        }
        return null;
      },

      batchDetectConflicts: (objectiveIds, startDate, endDate) => {
        const conflicts: BorrowConflict[] = [];
        objectiveIds.forEach((id) => {
          const conflict = get().detectBorrowConflict(id, startDate, endDate);
          if (conflict) conflicts.push(conflict);
        });
        return conflicts;
      },

      batchSendReminders: (borrowIds, message) => {
        borrowIds.forEach((id) => {
          const record = get().borrowRecords.find((r) => r.id === id);
          if (record) {
            get().addOperationLog({
              type: 'update',
              objectiveId: record.objectiveId,
              description: `发送催还提醒: ${message}`,
              operator: '当前用户',
            });
          }
        });
        get().setNotification({
          message: `已向 ${borrowIds.length} 条记录发送催还提醒`,
          type: 'success',
        });
      },

      getDueSoonRecords: (days = 3) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(today);
        dueDate.setDate(dueDate.getDate() + days);

        return get().borrowRecords.filter((r) => {
          if (r.status !== 'borrowed') return false;
          const expectedReturn = new Date(r.expectedReturnDate);
          expectedReturn.setHours(0, 0, 0, 0);
          return expectedReturn >= today && expectedReturn <= dueDate;
        });
      },

      exportBorrowReport: (filters) => {
        let records = [...get().borrowRecords];
        
        if (filters?.startDate) {
          records = records.filter((r) => new Date(r.borrowDate) >= new Date(filters.startDate!));
        }
        if (filters?.endDate) {
          records = records.filter((r) => new Date(r.borrowDate) <= new Date(filters.endDate!));
        }
        if (filters?.status) {
          records = records.filter((r) => r.status === filters.status);
        }

        get().addOperationLog({
          type: 'batch_export',
          description: `导出借用报表: ${records.length} 条记录`,
          operator: '当前用户',
          details: { count: records.length },
        });

        return JSON.stringify(records, null, 2);
      },

      generateBorrowStatistics: (startDate, endDate) => {
        let records = [...get().borrowRecords];
        
        if (startDate) {
          records = records.filter((r) => new Date(r.borrowDate) >= new Date(startDate));
        }
        if (endDate) {
          records = records.filter((r) => new Date(r.borrowDate) <= new Date(endDate));
        }

        const totalBorrows = records.length;
        const returnedCount = records.filter((r) => r.status === 'returned').length;
        const overdueCount = records.filter((r) => r.status === 'overdue' || (r.status === 'returned' && r.actualReturnDate && new Date(r.actualReturnDate) > new Date(r.expectedReturnDate))).length;
        const averageBorrowDays = records.reduce((sum, r) => {
          const end = r.actualReturnDate ? new Date(r.actualReturnDate) : new Date();
          const start = new Date(r.borrowDate);
          return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / Math.max(1, totalBorrows);

        const departmentStats: Record<string, number> = {};
        records.forEach((r) => {
          departmentStats[r.borrowerDepartment] = (departmentStats[r.borrowerDepartment] || 0) + 1;
        });

        return {
          totalBorrows,
          returnedCount,
          overdueCount,
          overdueRate: totalBorrows > 0 ? (overdueCount / totalBorrows * 100).toFixed(1) + '%' : '0%',
          averageBorrowDays: averageBorrowDays.toFixed(1) + ' 天',
          departmentStats,
        };
      },

      getCreditProfile: (borrowerName) => {
        return get().creditProfiles.find((p) => p.borrowerName === borrowerName);
      },

      updateCreditProfile: (borrowerName) => {
        const borrowerRecords = get().borrowRecords.filter((r) => r.borrowerName === borrowerName);
        
        const totalBorrows = borrowerRecords.length;
        const onTimeReturns = borrowerRecords.filter((r) => 
          r.status === 'returned' && r.actualReturnDate && new Date(r.actualReturnDate) <= new Date(r.expectedReturnDate)
        ).length;
        const overdueRecords = borrowerRecords.filter((r) => 
          r.status === 'overdue' || (r.status === 'returned' && r.actualReturnDate && new Date(r.actualReturnDate) > new Date(r.expectedReturnDate))
        );
        const overdueCount = overdueRecords.length;
        const totalOverdueDays = overdueRecords.reduce((sum, r) => {
          const end = r.actualReturnDate ? new Date(r.actualReturnDate) : new Date();
          const expected = new Date(r.expectedReturnDate);
          if (end > expected) {
            return sum + Math.ceil((end.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24));
          }
          return sum;
        }, 0);
        
        const borrowerPenalties = get().penaltyRecords.filter((r) => r.borrowerName === borrowerName);
        const penaltyCount = borrowerPenalties.length;
        const damageCount = borrowerPenalties.filter((p) => p.type === 'damage_compensation').length;

        let creditScore = 100;
        creditScore -= overdueCount * 10;
        creditScore -= Math.min(totalOverdueDays * 2, 30);
        creditScore -= penaltyCount * 15;
        creditScore -= damageCount * 20;
        creditScore = Math.max(0, Math.min(100, creditScore));

        let creditLevel: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
        if (creditScore >= 85) creditLevel = 'excellent';
        else if (creditScore >= 70) creditLevel = 'good';
        else if (creditScore >= 50) creditLevel = 'fair';

        const existingProfile = get().creditProfiles.find((p) => p.borrowerName === borrowerName);
        
        if (existingProfile) {
          set((state) => ({
            creditProfiles: state.creditProfiles.map((p) =>
              p.borrowerName === borrowerName
                ? {
                    ...p,
                    totalBorrows,
                    onTimeReturns,
                    overdueCount,
                    totalOverdueDays,
                    damageCount,
                    penaltyCount,
                    creditScore,
                    creditLevel,
                    lastUpdated: new Date().toISOString(),
                  }
                : p
            ),
          }));
        } else {
          const newProfile: CreditProfile = {
            id: `credit-${Date.now()}`,
            borrowerName,
            totalBorrows,
            onTimeReturns,
            overdueCount,
            totalOverdueDays,
            damageCount,
            penaltyCount,
            creditScore,
            creditLevel,
            lastUpdated: new Date().toISOString(),
          };
          set((state) => ({
            creditProfiles: [...state.creditProfiles, newProfile],
          }));
        }
      },

      getAllCreditProfiles: () => {
        return get().creditProfiles.sort((a, b) => b.creditScore - a.creditScore);
      },

      getBorrowerRanking: () => {
        return get()
          .getAllCreditProfiles()
          .sort((a, b) => b.creditScore - a.creditScore);
      },

      getPendingApprovalCount: () => {
        return get().borrowApplications.filter((a) => a.status === 'pending').length;
      },

      getUnpaidPenaltyCount: () => {
        return get().penaltyRecords.filter((p) => !p.paid).length;
      },

      getPendingRenewalCount: () => {
        return get().renewalRequests.filter((r) => r.status === 'pending').length;
      },
    }),
    {
      name: 'objective-storage',
    }
  )
);
