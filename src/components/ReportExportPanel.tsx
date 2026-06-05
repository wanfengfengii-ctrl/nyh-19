import { useState } from 'react';
import {
  Paper,
  Title,
  Table,
  Badge,
  Group,
  Button,
  Text,
  Stack,
  Card,
  SimpleGrid,
  Select,
  ScrollArea,
} from '@mantine/core';
import { IconDownload, IconFileText, IconChartBar, IconUsers, IconClock, IconCheck } from '@tabler/icons-react';
import { useObjectiveStore } from '../store/objectiveStore';
import {
  BORROW_STATUS_LABELS,
  BORROW_STATUS_COLORS,
} from '../types';

export function ReportExportPanel() {
  const borrowRecords = useObjectiveStore((state) => state.borrowRecords);
  const exportBorrowReport = useObjectiveStore((state) => state.exportBorrowReport);
  const generateBorrowStatistics = useObjectiveStore((state) => state.generateBorrowStatistics);
  const objectives = useObjectiveStore((state) => state.objectives);
  
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const getObjective = (id: string) => objectives.find((o) => o.id === id);
  const statistics = generateBorrowStatistics();

  const handleExport = () => {
    const filters: any = {};
    if (filterStatus) filters.status = filterStatus;
    
    const report = exportBorrowReport(filters);
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `borrow-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['借用人', '部门', '物镜编号', '品牌', '倍率', '借出日期', '应还日期', '实际归还日期', '状态', '备注'];
    const rows = borrowRecords.map((r) => {
      const obj = getObjective(r.objectiveId);
      return [
        r.borrowerName,
        r.borrowerDepartment,
        obj?.serialNumber || r.objectiveId,
        obj?.brand || '',
        obj?.magnification || '',
        r.borrowDate,
        r.expectedReturnDate,
        r.actualReturnDate || '',
        BORROW_STATUS_LABELS[r.status],
        r.notes || '',
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `borrow-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>借用报表与统计</Title>
          <Group>
            <Select
              placeholder="筛选状态"
              value={filterStatus}
              onChange={setFilterStatus}
              clearable
              data={[
                { value: 'borrowed', label: '借出中' },
                { value: 'returned', label: '已归还' },
                { value: 'overdue', label: '已超期' },
              ]}
            />
            <Button
              leftSection={<IconDownload size={16} />}
              onClick={handleExportCSV}
              variant="light"
            >
              导出 CSV
            </Button>
            <Button
              leftSection={<IconFileText size={16} />}
              onClick={handleExport}
            >
              导出 JSON
            </Button>
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="md">
          <Card padding="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">总借用次数</Text>
              <IconChartBar size={20} />
            </Group>
            <Text size="xl" fw={700}>{statistics.totalBorrows as number}</Text>
          </Card>

          <Card padding="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">已归还</Text>
              <IconCheck size={20} />
            </Group>
            <Text size="xl" fw={700} c="green">{statistics.returnedCount as number}</Text>
          </Card>

          <Card padding="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">超期次数</Text>
              <IconClock size={20} />
            </Group>
            <Text size="xl" fw={700} c="red">{statistics.overdueCount as number}</Text>
            <Text size="xs" c="dimmed">超期率: {statistics.overdueRate as string}</Text>
          </Card>

          <Card padding="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">平均借用时长</Text>
              <IconUsers size={20} />
            </Group>
            <Text size="xl" fw={700}>{statistics.averageBorrowDays as number}</Text>
          </Card>
        </SimpleGrid>

        <Title order={5} mb="sm">部门借用分布</Title>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} mb="md">
          {Object.entries(statistics.departmentStats as Record<string, number>).map(([dept, count]) => (
            <Card key={dept} padding="sm" withBorder>
              <Group justify="space-between">
                <Text size="sm">{dept}</Text>
                <Badge size="lg">{count} 次</Badge>
              </Group>
            </Card>
          ))}
        </SimpleGrid>

        <Title order={5} mb="sm">借用记录明细</Title>
        <ScrollArea>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>借用人</Table.Th>
                <Table.Th>部门</Table.Th>
                <Table.Th>物镜</Table.Th>
                <Table.Th>借出日期</Table.Th>
                <Table.Th>应还日期</Table.Th>
                <Table.Th>实际归还</Table.Th>
                <Table.Th>状态</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {borrowRecords
                .filter((r) => !filterStatus || r.status === filterStatus)
                .map((record) => {
                  const objective = getObjective(record.objectiveId);
                  return (
                    <Table.Tr key={record.id}>
                      <Table.Td>
                        <Text size="sm" fw={500}>{record.borrowerName}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{record.borrowerDepartment}</Text>
                      </Table.Td>
                      <Table.Td>
                        <div>
                          <Text size="sm" fw={500}>{objective?.serialNumber || record.objectiveId}</Text>
                          <Text size="xs" c="dimmed">{objective?.brand} {objective?.magnification}x</Text>
                        </div>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{record.borrowDate}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{record.expectedReturnDate}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{record.actualReturnDate || '-'}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={BORROW_STATUS_COLORS[record.status]} size="sm">
                          {BORROW_STATUS_LABELS[record.status]}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>
    </Stack>
  );
}
