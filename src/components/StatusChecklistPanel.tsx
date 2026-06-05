import { useState } from 'react';
import {
  Paper,
  Title,
  Badge,
  Group,
  Button,
  Text,
  Stack,
  Avatar,
  Checkbox,
  Select,
  Textarea,
} from '@mantine/core';
import { IconUser, IconClipboardList } from '@tabler/icons-react';
import { useBorrowStore, useBorrowRecords } from '../store/borrowStore';
import { useObjectives } from '../store/inventoryStore';
import { ModalDialog, DataTable } from './common';
import type { BorrowRecord, StatusCheckItem, TableColumn } from '../types';
import {
  BORROW_STATUS_LABELS,
  BORROW_STATUS_COLORS,
} from '../types/constants';

export function StatusChecklistPanel() {
  const borrowRecords = useBorrowRecords();
  const saveCheckOutChecklist = useBorrowStore(
    (state) => state.saveCheckOutChecklist
  );
  const saveCheckInChecklist = useBorrowStore(
    (state) => state.saveCheckInChecklist
  );
  const generateDefaultChecklist = useBorrowStore(
    (state) => state.generateDefaultChecklist
  );
  const objectives = useObjectives();

  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [selectedBorrowId, setSelectedBorrowId] = useState('');
  const [checklistType, setChecklistType] = useState<'checkout' | 'checkin'>(
    'checkout'
  );
  const [checklist, setChecklist] = useState<StatusCheckItem[]>([]);
  const [notes, setNotes] = useState('');

  const getObjective = (id: string) => objectives.find((o) => o.id === id);

  const activeBorrows = borrowRecords.filter(
    (r) => r.status === 'borrowed' || r.status === 'overdue'
  );

  const openChecklistModal = (
    borrowId: string,
    type: 'checkout' | 'checkin'
  ) => {
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
        item.id === itemId
          ? { ...item, condition: condition as StatusCheckItem['condition'] }
          : item
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

  const columns: TableColumn<BorrowRecord>[] = [
    {
      key: 'borrowerName',
      title: '借用人',
      render: (record) => (
        <Group>
          <Avatar size="sm" radius="xl">
            <IconUser size={16} />
          </Avatar>
          <Text size="sm" fw={500}>
            {record.borrowerName}
          </Text>
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
      title: '到期日期',
      render: (record) => <Text size="sm">{record.expectedReturnDate}</Text>,
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
      key: 'checkOutChecklist',
      title: '借出验收',
      render: (record) =>
        record.checkOutChecklist ? (
          <Badge color="green" size="sm">
            已完成
          </Badge>
        ) : (
          <Badge color="yellow" size="sm">
            待验收
          </Badge>
        ),
    },
    {
      key: 'checkInChecklist',
      title: '归还验收',
      render: (record) =>
        record.checkInChecklist ? (
          <Badge color="green" size="sm">
            已完成
          </Badge>
        ) : (
          <Badge color="gray" size="sm">
            -
          </Badge>
        ),
    },
    {
      key: 'actions',
      title: '操作',
      render: (record) => (
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
      ),
    },
  ];

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>借出/归还状态验收</Title>
          <Group>
            <Badge size="lg" color="blue">
              待验收借出:{' '}
              {activeBorrows.filter((r) => !r.checkOutChecklist).length}
            </Badge>
          </Group>
        </Group>

        <DataTable<BorrowRecord>
          data={activeBorrows}
          columns={columns}
          keyExtractor={(record) => record.id}
          emptyMessage="暂无进行中的借用记录"
        />
      </Paper>

      <ModalDialog
        opened={checklistModalOpen}
        onClose={() => setChecklistModalOpen(false)}
        title={
          checklistType === 'checkout'
            ? '借出状态验收清单'
            : '归还状态验收清单'
        }
        size="lg"
        onConfirm={handleSaveChecklist}
        confirmLabel="确认验收"
        confirmDisabled={!checklist.every((item) => item.checked)}
      >
        <Text size="sm" c="dimmed">
          请逐项检查物镜状态，确认无误后勾选
        </Text>

        {['外观检查', '光学检查', '机械检查', '附件检查'].map((category) => (
          <Paper key={category} p="sm" withBorder>
            <Text size="sm" fw={500} mb="xs">
              {category}
            </Text>
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
                      onChange={(value) =>
                        handleConditionChange(item.id, value || 'excellent')
                      }
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
      </ModalDialog>
    </Stack>
  );
}
