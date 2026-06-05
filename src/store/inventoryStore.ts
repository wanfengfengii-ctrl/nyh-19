import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Objective,
  MaintenanceRecord,
  ImageArchive,
  RepairRecord,
  OperationLog,
  MaintenanceReminder,
  FilterOptions,
  ObjectiveFormData,
  BatchImportResult,
} from '../types';
import { filterObjectives } from '../utils/filterUtils';
import { determineObjectiveStatus } from '../utils/statusUtils';
import { validateBatchImportItem } from '../utils/validation';
import {
  mockObjectives,
  mockRecords,
  mockImages,
  mockRepairs,
  mockLogs,
  mockReminders,
} from '../utils/mockData';
import { useUiStore } from './uiStore';

interface InventoryState {
  objectives: Objective[];
  records: MaintenanceRecord[];
  images: ImageArchive[];
  repairs: RepairRecord[];
  operationLogs: OperationLog[];
  reminders: MaintenanceReminder[];
  filters: FilterOptions;

  addObjective: (obj: Omit<Objective, 'id' | 'createdAt' | 'damages'>) => void;
  updateObjective: (id: string, data: Partial<Objective>) => void;
  deleteObjective: (id: string) => void;
  addRecord: (record: Omit<MaintenanceRecord, 'id' | 'createdAt'>) => void;
  addImage: (image: Omit<ImageArchive, 'id' | 'uploadedAt'>) => void;
  addRepair: (repair: Omit<RepairRecord, 'id' | 'createdAt'>) => void;
  updateRepair: (id: string, data: Partial<RepairRecord>) => void;
  scrapObjective: (id: string, reason: string, approvedBy: string) => void;
  restoreObjective: (id: string, restoredBy: string) => void;
  acknowledgeReminder: (id: string) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  resetFilters: () => void;

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

  addOperationLog: (log: Omit<OperationLog, 'id' | 'timestamp'>) => void;
  resetToMockData: () => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      objectives: mockObjectives,
      records: mockRecords,
      images: mockImages,
      repairs: mockRepairs,
      operationLogs: mockLogs,
      reminders: mockReminders,
      filters: {},

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

      addObjective: (obj) => {
        const newObj: Objective = {
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
        useUiStore.getState().showNotification('物镜添加成功', 'success');
      },

      updateObjective: (id, data) => {
        const oldObj = get().objectives.find((o) => o.id === id);
        set((state) => ({
          objectives: state.objectives.map((o) =>
            o.id === id ? { ...o, ...data } : o
          ),
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
        }));
        get().addOperationLog({
          type: 'delete',
          objectiveId: id,
          description: `删除物镜: ${obj?.serialNumber || id}`,
          operator: '当前用户',
        });
        useUiStore.getState().showNotification('物镜已删除', 'info');
      },

      addRecord: (record) => {
        const newRecord: MaintenanceRecord = {
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

          const newStatus = determineObjectiveStatus(newDamages, obj.status);

          get().updateObjective(record.objectiveId, {
            damages: newDamages,
            status: newStatus,
          });
        }

        get().addOperationLog({
          type: 'add_record',
          objectiveId: record.objectiveId,
          description: `添加保养记录，评分: ${record.clarityScore}`,
          operator: '当前用户',
        });
        useUiStore.getState().showNotification('保养记录已添加', 'success');
      },

      addImage: (image) => {
        const newImage: ImageArchive = {
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
        const newRepair: RepairRecord = {
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
        get().updateObjective(id, {
          status: 'scrapped',
          scrappingRecord: {
            id: `scrap-${Date.now()}`,
            objectiveId: id,
            reason,
            approvedBy,
            approvedAt: new Date().toISOString(),
          },
        });
        get().addOperationLog({
          type: 'scrap',
          objectiveId: id,
          description: `报废物镜，原因: ${reason}`,
          operator: approvedBy,
        });
        useUiStore.getState().showNotification('物镜已报废', 'info');
      },

      restoreObjective: (id, restoredBy) => {
        const obj = get().objectives.find((o) => o.id === id);
        if (obj?.scrappingRecord) {
          const newStatus = determineObjectiveStatus(obj.damages);
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
          useUiStore.getState().showNotification('物镜已恢复', 'success');
        }
      },

      acknowledgeReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, acknowledged: true } : r
          ),
        })),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      resetFilters: () => set({ filters: {} }),

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
            result.errors.push(
              `第 ${index + 1} 行: 编号 ${item.serialNumber} 在导入数据中重复`
            );
            return;
          }

          if (existingSerialNumbers.has(item.serialNumber)) {
            result.failed++;
            result.errors.push(
              `第 ${index + 1} 行: 编号 ${item.serialNumber} 已存在`
            );
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
        return filterObjectives(get().objectives, get().filters);
      },

      getRecordsByObjectiveId: (id) => {
        return get()
          .records.filter((r) => r.objectiveId === id)
          .sort(
            (a, b) =>
              new Date(b.testDate).getTime() - new Date(a.testDate).getTime()
          );
      },

      getImagesByObjectiveId: (id) => {
        return get()
          .images.filter((i) => i.objectiveId === id)
          .sort(
            (a, b) =>
              new Date(b.uploadedAt).getTime() -
              new Date(a.uploadedAt).getTime()
          );
      },

      getRepairsByObjectiveId: (id) => {
        return get()
          .repairs.filter((r) => r.objectiveId === id)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          );
      },

      getLogsByObjectiveId: (id) => {
        return get().operationLogs.filter((l) => l.objectiveId === id);
      },

      getActiveReminders: () => {
        return get()
          .reminders.filter((r) => !r.acknowledged)
          .sort(
            (a, b) =>
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          );
      },

      isSerialNumberUnique: (sn, excludeId) => {
        const { objectives } = get();
        return !objectives.some((o) => o.serialNumber === sn && o.id !== excludeId);
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

      resetToMockData: () =>
        set({
          objectives: mockObjectives,
          records: mockRecords,
          images: mockImages,
          repairs: mockRepairs,
          operationLogs: mockLogs,
          reminders: mockReminders,
        }),
    }),
    {
      name: 'objective-inventory-storage',
    }
  )
);

export const useObjectives = () => useInventoryStore((state) => state.objectives);
export const useFilters = () => useInventoryStore((state) => state.filters);
export const useObjectiveById = (id?: string) =>
  useInventoryStore((state) =>
    id ? state.objectives.find((o) => o.id === id) : undefined
  );
