import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DepositRecord,
  PenaltyRecord,
  FinanceFilterOptions,
} from '../types';
import { filterFinanceRecords } from '../utils/filterUtils';
import { mockDepositRecords, mockPenaltyRecords } from '../utils/mockData';
import { useUiStore } from './uiStore';
import { useInventoryStore } from './inventoryStore';
import { useBorrowStore } from './borrowStore';

interface FinanceState {
  depositRecords: DepositRecord[];
  penaltyRecords: PenaltyRecord[];
  filters: FinanceFilterOptions;

  addDepositRecord: (
    record: Omit<DepositRecord, 'id' | 'returned'>
  ) => void;
  returnDeposit: (id: string, notes?: string) => void;

  addPenaltyRecord: (
    record: Omit<PenaltyRecord, 'id' | 'paid' | 'issuedAt'>
  ) => void;
  markPenaltyPaid: (id: string) => void;

  calculateOverduePenalty: (
    borrowId: string,
    dailyRate?: number
  ) => number;

  setFilters: (filters: Partial<FinanceFilterOptions>) => void;
  resetFilters: () => void;

  getFilteredRecords: () => {
    deposits: DepositRecord[];
    penalties: PenaltyRecord[];
  };
  getDepositRecordsByBorrowId: (borrowId: string) => DepositRecord[];
  getPenaltiesByBorrowId: (borrowId: string) => PenaltyRecord[];
  getUnreturnedDeposits: () => DepositRecord[];
  getUnpaidPenalties: () => PenaltyRecord[];
  getUnpaidPenaltyCount: () => number;

  resetToMockData: () => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      depositRecords: mockDepositRecords,
      penaltyRecords: mockPenaltyRecords,
      filters: {},

      addDepositRecord: (record) => {
        const newRecord: DepositRecord = {
          ...record,
          id: `deposit-${Date.now()}`,
          returned: false,
        };
        set((state) => ({
          depositRecords: [...state.depositRecords, newRecord],
        }));

        useBorrowStore.setState((state) => ({
          borrowRecords: state.borrowRecords.map((r) =>
            r.id === record.borrowRecordId
              ? { ...r, depositAmount: record.amount, depositReturned: false }
              : r
          ),
        }));

        useInventoryStore
          .getState()
          .addOperationLog({
            type: 'update',
            objectiveId: record.objectiveId,
            description: `收取押金: ¥${record.amount}`,
            operator: '当前用户',
          });
        useUiStore.getState().showNotification('押金登记成功', 'success');
      },

      returnDeposit: (id, notes) => {
        const record = get().depositRecords.find((r) => r.id === id);
        if (!record) return;

        set((state) => ({
          depositRecords: state.depositRecords.map((r) =>
            r.id === id
              ? {
                  ...r,
                  returned: true,
                  returnedAt: new Date().toISOString(),
                  notes: notes || r.notes,
                }
              : r
          ),
        }));

        useBorrowStore.setState((state) => ({
          borrowRecords: state.borrowRecords.map((r) =>
            r.id === record.borrowRecordId
              ? {
                  ...r,
                  depositReturned: true,
                  depositReturnedAt: new Date().toISOString(),
                }
              : r
          ),
        }));

        useInventoryStore
          .getState()
          .addOperationLog({
            type: 'update',
            objectiveId: record.objectiveId,
            description: `退还押金: ¥${record.amount}`,
            operator: '当前用户',
          });
        useUiStore.getState().showNotification('押金退还成功', 'success');
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

        useBorrowStore.setState((state) => ({
          borrowRecords: state.borrowRecords.map((r) =>
            r.id === record.borrowRecordId ? { ...r, hasPenalty: true } : r
          ),
        }));

        useInventoryStore
          .getState()
          .addOperationLog({
            type: 'update',
            objectiveId: record.objectiveId,
            description: `开具处罚: ¥${record.amount}, ${record.reason}`,
            operator: record.issuedBy,
          });
        useUiStore.getState().showNotification('处罚记录已添加', 'info');
      },

      markPenaltyPaid: (id) => {
        set((state) => ({
          penaltyRecords: state.penaltyRecords.map((r) =>
            r.id === id
              ? { ...r, paid: true, paidAt: new Date().toISOString() }
              : r
          ),
        }));
        useUiStore.getState().showNotification('罚款已确认缴纳', 'success');
      },

      calculateOverduePenalty: (borrowId, dailyRate = 10) => {
        const record = useBorrowStore
          .getState()
          .borrowRecords.find((r) => r.id === borrowId);
        if (!record || record.status !== 'overdue') return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expectedReturn = new Date(record.expectedReturnDate);
        expectedReturn.setHours(0, 0, 0, 0);
        const overdueDays = Math.ceil(
          (today.getTime() - expectedReturn.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return Math.max(0, overdueDays) * dailyRate;
      },

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      resetFilters: () => set({ filters: {} }),

      getFilteredRecords: () => {
        return filterFinanceRecords(
          get().depositRecords,
          get().penaltyRecords,
          get().filters
        );
      },

      getDepositRecordsByBorrowId: (borrowId) => {
        return get().depositRecords.filter((r) => r.borrowRecordId === borrowId);
      },

      getPenaltiesByBorrowId: (borrowId) => {
        return get().penaltyRecords.filter((r) => r.borrowRecordId === borrowId);
      },

      getUnreturnedDeposits: () => {
        return get().depositRecords.filter((r) => !r.returned);
      },

      getUnpaidPenalties: () => {
        return get().penaltyRecords.filter((r) => !r.paid);
      },

      getUnpaidPenaltyCount: () => {
        return get().penaltyRecords.filter((r) => !r.paid).length;
      },

      resetToMockData: () =>
        set({
          depositRecords: mockDepositRecords,
          penaltyRecords: mockPenaltyRecords,
        }),
    }),
    {
      name: 'objective-finance-storage',
    }
  )
);

export const useDepositRecords = () =>
  useFinanceStore((state) => state.depositRecords);
export const usePenaltyRecords = () =>
  useFinanceStore((state) => state.penaltyRecords);
export const useFinanceFilters = () =>
  useFinanceStore((state) => state.filters);
