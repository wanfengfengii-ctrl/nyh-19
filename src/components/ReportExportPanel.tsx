import { useState, useMemo } from 'react';
import {
  Paper,
  Title,
  Badge,
  Group,
  Text,
  Stack,
  Select,
  SimpleGrid,
  Card,
} from '@mantine/core';
import {
  IconChartBar,
  IconCheck,
  IconClock,
  IconUsers,
} from '@tabler/icons-react';
import { useObjectiveStore } from '../store/objectiveStore';
import { useObjectives } from '../store/inventoryStore';
import { ExportButton, DataTable } from './common';
import type { BorrowRecord, TableColumn, BorrowStatus } from '../types';
import {
  BORROW_STATUS_LABELS,
  BORROW_STATUS_COLORS,
} from '../types/constants';
import { filterBorrowRecords } from '../utils/filterUtils';

export function ReportExportPanel() {
  const borrowRecords = useObjectiveStore(
    (state) => state.borrowRecords
  );
  const objectives = useObjectives();

  const [filterStatus, setFilterStatus] = useState<BorrowStatus | null>(null);

  const getObjective = (id: string) => objectives.find((o) => o.id === id);

  const filteredRecords = useMemo(() => {
    return filterBorrowRecords(borrowRecords, { status: filterStatus ?? undefined });
  }, [borrowRecords, filterStatus]);

  const statistics = useMemo(() => {
    const records = borrowRecords;
    const totalBorrows = records.length;
    const returnedCount = records.filter((r) => r.status === 'returned').length;
    const overdueRecords = records.filter((r) => r.status === 'overdue');
    const overdueCount = overdueRecords.length;
    const overdueRate =
      totalBorrows > 0
        ? ((overdueCount / totalBorrows) * 100).toFixed(1) + '%'
        : '0%';
    const totalBorrowDays = records.reduce((sum, r) => {
      const end = r.actualReturnDate
        ? new Date(r.actualReturnDate)
        : new Date();
      const start = new Date(r.borrowDate);
      return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    const averageBorrowDays =
      totalBorrows > 0 ? (totalBorrowDays / totalBorrows).toFixed(1) + ' 天' : '0 天';

    const departmentStats: Record<string, number> = {};
    records.forEach((r) => {
      departmentStats[r.borrowerDepartment] =
        (departmentStats[r.borrowerDepartment] || 0) + 1;
    });

    return {
      totalBorrows,
      returnedCount,
      overdueCount,
      overdueRate,
      averageBorrowDays,
      departmentStats,
    };
  }, [borrowRecords]);

  const handleFilterChange = (value: string | null) => {
    setFilterStatus(value as BorrowStatus | null);
  };

  const columns: TableColumn<BorrowRecord>[] = [
    {
      key: 'borrowerName',
      title: '借用人',
      render: (record) => (
        <Text size="sm" fw={500}>
          {record.borrowerName}
        </Text>
      ),
    },
    {
      key: 'borrowerDepartment',
      title: '部门',
      render: (record) => <Text size="sm">{record.borrowerDepartment}</Text>,
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
      key: 'status',
      title: '状态',
      render: (record) => (
        <Badge color={BORROW_STATUS_COLORS[record.status]} size="sm">
          {BORROW_STATUS_LABELS[record.status]}
        </Badge>
      ),
    },
  ];

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>借用报表与统计</Title>
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
              ]}
            />
            <ExportButton
              data={filteredRecords}
              filename={`borrow-report-${new Date().toISOString().split('T')[0]}`}
              label="导出"
            />
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="md">
          <Card padding="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">
                总借用次数
              </Text>
              <IconChartBar size={20} />
            </Group>
            <Text size="xl" fw={700}>
              {statistics.totalBorrows}
            </Text>
          </Card>

          <Card padding="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">
                已归还
              </Text>
              <IconCheck size={20} />
            </Group>
            <Text size="xl" fw={700} c="green">
              {statistics.returnedCount}
            </Text>
          </Card>

          <Card padding="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">
                超期次数
              </Text>
              <IconClock size={20} />
            </Group>
            <Text size="xl" fw={700} c="red">
              {statistics.overdueCount}
            </Text>
            <Text size="xs" c="dimmed">
              超期率: {statistics.overdueRate}
            </Text>
          </Card>

          <Card padding="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">
                平均借用时长
              </Text>
              <IconUsers size={20} />
            </Group>
            <Text size="xl" fw={700}>
              {statistics.averageBorrowDays}
            </Text>
          </Card>
        </SimpleGrid>

        <Title order={5} mb="sm">
          部门借用分布
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} mb="md">
          {Object.entries(statistics.departmentStats).map(([dept, count]) => (
            <Card key={dept} padding="sm" withBorder>
              <Group justify="space-between">
                <Text size="sm">{dept}</Text>
                <Badge size="lg">{count} 次</Badge>
              </Group>
            </Card>
          ))}
        </SimpleGrid>

        <Title order={5} mb="sm">
          借用记录明细
        </Title>
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
