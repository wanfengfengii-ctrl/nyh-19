import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BorrowApplication,
  ApprovalFilterOptions,
} from '../types';
import { filterBorrowApplications } from '../utils/filterUtils';
import { mockBorrowApplications } from '../utils/mockData';
import { useUiStore } from './uiStore';
import { useInventoryStore } from './inventoryStore';
import { useBorrowStore } from './borrowStore';

interface ApprovalState {
  applications: BorrowApplication[];
  filters: ApprovalFilterOptions;

  submitApplication: (
    app: Omit<BorrowApplication, 'id' | 'status' | 'submittedAt'>
  ) => void;
  approveApplication: (
    id: string,
    approvedBy: string,
    notes?: string
  ) => void;
  rejectApplication: (id: string, rejectedBy: string, reason: string) => void;

  setFilters: (filters: Partial<ApprovalFilterOptions>) => void;
  resetFilters: () => void;

  getFilteredApplications: () => BorrowApplication[];
  getPendingApplications: () => BorrowApplication[];
  getApplicationsByBorrower: (name: string) => BorrowApplication[];
  getPendingApprovalCount: () => number;

  resetToMockData: () => void;
}

export const useApprovalStore = create<ApprovalState>()(
  persist(
    (set, get) => ({
      applications: mockBorrowApplications,
      filters: {},

      submitApplication: (app) => {
        const newApp: BorrowApplication = {
          ...app,
          id: `app-${Date.now()}`,
          status: 'pending',
          submittedAt: new Date().toISOString(),
        };
        set((state) => ({
          applications: [...state.applications, newApp],
        }));
        useInventoryStore
          .getState()
          .addOperationLog({
            type: 'update',
            objectiveId: app.objectiveId,
            description: `提交借用申请: ${app.borrowerName}`,
            operator: app.borrowerName,
          });
        useUiStore.getState().showNotification('借用申请已提交，等待审批', 'success');
      },

      approveApplication: (id, approvedBy, notes) => {
        const app = get().applications.find((a) => a.id === id);
        if (!app) return;

        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: 'approved',
                  approvedBy,
                  approvedAt: new Date().toISOString(),
                  approvalNotes: notes,
                  reviewedAt: new Date().toISOString(),
                }
              : a
          ),
        }));

        useBorrowStore.getState().addBorrowRecord({
          objectiveId: app.objectiveId,
          borrowerName: app.borrowerName,
          borrowerDepartment: app.borrowerDepartment,
          borrowerContact: app.borrowerContact,
          reason: app.reason,
          borrowDate: app.requestedBorrowDate,
          expectedReturnDate: app.requestedReturnDate,
          priority: app.priority as any,
          approvalStatus: 'approved',
          approvedBy,
          approvedAt: new Date().toISOString(),
        });

        useInventoryStore
          .getState()
          .addOperationLog({
            type: 'update',
            objectiveId: app.objectiveId,
            description: `批准借用申请: ${app.borrowerName}`,
            operator: approvedBy,
          });
        useUiStore.getState().showNotification('借用申请已批准', 'success');
      },

      rejectApplication: (id, rejectedBy, reason) => {
        const app = get().applications.find((a) => a.id === id);
        if (!app) return;

        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: 'rejected',
                  approvedBy: rejectedBy,
                  approvedAt: new Date().toISOString(),
                  rejectionReason: reason,
                  reviewedAt: new Date().toISOString(),
                }
              : a
          ),
        }));

        useInventoryStore
          .getState()
          .addOperationLog({
            type: 'update',
            objectiveId: app.objectiveId,
            description: `拒绝借用申请: ${app.borrowerName}, 原因: ${reason}`,
            operator: rejectedBy,
          });
        useUiStore.getState().showNotification('借用申请已拒绝', 'info');
      },

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      resetFilters: () => set({ filters: {} }),

      getFilteredApplications: () => {
        return filterBorrowApplications(
          get().applications,
          get().filters
        );
      },

      getPendingApplications: () => {
        return get()
          .applications.filter((a) => a.status === 'pending')
          .sort(
            (a, b) =>
              new Date(a.submittedAt).getTime() -
              new Date(b.submittedAt).getTime()
          );
      },

      getApplicationsByBorrower: (name) => {
        return get().applications.filter((a) => a.borrowerName === name);
      },

      getPendingApprovalCount: () => {
        return get().applications.filter((a) => a.status === 'pending')
          .length;
      },

      resetToMockData: () =>
        set({
          applications: mockBorrowApplications,
        }),
    }),
    {
      name: 'objective-approval-storage',
    }
  )
);

export const useApplications = () =>
  useApprovalStore((state) => state.applications);
export const useApprovalFilters = () =>
  useApprovalStore((state) => state.filters);
export const useApplicationById = (id?: string) =>
  useApprovalStore((state) =>
    id ? state.applications.find((a) => a.id === id) : undefined
  );
