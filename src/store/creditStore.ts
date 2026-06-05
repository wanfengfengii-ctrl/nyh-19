import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CreditProfile } from '../types';
import { filterCreditProfiles } from '../utils/filterUtils';
import { calculateCreditScore, getCreditLevel } from '../utils/statusUtils';
import { mockCreditProfiles } from '../utils/mockData';
import { useBorrowStore } from './borrowStore';
import { useFinanceStore } from './financeStore';

interface CreditState {
  profiles: CreditProfile[];

  getProfile: (borrowerName: string) => CreditProfile | undefined;
  updateProfile: (borrowerName: string) => void;
  getAllProfiles: () => CreditProfile[];
  getBorrowerRanking: () => CreditProfile[];
  filterProfiles: (
    search?: string,
    minScore?: number,
    maxScore?: number
  ) => CreditProfile[];

  resetToMockData: () => void;
}

export const useCreditStore = create<CreditState>()(
  persist(
    (set, get) => ({
      profiles: mockCreditProfiles,

      getProfile: (borrowerName) => {
        return get().profiles.find((p) => p.borrowerName === borrowerName);
      },

      updateProfile: (borrowerName) => {
        const borrowerRecords = useBorrowStore
          .getState()
          .borrowRecords.filter((r) => r.borrowerName === borrowerName);

        const totalBorrows = borrowerRecords.length;
        const onTimeReturns = borrowerRecords.filter((r) =>
          r.status === 'returned' &&
          r.actualReturnDate &&
          new Date(r.actualReturnDate) <= new Date(r.expectedReturnDate)
        ).length;
        const overdueRecords = borrowerRecords.filter((r) =>
          r.status === 'overdue' ||
          (r.status === 'returned' &&
            r.actualReturnDate &&
            new Date(r.actualReturnDate) > new Date(r.expectedReturnDate))
        );
        const overdueCount = overdueRecords.length;
        const totalOverdueDays = overdueRecords.reduce((sum, r) => {
          const end = r.actualReturnDate
            ? new Date(r.actualReturnDate)
            : new Date();
          const expected = new Date(r.expectedReturnDate);
          if (end > expected) {
            return (
              sum +
              Math.ceil(
                (end.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24)
              )
            );
          }
          return sum;
        }, 0);

        const borrowerPenalties = useFinanceStore
          .getState()
          .penaltyRecords.filter((r) => r.borrowerName === borrowerName);
        const penaltyCount = borrowerPenalties.length;
        const damageCount = borrowerPenalties.filter(
          (p) => p.type === 'damage_compensation'
        ).length;

        const creditScore = calculateCreditScore({
          totalBorrows,
          onTimeReturns,
          overdueCount,
          totalOverdueDays,
          damageCount,
          penaltyCount,
        });

        const creditLevel = getCreditLevel(creditScore);

        const existingProfile = get().profiles.find(
          (p) => p.borrowerName === borrowerName
        );

        if (existingProfile) {
          set((state) => ({
            profiles: state.profiles.map((p) =>
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
            profiles: [...state.profiles, newProfile],
          }));
        }
      },

      getAllProfiles: () => {
        return get().profiles.sort((a, b) => b.creditScore - a.creditScore);
      },

      getBorrowerRanking: () => {
        return get()
          .getAllProfiles()
          .sort((a, b) => b.creditScore - a.creditScore);
      },

      filterProfiles: (search, minScore, maxScore) => {
        return filterCreditProfiles(
          get().profiles,
          search,
          minScore,
          maxScore
        );
      },

      resetToMockData: () =>
        set({
          profiles: mockCreditProfiles,
        }),
    }),
    {
      name: 'objective-credit-storage',
    }
  )
);

export const useCreditProfiles = () =>
  useCreditStore((state) => state.profiles);
export const useCreditProfile = (borrowerName?: string) =>
  useCreditStore((state) =>
    borrowerName
      ? state.profiles.find((p) => p.borrowerName === borrowerName)
      : undefined
  );
