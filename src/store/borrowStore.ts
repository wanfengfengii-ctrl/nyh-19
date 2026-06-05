import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BorrowRecord,
  RenewalRequest,
  StatusCheckItem,
  BorrowConflict,
  BorrowFilterOptions,
} from '../types';
import { DEFAULT_CHECKLIST } from '../types/constants';
import { filterBorrowRecords } from '../utils/filterUtils';
import { isDueSoon } from '../utils/dateUtils';
import { mockBorrowRecords, mockRenewalRequests } from '../utils/mockData';
import { useUiStore } from './uiStore';
import { useInventoryStore } from './inventoryStore';

interface BorrowState {
  borrowRecords: BorrowRecord[];
  renewalRequests: RenewalRequest[];
  filters: BorrowFilterOptions;

  addBorrowRecord: (
    record: Omit<BorrowRecord, 'id' | 'status' | 'createdAt'>
  ) => void;
  returnObjective: (
    borrowId: string,
    actualReturnDate: string,
    notes?: string
  ) => void;
  updateOverdueStatus: () => void;

  submitRenewalRequest: (
    request: Omit<RenewalRequest, 'id' | 'status' | 'submittedAt'>
  ) => void;
  approveRenewalRequest: (id: string, approvedBy: string) => void;
  rejectRenewalRequest: (id: string, rejectedBy: string, reason: string) => void;

  saveCheckOutChecklist: (
    borrowId: string,
    checklist: StatusCheckItem[]
  ) => void;
  saveCheckInChecklist: (
    borrowId: string,
    checklist: StatusCheckItem[]
  ) => void;
  generateDefaultChecklist: () => StatusCheckItem[];

  detectBorrowConflict: (
    objectiveId: string,
    startDate: string,
    endDate: string
  ) => BorrowConflict | null;
  batchDetectConflicts: (
    objectiveIds: string[],
    startDate: string,
    endDate: string
  ) => BorrowConflict[];

  batchSendReminders: (borrowIds: string[], message: string) => void;

  setFilters: (filters: Partial<BorrowFilterOptions>) => void;
  resetFilters: () => void;

  getFilteredRecords: () => BorrowRecord[];
  getBorrowRecordsByObjectiveId: (id: string) => BorrowRecord[];
  getCurrentBorrowRecord: (id: string) => BorrowRecord | undefined;
  isObjectiveAvailable: (id: string) => boolean;
  canBorrowObjective: (id: string) => { canBorrow: boolean; reason?: string };
  getOverdueRecords: () => BorrowRecord[];
  getBorrowedCount: () => number;
  getOverdueCount: () => number;
  getAvailableCount: () => number;
  getDueSoonRecords: (days?: number) => BorrowRecord[];
  getPendingRenewals: () => RenewalRequest[];
  getPendingRenewalCount: () => number;

  resetToMockData: () => void;
}

