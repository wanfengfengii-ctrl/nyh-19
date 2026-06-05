import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Objective, MaintenanceRecord, FilterOptions } from '../types';
import { mockObjectives, mockRecords } from '../utils/mockData';

interface ObjectiveStore {
  objectives: Objective[];
  records: MaintenanceRecord[];
  selectedObjective: Objective | null;
  filters: FilterOptions;
  isObjectiveModalOpen: boolean;
  editingObjective: Objective | null;

  addObjective: (obj: Omit<Objective, 'id' | 'createdAt'>) => void;
  updateObjective: (id: string, data: Partial<Objective>) => void;
  deleteObjective: (id: string) => void;
  addRecord: (record: Omit<MaintenanceRecord, 'id' | 'createdAt'>) => void;
  setSelectedObjective: (obj: Objective | null) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  setObjectiveModalOpen: (open: boolean) => void;
  setEditingObjective: (obj: Objective | null) => void;
  resetFilters: () => void;
  resetToMockData: () => void;

  getFilteredObjectives: () => Objective[];
  getRecordsByObjectiveId: (id: string) => MaintenanceRecord[];
  isSerialNumberUnique: (sn: string, excludeId?: string) => boolean;
  getUniqueBrands: () => string[];
  getUniqueMagnifications: () => number[];
}

export const useObjectiveStore = create<ObjectiveStore>()(
  persist(
    (set, get) => ({
      objectives: mockObjectives,
      records: mockRecords,
      selectedObjective: null,
      filters: {},
      isObjectiveModalOpen: false,
      editingObjective: null,

      addObjective: (obj) =>
        set((state) => ({
          objectives: [
            ...state.objectives,
            {
              ...obj,
              id: `obj-${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateObjective: (id, data) =>
        set((state) => ({
          objectives: state.objectives.map((o) =>
            o.id === id ? { ...o, ...data } : o
          ),
          selectedObjective:
            state.selectedObjective?.id === id
              ? { ...state.selectedObjective, ...data }
              : state.selectedObjective,
        })),

      deleteObjective: (id) =>
        set((state) => ({
          objectives: state.objectives.filter((o) => o.id !== id),
          records: state.records.filter((r) => r.objectiveId !== id),
          selectedObjective:
            state.selectedObjective?.id === id ? null : state.selectedObjective,
        })),

      addRecord: (record) =>
        set((state) => ({
          records: [
            ...state.records,
            {
              ...record,
              id: `rec-${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      setSelectedObjective: (obj) => set({ selectedObjective: obj }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      setObjectiveModalOpen: (open) => set({ isObjectiveModalOpen: open }),

      setEditingObjective: (obj) => set({ editingObjective: obj }),

      resetFilters: () => set({ filters: {} }),

      resetToMockData: () =>
        set({
          objectives: mockObjectives,
          records: mockRecords,
        }),

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

      getUniqueCoatingStatuses: () => {
        const statuses = new Set(get().objectives.map((o) => o.coatingStatus));
        return Array.from(statuses).sort();
      },

      getRecordsByObjectiveId: (id) => {
        return get()
          .records.filter((r) => r.objectiveId === id)
          .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());
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
    }),
    {
      name: 'objective-storage',
    }
  )
);
