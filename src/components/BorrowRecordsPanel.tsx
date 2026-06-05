import { useState, useMemo } from 'react';
import {
  Paper,
  Title,
  Badge,
  Group,
  Text,
  Stack,
  Avatar,
  Select,
} from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { useBorrowStore, useBorrowRecords } from '../store/borrowStore';
import { useObjectives } from '../store/inventoryStore';
import { ExportButton, DataTable } from './common';
import type { BorrowRecord, TableColumn } from '../types';
import {
  BORROW_STATUS_LABELS,
  BORROW_STATUS_COLORS,
} from '../types/constants';
import { filterBorrowRecords } from '../utils/filterUtils';
import { getOverdueDays } from '../utils/dateUtils';

export function BorrowRecordsPanel() {
  const borrowRecords = useBorrowRecords();
  const setFilters = useBorrowStore((state) => state.setFilters);
  const filters = useBorrowStore((state) => state.filters);
  const objectives = useObjectives();

  const [filterStatus, setFilterStatus] = useState<string | null>(
    filters.status || null
  );

  const getObjective = (id: string) => objectives.find((o) => o.id === id);

  const filteredRecords = useMemo(() => {
    return filterBorrowRecords(borrowRecords, {
      status: (filterStatus as BorrowRecord['status']) || undefined,
    });
  }, [borrowRecords, filterStatus]);

  const handleFilterChange = (value: string | null) => {
    setFilterStatus(value);
    setFilters({ status: (value as BorrowRecord['status']) || undefined });
  };

  const columns: TableColumn<BorrowRecord>[] = [
    {
      key: 'borrowerName',
      title: '借用人',
      render: (record) => (
        <Group>
          <Avatar size="sm" radius="xl">
            <IconUser size={16} />
          </Avatar>
          <div>
            <Text size="sm" fw={500}>
              {record.borrowerName}
            </Text>
            <Text size="xs" c="dimmed">
              {record.borrowerDepartment}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: 'objectiveId',
      title: '物镜',
      render: (record) => {
        const objective = getObjective(record.objectiveId);
        return (
          <div>
            <Text size="sm" fw={500}>
              {objective?.serialNumber || record.objectiveId}
            </Text>
            <Text size="xs" c="dimmed">
              {objective?.brand} {objective?.magnification}x
            </Text>
          </div>
        );
      },
    },
    {
      key: 'borrowDate',
      title: '借出日期',
      render: (record) => <Text size="sm">{record.borrowDate}</Text>,
    },
    {
      key: 'expectedReturnDate',
      title: '应还日期',
      render: (record) => <Text size="sm">{record.expectedReturnDate}</Text>,
    },
    {
      key: 'actualReturnDate',
      title: '实际归还',
      render: (record) => <Text size="sm">{record.actualReturnDate || '-'}</Text>,
    },
    {
      key: 'overdueDays',
      title: '超期天数',
      render: (record) => {
        const overdueDays = getOverdueDays(
          record.expectedReturnDate,
          record.actualReturnDate
        );
        return overdueDays > 0 ? (
          <Text size="sm" c="red" fw={500}>
            {overdueDays} 天
          </Text>
        ) : (
          <Text size="sm" c="dimmed">
            -
          </Text>
        );
      },
    },
    {
      key: 'status',
      title: '状态',
      render: (record) => (
        <Badge color={BORROW_STATUS_COLORS[record.status]} size="sm">
          {BORROW_STATUS_LABELS[record.status]}
        </Badge>
      ),
    },
    {
      key: 'renewalCount',
      title: '续借次数',
      render: (record) => (
        <Text size="sm">{record.renewalCount || 0}</Text>
      ),
    },
  ];

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>借用记录管理</Title>
          <Group>
            <Select
              placeholder="筛选状态"
              value={filterStatus}
              onChange={handleFilterChange}
              clearable
              data={[
                { value: 'borrowed', label: '借出中' },
                { value: 'returned', label: '已归还' },
                { value: 'overdue', label: '已超期' },
                { value: 'renewal_pending', label: '续借待审' },
              ]}
            />
            <ExportButton
              data={filteredRecords}
              filename={`borrow-records-${new Date().toISOString().split('T')[0]}`}
              label="导出"
            />
          </Group>
        </Group>

        <Group mb="md">
          <Badge size="lg" color="blue">
            总记录: {borrowRecords.length}
          </Badge>
          <Badge size="lg" color="green">
            已归还: {borrowRecords.filter((r) => r.status === 'returned').length}
          </Badge>
          <Badge size="lg" color="yellow">
            借出中: {borrowRecords.filter((r) => r.status === 'borrowed').length}
          </Badge>
          <Badge size="lg" color="red">
            已超期: {borrowRecords.filter((r) => r.status === 'overdue').length}
          </Badge>
        </Group>

        <DataTable<BorrowRecord>
          data={filteredRecords}
          columns={columns}
          keyExtractor={(record) => record.id}
          emptyMessage="暂无借用记录"
        />
      </Paper>
    </Stack>
  );
}
