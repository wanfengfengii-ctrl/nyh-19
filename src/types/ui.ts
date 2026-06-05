export interface UiState {
  activeTab: string;
  selectedIds: string[];
  notification: {
    message: string;
    type: 'success' | 'error' | 'info';
  } | null;
  modals: Record<string, boolean>;
  selectedObjectiveId: string | null;
  selectedBorrowRecordId: string | null;
  selectedApplicationId: string | null;
  drawerOpen: boolean;
}

export interface ModalConfig {
  id: string;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  data?: unknown;
}