export const useBorrowStore = create<BorrowState>()(
  persist(
    (set, get) => ({
      borrowRecords: mockBorrowRecords,
      renewalRequests: mockRenewalRequests,
      filters: {},

      addBorrowRecord: (record) => {
        const { canBorrow, reason } = get().canBorrowObjective(
          record.objectiveId
        );
        if (!canBorrow) {
          useUiStore.getState().showNotification(reason || '无法借出', 'error');
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

        useInventoryStore
          .getState()
          .addOperationLog({
            type: 'update',
            objectiveId: record.objectiveId,
            description: `借出物镜: ${record.borrowerName} - ${record.reason}`,
            operator: '当前用户',
          });
        useUiStore.getState().showNotification('借出登记成功', 'success');
      },

      returnObjective: (borrowId, actualReturnDate, notes) => {
        const record = get().borrowRecords.find((r) => r.id === borrowId);
        if (!record) return;

        if (new Date(actualReturnDate) < new Date(record.borrowDate)) {
          useUiStore.getState().showNotification('归还日期不能早于借出日期', 'error');
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

        useInventoryStore
          .getState()
          .addOperationLog({
            type: 'update',
            objectiveId: record.objectiveId,
            description: '归还物镜',
            operator: '当前用户',
          });
        useUiStore.getState().showNotification('归还登记成功', 'success');
      },

      updateOverdueStatus: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        set((state) => ({
          borrowRecords: state.borrowRecords.map((r) => {
            if (
              r.status === 'borrowed' &&
              new Date(r.expectedReturnDate) < today
            ) {
              return { ...r, status: 'overdue' };
            }
            return r;
          }),
        }));
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
          borrowRecords: state.borrowRecords.map((r) =>
            r.id === request.borrowRecordId
              ? { ...r, status: 'renewal_pending' }
              : r
          ),
        }));

        useInventoryStore
          .getState()
          .addOperationLog({
            type: 'update',
            objectiveId: request.objectiveId,
            description: `提交续借申请: ${request.borrowerName}`,
            operator: request.borrowerName,
          });
        useUiStore.getState().showNotification('续借申请已提交', 'success');
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

        useInventoryStore
          .getState()
          .addOperationLog({
            type: 'update',
            objectiveId: request.objectiveId,
            description: `批准续借申请: ${request.borrowerName}`,
            operator: approvedBy,
          });
        useUiStore.getState().showNotification('续借申请已批准', 'success');
      },

      rejectRenewalRequest: (id, rejectedBy, reason) => {
        const request = get().renewalRequests.find((r) => r.id === id);
        if (!request) return;

        set((state) => ({
          renewalRequests: state.renewalRequests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'rejected',
                  approvedBy: rejectedBy,
                  approvedAt: new Date().toISOString(),
                  rejectionReason: reason,
                }
              : r
          ),
          borrowRecords: state.borrowRecords.map((r) =>
            r.id === request.borrowRecordId ? { ...r, status: 'borrowed' } : r
          ),
        }));

        useInventoryStore
          .getState()
          .addOperationLog({
            type: 'update',
            objectiveId: request.objectiveId,
            description: `拒绝续借申请: ${request.borrowerName}, 原因: ${reason}`,
            operator: rejectedBy,
          });
        useUiStore.getState().showNotification('续借申请已拒绝', 'info');
      },

      saveCheckOutChecklist: (borrowId, checklist) => {
        set((state) => ({
          borrowRecords: state.borrowRecords.map((r) =>
            r.id === borrowId ? { ...r, checkOutChecklist: checklist } : r
          ),
        }));
        useUiStore.getState().showNotification('借出验收清单已保存', 'success');
      },

      saveCheckInChecklist: (borrowId, checklist) => {
        set((state) => ({
          borrowRecords: state.borrowRecords.map((r) =>
            r.id === borrowId ? { ...r, checkInChecklist: checklist } : r
          ),
        }));
        useUiStore.getState().showNotification('归还验收清单已保存', 'success');
      },

      generateDefaultChecklist: () => {
        return DEFAULT_CHECKLIST.map((item) => ({ ...item }));
      },

      detectBorrowConflict: (objectiveId, startDate, endDate) => {
        const objective = useInventoryStore
          .getState()
          .objectives.find((o) => o.id === objectiveId);
        if (!objective) return null;

        const start = new Date(startDate);
        const end = new Date(endDate);

        const existingBorrows = get().borrowRecords.filter(
          (r) =>
            r.objectiveId === objectiveId &&
            (r.status === 'borrowed' || r.status === 'overdue')
        );

        for (const borrow of existingBorrows) {
          const borrowStart = new Date(borrow.borrowDate);
          const borrowEnd = new Date(borrow.expectedReturnDate);

          const overlapStart = start > borrowStart ? start : borrowStart;
          const overlapEnd = end < borrowEnd ? end : borrowEnd;

          if (overlapStart <= overlapEnd) {
            const overlapDays =
              Math.ceil(
                (overlapEnd.getTime() - overlapStart.getTime()) /
                  (1000 * 60 * 60 * 24)
              ) + 1;
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
            useInventoryStore
              .getState()
              .addOperationLog({
                type: 'update',
                objectiveId: record.objectiveId,
                description: `发送催还提醒: ${message}`,
                operator: '当前用户',
              });
          }
        });
        useUiStore
          .getState()
          .showNotification(
            `已向 ${borrowIds.length} 条记录发送催还提醒`,
            'success'
          );
      },

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      resetFilters: () => set({ filters: {} }),

      getFilteredRecords: () => {
        return filterBorrowRecords(get().borrowRecords, get().filters);
      },

      getBorrowRecordsByObjectiveId: (id) => {
        return get()
          .borrowRecords.filter((r) => r.objectiveId === id)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      },

      getCurrentBorrowRecord: (id) => {
        return get().borrowRecords.find(
          (r) =>
            r.objectiveId === id &&
            (r.status === 'borrowed' || r.status === 'overdue')
        );
      },

      isObjectiveAvailable: (id) => {
        const current = get().getCurrentBorrowRecord(id);
        return !current;
      },

      canBorrowObjective: (id) => {
        const obj = useInventoryStore.getState().objectives.find((o) => o.id === id);
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
            .borrowRecords.filter(
              (r) => r.status === 'borrowed' || r.status === 'overdue'
            )
            .map((r) => r.objectiveId)
        );
        return useInventoryStore
          .getState()
          .objectives.filter(
            (o) =>
              !borrowedIds.has(o.id) &&
              o.status !== 'scrapped' &&
              o.status !== 'in_repair'
          ).length;
      },

      getDueSoonRecords: (days = 3) => {
        return get().borrowRecords.filter((r) => {
          if (r.status !== 'borrowed') return false;
          return isDueSoon(r.expectedReturnDate, days);
        });
      },

      getPendingRenewals: () => {
        return get()
          .renewalRequests.filter((r) => r.status === 'pending')
          .sort(
            (a, b) =>
              new Date(a.submittedAt).getTime() -
              new Date(b.submittedAt).getTime()
          );
      },

      getPendingRenewalCount: () => {
        return get().renewalRequests.filter((r) => r.status === 'pending')
          .length;
      },

      resetToMockData: () =>
        set({
          borrowRecords: mockBorrowRecords,
          renewalRequests: mockRenewalRequests,
        }),
    }),
    {
      name: 'objective-borrow-storage',
    }
  )
);

export const useBorrowRecords = () =>
  useBorrowStore((state) => state.borrowRecords);
export const useRenewalRequests = () =>
  useBorrowStore((state) => state.renewalRequests);
export const useBorrowFilters = () =>
  useBorrowStore((state) => state.filters);
export const useBorrowRecordById = (id?: string) =>
  useBorrowStore((state) =>
    id ? state.borrowRecords.find((r) => r.id === id) : undefined
  );
