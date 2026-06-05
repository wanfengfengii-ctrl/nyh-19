import { useState } from 'react';
import {
  Paper,
  Title,
  Table,
  Badge,
  Group,
  Button,
  Text,
  Modal,
  Stack,
  Avatar,
  ScrollArea,
  Checkbox,
  Select,
  Textarea,
} from '@mantine/core';
import { IconUser, IconCheck, IconClipboardList } from '@tabler/icons-react';
import { useObjectiveStore } from '../store/objectiveStore';
import {
  BORROW_STATUS_LABELS,
  BORROW_STATUS_COLORS,
} from '../types';

export function StatusChecklistPanel() {
  const borrowRecords = useObjectiveStore((state) => state.borrowRecords);
  const saveCheckOutChecklist = useObjectiveStore((state) => state.saveCheckOutChecklist);
  const saveCheckInChecklist = useObjectiveStore((state) => state.saveCheckInChecklist);
  const generateDefaultChecklist = useObjectiveStore((state) => state.generateDefaultChecklist);
  const objectives = useObjectiveStore((state) => state.objectives);
  
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [selectedBorrowId, setSelectedBorrowId] = useState('');
  const [checklistType, setChecklistType] = useState<'checkout' | 'checkin'>('checkout');
  const [checklist, setChecklist] = useState<any[]>([]);
  const [notes, setNotes] = useState('');

  const getObjective = (id: string) => objectives.find((o) => o.id === id);

  const activeBorrows = borrowRecords.filter(
    (r) => r.status === 'borrowed' || r.status === 'overdue'
  );

  const openChecklistModal = (borrowId: string, type: 'checkout' | 'checkin') => {
    setSelectedBorrowId(borrowId);
    setChecklistType(type);
    setChecklist(generateDefaultChecklist());
    setNotes('');
    setChecklistModalOpen(true);
  };

  const handleCheckItem = (itemId: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleConditionChange = (itemId: string, condition: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, condition } : item
      )
    );
  };

  const handleSaveChecklist = () => {
    const checklistWithMeta = checklist.map((item) => ({
      ...item,
      checkedBy: '管理员',
      checkedAt: new Date().toISOString(),
    }));

    if (checklistType === 'checkout') {
      saveCheckOutChecklist(selectedBorrowId, checklistWithMeta);
    } else {
      saveCheckInChecklist(selectedBorrowId, checklistWithMeta);
    }

    setChecklistModalOpen(false);
  };

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>借出/归还状态验收</Title>
          <Group>
            <Badge size="lg" color="blue">待验收借出: {activeBorrows.filter((r) => !r.checkOutChecklist).length}</Badge>
          </Group>
        </Group>

        <ScrollArea>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>借用人</Table.Th>
                <Table.Th>物镜</Table.Th>
                <Table.Th>借出日期</Table.Th>
                <Table.Th>到期日期</Table.Th>
                <Table.Th>状态</Table.Th>
                <Table.Th>借出验收</Table.Th>
                <Table.Th>归还验收</Table.Th>
                <Table.Th>操作</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {activeBorrows.length > 0 ? (
                activeBorrows.map((record) => {
                  const objective = getObjective(record.objectiveId);
                  return (
                    <Table.Tr key={record.id}>
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
                        <Badge color={BORROW_STATUS_COLORS[record.status]} size="sm">
                          {BORROW_STATUS_LABELS[record.status]}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {record.checkOutChecklist ? (
                          <Badge color="green" size="sm">已完成</Badge>
                        ) : (
                          <Badge color="yellow" size="sm">待验收</Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {record.checkInChecklist ? (
                          <Badge color="green" size="sm">已完成</Badge>
                        ) : (
                          <Badge color="gray" size="sm">-</Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {!record.checkOutChecklist && (
                            <Button
                              size="xs"
                              leftSection={<IconClipboardList size={14} />}
                              onClick={() => openChecklistModal(record.id, 'checkout')}
                            >
                              借出验收
                            </Button>
                          )}
                          {record.checkOutChecklist && !record.checkInChecklist && (
                            <Button
                              size="xs"
                              variant="light"
                              leftSection={<IconClipboardList size={14} />}
                              onClick={() => openChecklistModal(record.id, 'checkin')}
                            >
                              归还验收
                            </Button>
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={8} align="center" py="xl">
                    <Text c="dimmed">暂无进行中的借用记录</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      <Modal
        opened={checklistModalOpen}
        onClose={() => setChecklistModalOpen(false)}
        title={checklistType === 'checkout' ? '借出状态验收清单' : '归还状态验收清单'}
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            请逐项检查物镜状态，确认无误后勾选
          </Text>

          {['外观检查', '光学检查', '机械检查', '附件检查'].map((category) => (
            <Paper key={category} p="sm" withBorder>
              <Text size="sm" fw={500} mb="xs">{category}</Text>
              <Stack gap="sm">
                {checklist
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <Group key={item.id} justify="space-between" wrap="nowrap">
                      <Checkbox
                        label={item.item}
                        checked={item.checked}
                        onChange={() => handleCheckItem(item.id)}
                        style={{ flex: 1 }}
                      />
                      <Select
                        size="xs"
                        value={item.condition}
                        onChange={(value) => handleConditionChange(item.id, value || 'excellent')}
                        data={[
                          { value: 'excellent', label: '优秀' },
                          { value: 'good', label: '良好' },
                          { value: 'fair', label: '一般' },
                          { value: 'poor', label: '较差' },
                        ]}
                        style={{ width: 100 }}
                      />
                    </Group>
                  ))}
              </Stack>
            </Paper>
          ))}

          <Textarea
            label="验收备注"
            placeholder="请输入验收备注信息..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            minRows={2}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={() => setChecklistModalOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleSaveChecklist}
              disabled={!checklist.every((item) => item.checked)}
              leftSection={<IconCheck size={16} />}
            >
              确认验收
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
