import {
  Card,
  Stack,
  Text,
  Group,
  Badge,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconBell,
  IconCheck,
  IconCalendar,
  IconAlertCircle,
  IconTrendingDown,
} from '@tabler/icons-react';
import { useObjectiveStore } from '../store/objectiveStore';

const REMINDER_TYPE_ICONS = {
  regular: IconCalendar,
  damage: IconAlertCircle,
  score_drop: IconTrendingDown,
};

const REMINDER_TYPE_COLORS = {
  regular: 'blue',
  damage: 'red',
  score_drop: 'orange',
};

const REMINDER_TYPE_LABELS = {
  regular: '定期保养',
  damage: '损伤提醒',
  score_drop: '评分下降',
};

export function MaintenanceReminders() {
  const reminders = useObjectiveStore((state) => state.getActiveReminders());
  const objectives = useObjectiveStore((state) => state.objectives);
  const getOverdueRecords = useObjectiveStore((state) => state.getOverdueRecords);
  const acknowledgeReminder = useObjectiveStore(
    (state) => state.acknowledgeReminder
  );
  const setSelectedObjective = useObjectiveStore(
    (state) => state.setSelectedObjective
  );

  const overdueRecords = getOverdueRecords();

  if (reminders.length === 0 && overdueRecords.length === 0) return null;

  const getOverdueDays = (expectedDate: string) => {
    const expected = new Date(expectedDate);
    const today = new Date();
    const diff = Math.floor((today.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  return (
    <Card withBorder p="md" radius="md" mb="lg">
      <Group mb="md">
        <IconBell size={20} color="#ef4444" />
        <Text fw={600}>提醒事项</Text>
        <Badge color="red" size="sm">
          {reminders.length + overdueRecords.length}
        </Badge>
      </Group>

      <Stack gap="sm">
        {overdueRecords.slice(0, 3).map((record) => {
          const objective = objectives.find((o) => o.id === record.objectiveId);
          return (
            <Card
              key={record.id}
              withBorder
              p="sm"
              radius="sm"
              bg="red.0"
              style={{ cursor: 'pointer' }}
              onClick={() => objective && setSelectedObjective(objective)}
            >
              <Group justify="space-between">
                <Group gap="xs">
                  <IconAlertCircle size={16} color="#ef4444" />
                  <Stack gap={2}>
                    <Group gap="xs">
                      <Text size="sm" fw={500}>
                        {objective?.serialNumber || '未知物镜'}
                      </Text>
                      <Badge size="xs" color="red" variant="light">
                        借用超期
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      借用人: {record.borrowerName} - {record.reason}
                    </Text>
                  </Stack>
                </Group>
                <Badge color="red" size="sm">
                  超期 {getOverdueDays(record.expectedReturnDate)} 天
                </Badge>
              </Group>
              <Text size="xs" c="dimmed" mt="xs">
                预计归还: {record.expectedReturnDate}
              </Text>
            </Card>
          );
        })}

        {reminders.slice(0, 5 - overdueRecords.length).map((reminder) => {
          const objective = objectives.find(
            (o) => o.id === reminder.objectiveId
          );
          const TypeIcon = REMINDER_TYPE_ICONS[reminder.type];

          return (
            <Card
              key={reminder.id}
              withBorder
              p="sm"
              radius="sm"
              bg={`${REMINDER_TYPE_COLORS[reminder.type]}.0`}
              style={{ cursor: 'pointer' }}
              onClick={() => objective && setSelectedObjective(objective)}
            >
              <Group justify="space-between">
                <Group gap="xs">
                  <TypeIcon
                    size={16}
                    color={
                      REMINDER_TYPE_COLORS[reminder.type] === 'red'
                        ? '#ef4444'
                        : REMINDER_TYPE_COLORS[reminder.type] === 'orange'
                        ? '#f97316'
                        : '#3b82f6'
                    }
                  />
                  <Stack gap={2}>
                    <Group gap="xs">
                      <Text size="sm" fw={500}>
                        {objective?.serialNumber || '未知物镜'}
                      </Text>
                      <Badge
                        size="xs"
                        color={REMINDER_TYPE_COLORS[reminder.type]}
                        variant="light"
                      >
                        {REMINDER_TYPE_LABELS[reminder.type]}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed" lineClamp={2}>
                      {reminder.message}
                    </Text>
                  </Stack>
                </Group>
                <Tooltip label="标记为已读">
                  <ActionIcon
                    size="sm"
                    color="green"
                    variant="subtle"
                    onClick={(e) => {
                      e.stopPropagation();
                      acknowledgeReminder(reminder.id);
                    }}
                  >
                    <IconCheck size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              <Text size="xs" c="dimmed" mt="xs">
                截止日期: {reminder.dueDate}
              </Text>
            </Card>
          );
        })}
      </Stack>

      {reminders.length + overdueRecords.length > 5 && (
        <Text size="xs" c="dimmed" ta="center" mt="sm">
          还有 {reminders.length + overdueRecords.length - 5} 条提醒...
        </Text>
      )}
    </Card>
  );
}
