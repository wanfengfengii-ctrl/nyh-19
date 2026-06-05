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
  Avatar,
  ScrollArea,
  Checkbox,
  Textarea,
  Alert,
} from '@mantine/core';
import { IconUser, IconBell, IconAlertTriangle, IconCalendarTime } from '@tabler/icons-react';
import { useObjectiveStore } from '../store/objectiveStore';
import {
  BORROW_STATUS_LABELS,
  BORROW_STATUS_COLORS,
} from '../types';

export function BatchReminderPanel() {
  const getDueSoonRecords = useObjectiveStore((state) => state.getDueSoonRecords);
  const getOverdueRecords = useObjectiveStore((state) => state.getOverdueRecords);
  const batchSendReminders = useObjectiveStore((state) => state.batchSendReminders);
  const objectives = useObjectiveStore((state) => state.objectives);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reminderMessage, setReminderMessage] = useState('');

  const getObjective = (id: string) => objectives.find((o) => o.id === id);
  const dueSoonRecords = getDueSoonRecords(3);
  const overdueRecords = getOverdueRecords();

  const allTargetRecords = [...overdueRecords, ...dueSoonRecords];

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === allTargetRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allTargetRecords.map((r) => r.id));
    }
  };

  const handleSendReminders = () => {
    if (selectedIds.length > 0) {
      const message = reminderMessage || '您借用的物镜即将到期，请及时归还';
      batchSendReminders(selectedIds, message);
      setSelectedIds([]);
      setReminderMessage('');
    }
  };

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>批量催还管理</Title>
          <Group>
            <Badge size="lg" color="red">已超期: {overdueRecords.length}</Badge>
            <Badge size="lg" color="yellow">即将到期: {dueSoonRecords.length}</Badge>
          </Group>
        </Group>

        {allTargetRecords.length > 0 ? (
          <>
            {selectedIds.length > 0 && (
              <Alert mb="md" color="blue" title={`已选择 ${selectedIds.length} 条记录`}>
                <Stack gap="sm">
                  <Textarea
                    placeholder="输入催还消息（可选）..."
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    minRows={2}
                  />
                  <Group justify="flex-end">
                    <Button
                      leftSection={<IconBell size={16} />}
                      onClick={handleSendReminders}
                    >
                      发送催还提醒
                    </Button>
                  </Group>
                </Stack>
              </Alert>
            )}

            {overdueRecords.length > 0 && (
              <Paper p="md" withBorder mb="md" style={{ borderColor: '#ef4444' }}>
                <Group mb="sm">
                  <IconAlertTriangle size={20} color="#ef4444" />
                  <Text fw={500} c="red">已超期 ({overdueRecords.length})</Text>
                </Group>
                <ScrollArea>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ width: 40 }}>
                          <Checkbox
                            checked={selectedIds.length === allTargetRecords.length && allTargetRecords.length > 0}
                            onChange={selectAll}
                            aria-label="全选"
                          />
                        </Table.Th>
                        <Table.Th>借用人</Table.Th>
                        <Table.Th>物镜</Table.Th>
                        <Table.Th>借出日期</Table.Th>
                        <Table.Th>应还日期</Table.Th>
                        <Table.Th>超期天数</Table.Th>
                        <Table.Th>状态</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {overdueRecords.map((record) => {
                        const objective = getObjective(record.objectiveId);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const expectedReturn = new Date(record.expectedReturnDate);
                        expectedReturn.setHours(0, 0, 0, 0);
                        const overdueDays = Math.ceil((today.getTime() - expectedReturn.getTime()) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <Table.Tr key={record.id}>
                            <Table.Td>
                              <Checkbox
                                checked={selectedIds.includes(record.id)}
                                onChange={() => toggleSelect(record.id)}
                              />
                            </Table.Td>
                            <Table.Td>
                              <Group>
                                <Avatar size="sm" radius="xl">
                                  <IconUser size={16} />
                                </Avatar>
                                <Text size="sm" fw={500}>{record.borrowerName}</Text>
                              </Group>
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
                              <Text size="sm" c="red" fw={500}>{record.expectedReturnDate}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Badge color="red" size="sm">{overdueDays} 天</Badge>
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
            )}

            {dueSoonRecords.length > 0 && (
              <Paper p="md" withBorder style={{ borderColor: '#eab308' }}>
                <Group mb="sm">
                  <IconCalendarTime size={20} color="#eab308" />
                  <Text fw={500} c="yellow">即将到期 ({dueSoonRecords.length})</Text>
                </Group>
                <ScrollArea>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ width: 40 }}>
                          <Checkbox
                            checked={selectedIds.length === allTargetRecords.length && allTargetRecords.length > 0}
                            onChange={selectAll}
                            aria-label="全选"
                          />
                        </Table.Th>
                        <Table.Th>借用人</Table.Th>
                        <Table.Th>物镜</Table.Th>
                        <Table.Th>借出日期</Table.Th>
                        <Table.Th>应还日期</Table.Th>
                        <Table.Th>剩余天数</Table.Th>
                        <Table.Th>状态</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {dueSoonRecords.map((record) => {
                        const objective = getObjective(record.objectiveId);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const expectedReturn = new Date(record.expectedReturnDate);
                        expectedReturn.setHours(0, 0, 0, 0);
                        const remainingDays = Math.ceil((expectedReturn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <Table.Tr key={record.id}>
                            <Table.Td>
                              <Checkbox
                                checked={selectedIds.includes(record.id)}
                                onChange={() => toggleSelect(record.id)}
                              />
                            </Table.Td>
                            <Table.Td>
                              <Group>
                                <Avatar size="sm" radius="xl">
                                  <IconUser size={16} />
                                </Avatar>
                                <Text size="sm" fw={500}>{record.borrowerName}</Text>
                              </Group>
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
                              <Badge color="yellow" size="sm">{remainingDays} 天</Badge>
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
            )}
          </>
        ) : (
          <Paper p="xl" withBorder>
            <Text ta="center" c="dimmed">
              暂无需要催还的记录
            </Text>
          </Paper>
        )}
      </Paper>
    </Stack>
  );
}
