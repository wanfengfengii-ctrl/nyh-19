import { Timeline, Card, Stack, Group, Text, Badge, Chip } from '@mantine/core';
import {
  IconArrowRight,
  IconArrowLeft,
  IconAlertTriangle,
  IconUser,
  IconCalendar,
  IconFileText,
} from '@tabler/icons-react';
import type { BorrowRecord } from '../types';
import { BORROW_STATUS_LABELS, BORROW_STATUS_COLORS } from '../types';

interface BorrowHistoryTimelineProps {
  records: BorrowRecord[];
}

export function BorrowHistoryTimeline({ records }: BorrowHistoryTimelineProps) {
  if (records.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl" size="sm">
        暂无借用记录
      </Text>
    );
  }

  const getBulletIcon = (record: BorrowRecord) => {
    if (record.status === 'overdue') {
      return <IconAlertTriangle size={16} />;
    }
    if (record.status === 'returned') {
      return <IconArrowLeft size={16} />;
    }
    return <IconArrowRight size={16} />;
  };

  const getBulletColor = (record: BorrowRecord) => {
    return BORROW_STATUS_COLORS[record.status];
  };

  const getOverdueDays = (record: BorrowRecord) => {
    if (record.status !== 'overdue') return 0;
    const expected = new Date(record.expectedReturnDate);
    const today = new Date();
    const diff = Math.floor((today.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const renderRecordItem = (record: BorrowRecord) => (
    <Timeline.Item
      key={record.id}
      bullet={getBulletIcon(record)}
      color={getBulletColor(record)}
      title={record.reason}
    >
      <Card withBorder p="sm" radius="sm">
        <Stack gap="xs">
          <Group justify="space-between">
            <Badge color={BORROW_STATUS_COLORS[record.status]} size="sm">
              {BORROW_STATUS_LABELS[record.status]}
            </Badge>
            {record.status === 'overdue' && (
              <Badge color="red" size="sm">
                超期 {getOverdueDays(record)} 天
              </Badge>
            )}
          </Group>

          <Group gap="xs">
            <IconUser size={14} />
            <Text size="sm">
              <strong>{record.borrowerName}</strong>
            </Text>
            <Chip size="xs" variant="light">
              {record.borrowerDepartment}
            </Chip>
          </Group>

          <Group gap="md">
            <Group gap="xs">
              <IconCalendar size={14} />
              <Text size="xs" c="dimmed">
                {record.borrowDate} → {record.actualReturnDate || record.expectedReturnDate}
              </Text>
            </Group>
            {record.actualReturnDate && (
              <Text size="xs" c="dimmed">
                实际归还: {record.actualReturnDate}
              </Text>
            )}
          </Group>

          {record.notes && (
            <Group gap="xs">
              <IconFileText size={14} />
              <Text size="xs" c="dimmed" fs="italic">
                备注: {record.notes}
              </Text>
            </Group>
          )}
        </Stack>
      </Card>
    </Timeline.Item>
  );

  return (
    <Timeline active={records.findIndex((r) => r.status !== 'returned')} bulletSize={24} lineWidth={2}>
      {records.map(renderRecordItem)}
    </Timeline>
  );
}
