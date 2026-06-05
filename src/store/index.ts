export * from './uiStore';
export * from './inventoryStore';
export * from './borrowStore';
export * from './approvalStore';
export * from './financeStore';
export * from './creditStore';

export function resetAllStoresToMockData(): void {
  import('./inventoryStore').then((m) => m.useInventoryStore.getState().resetToMockData());
  import('./borrowStore').then((m) => m.useBorrowStore.getState().resetToMockData());
  import('./approvalStore').then((m) => m.useApprovalStore.getState().resetToMockData());
  import('./financeStore').then((m) => m.useFinanceStore.getState().resetToMockData());
  import('./creditStore').then((m) => m.useCreditStore.getState().resetToMockData());
  import('./uiStore').then((m) => m.useUiStore.getState().resetUi());
}
