import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TabType, Notification } from '../types';

interface UiState {
  activeTab: TabType;
  selectedIds: string[];
  notification: Notification | null;
  modals: Record<string, boolean>;
  selectedObjectiveId: string | null;
  selectedBorrowRecordId: string | null;
  selectedApplicationId: string | null;
  drawerOpen: boolean;

  setActiveTab: (tab: TabType) => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSelectedId: (id: string) => void;
  clearSelectedIds: () => void;
  setNotification: (notification: Notification | null) => void;
  showNotification: (
    message: string,
    type: 'success' | 'error' | 'info',
    duration?: number
  ) => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;
  setSelectedObjectiveId: (id: string | null) => void;
  setSelectedBorrowRecordId: (id: string | null) => void;
  setSelectedApplicationId: (id: string | null) => void;
  setDrawerOpen: (open: boolean) => void;
  resetUi: () => void;
}

const initialState = {
  activeTab: 'inventory' as TabType,
  selectedIds: [],
  notification: null,
  modals: {},
  selectedObjectiveId: null,
  selectedBorrowRecordId: null,
  selectedApplicationId: null,
  drawerOpen: false,
};

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setActiveTab: (tab) => set({ activeTab: tab }),

      setSelectedIds: (ids) => set({ selectedIds: ids }),

      toggleSelectedId: (id) =>
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((i) => i !== id)
            : [...state.selectedIds, id],
        })),

      clearSelectedIds: () => set({ selectedIds: [] }),

      setNotification: (notification) => set({ notification }),

      showNotification: (message, type, duration = 3000) => {
        set({ notification: { message, type } });
        if (duration > 0) {
          setTimeout(() => {
            if (get().notification?.message === message) {
              set({ notification: null });
            }
          }, duration);
        }
      },

      openModal: (modalId) =>
        set((state) => ({
          modals: { ...state.modals, [modalId]: true },
        })),

      closeModal: (modalId) =>
        set((state) => ({
          modals: { ...state.modals, [modalId]: false },
        })),

      toggleModal: (modalId) =>
        set((state) => ({
          modals: { ...state.modals, [modalId]: !state.modals[modalId] },
        })),

      setSelectedObjectiveId: (id) => set({ selectedObjectiveId: id }),

      setSelectedBorrowRecordId: (id) => set({ selectedBorrowRecordId: id }),

      setSelectedApplicationId: (id) => set({ selectedApplicationId: id }),

      setDrawerOpen: (open) => set({ drawerOpen: open }),

      resetUi: () => set(initialState),
    }),
    {
      name: 'objective-ui-storage',
      partialize: (state) => ({
        activeTab: state.activeTab,
      }),
    }
  )
);

export const useActiveTab = () => useUiStore((state) => state.activeTab);
export const useSelectedIds = () => useUiStore((state) => state.selectedIds);
export const useNotification = () => useUiStore((state) => state.notification);
export const useModal = (modalId: string) =>
  useUiStore((state) => state.modals[modalId] ?? false);
export const useSelectedObjectiveId = () =>
  useUiStore((state) => state.selectedObjectiveId);
export const useSelectedBorrowRecordId = () =>
  useUiStore((state) => state.selectedBorrowRecordId);
export const useDrawerOpen = () => useUiStore((state) => state.drawerOpen);
