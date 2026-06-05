export interface SortConfig<T> {
  key: keyof T;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface DateRange {
  start: string;
  end: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface Notification {
  id?: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export type ModalType =
  | 'objective'
  | 'borrow'
  | 'deposit'
  | 'penalty'
  | 'renewal'
  | 'checklist'
  | 'report'
  | 'credit';

export type TabType =
  | 'inventory'
  | 'borrowRecords'
  | 'borrow'
  | 'approval'
  | 'deposit'
  | 'penalty'
  | 'renewal'
  | 'checklist'
  | 'report'
  | 'credit';
