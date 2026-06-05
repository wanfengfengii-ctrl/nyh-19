import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Objective,
  MaintenanceRecord,
  FilterOptions,
  ImageArchive,
  RepairRecord,
  OperationLog,
  MaintenanceReminder,
  ScrappingRecord,
  ObjectiveFormData,
  BatchImportResult,
} from '../types';
import { mockObjectives, mockRecords, mockImages, mockRepairs, mockLogs, mockReminders } from '../utils/mockData';

interface ObjectiveStore {
  objectives: Objective[];
  records: MaintenanceRecord[];
  images: ImageArchive[];
  repairs: RepairRecord[];
  operationLogs: OperationLog[];
  reminders: MaintenanceReminder[];
  selectedObjective: Objective | null;
  selectedIds: string[];
  filters: FilterOptions;
  isObjectiveModalOpen: boolean;
  editingObjective: Objective | null;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;

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
      selectedObjective: null,
      selectedIds: [],
      filters: {},
      isObjectiveModalOpen: false,
      editingObjective: null,
      notification: null,

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
          get().updateObjective(id, {
            status: 'normal',
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
        data.forEach((item, index) => {
          if (!get().isSerialNumberUnique(item.serialNumber)) {
            result.failed++;
            result.errors.push(`第 ${index + 1} 行: 编号 ${item.serialNumber} 已存在`);
            return;
          }
          try {
            get().addObjective(item);
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
          details: result,
        });
        return result;
      },

      getFilteredObjectives: () => {
        const { objectives, filters } = get();
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
    }),
    {
      name: 'objective-storage',
    }
  )
);
