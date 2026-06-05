import {
  Table,
  ScrollArea,
  Text,
  Group,
  Pagination,
  Box,
} from '@mantine/core';
import type { TableColumn, SortConfig } from '../../types';

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  sortConfig?: SortConfig<T>;
  onSort?: (key: keyof T) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  rowClassName?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = '暂无数据',
  sortConfig,
  onSort,
  pagination,
  onRowClick,
}: DataTableProps<T>) {
  const handleSort = (key: keyof T) => {
    if (onSort) {
      onSort(key);
    }
  };

  return (
    <Box>
      <ScrollArea>
        <Table>
          <Table.Thead>
            <Table.Tr>
              {columns.map((col) => (
                <Table.Th
                  key={String(col.key)}
                  style={{
                    width: col.width,
                    textAlign: col.align || 'left',
                    cursor: col.sortable ? 'pointer' : 'default',
                  }}
                  onClick={() => col.sortable && handleSort(col.key as keyof T)}
                >
                  <Group gap={4}>
                    {col.title}
                    {sortConfig && sortConfig.key === col.key && (
                      <Text size="xs">{sortConfig.direction === 'asc' ? '↑' : '↓'}</Text>
                    )}
                  </Group>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <Table.Tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col) => (
                    <Table.Td
                      key={String(col.key)}
                      style={{ textAlign: col.align || 'left' }}
                    >
                      {col.render
                        ? col.render(item)
                        : String(
                            (item as Record<string, unknown>)[col.key as string] ??
                              ''
                          )}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={columns.length} align="center" py="xl">
                  <Text c="dimmed">{emptyMessage}</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {pagination && pagination.total > 0 && (
        <Group justify="center" mt="md">
          <Pagination
            value={pagination.page}
            onChange={pagination.onPageChange}
            total={Math.ceil(pagination.total / pagination.pageSize)}
          />
        </Group>
      )}
    </Box>
  );
}
