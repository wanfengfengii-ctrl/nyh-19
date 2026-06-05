import {
  Card,
  Badge,
  Group,
  Text,
  Stack,
  ActionIcon,
  Tooltip,
  Checkbox,
} from '@mantine/core';
import { IconEye, IconEdit, IconTrash, IconUser } from '@tabler/icons-react';
import type { Objective } from '../types';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  DAMAGE_TYPE_LABELS,
  DAMAGE_TYPE_COLORS,
  BORROW_STATUS_LABELS,
} from '../types/constants';
import { useObjectiveStore } from '../store/objectiveStore';

interface ObjectiveCardProps {
  objective: Objective;
}

export function ObjectiveCard({ objective }: ObjectiveCardProps) {
  const setSelectedObjective = useObjectiveStore(
    (state) => state.setSelectedObjective
  );
  const setObjectiveModalOpen = useObjectiveStore(
    (state) => state.setObjectiveModalOpen
  );
  const setEditingObjective = useObjectiveStore(
    (state) => state.setEditingObjective
  );
  const deleteObjective = useObjectiveStore((state) => state.deleteObjective);
  const getRecordsByObjectiveId = useObjectiveStore(
    (state) => state.getRecordsByObjectiveId
  );
  const getCurrentBorrowRecord = useObjectiveStore(
    (state) => state.getCurrentBorrowRecord
  );
  const selectedIds = useObjectiveStore((state) => state.selectedIds);
  const toggleSelectedId = useObjectiveStore(
    (state) => state.toggleSelectedId
  );

  const records = getRecordsByObjectiveId(objective.id);
  const latestScore = records.length > 0 ? records[0].clarityScore : null;
  const currentBorrow = getCurrentBorrowRecord(objective.id);

  const isSelected = selectedIds.includes(objective.id);
  const isScrapped = objective.status === 'scrapped';

  const handleViewDetails = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setSelectedObjective(objective);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingObjective(objective);
    setObjectiveModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`确定要删除物镜 ${objective.serialNumber} 吗？`)) {
      deleteObjective(objective.id);
    }
  };

  const handleSelect = () => {
    toggleSelectedId(objective.id);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'green';
    if (score >= 70) return 'yellow';
    if (score >= 50) return 'orange';
    return 'red';
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      onClick={handleViewDetails}
      style={{
        cursor: 'pointer',
        backgroundColor: isScrapped
          ? 'rgba(239, 68, 68, 0.05)'
          : isSelected
          ? 'rgba(59, 130, 246, 0.08)'
          : undefined,
        borderColor: isSelected ? '#3b82f6' : undefined,
      }}
      styles={(theme) => ({
        root: {
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows.lg,
          },
        },
      })}
    >
      {currentBorrow && (
        <Card.Section
          bg={currentBorrow.status === 'overdue' ? 'red.0' : 'blue.0'}
          py={6}
          px="lg"
          style={{ borderBottom: '1px solid #eee' }}
        >
          <Group justify="space-between">
            <Group gap="xs">
              <IconUser size={14} color={currentBorrow.status === 'overdue' ? '#ef4444' : '#3b82f6'} />
              <Text size="xs" fw={500} c={currentBorrow.status === 'overdue' ? 'red' : 'blue'}>
                {BORROW_STATUS_LABELS[currentBorrow.status]}: {currentBorrow.borrowerName}
              </Text>
            </Group>
            {currentBorrow.status === 'overdue' && (
              <Badge color="red" size="xs">
                已超期
              </Badge>
            )}
          </Group>
        </Card.Section>
      )}
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Group gap="xs">
            <Checkbox
              checked={isSelected}
              onChange={handleSelect}
              onClick={(e) => e.stopPropagation()}
              size="sm"
            />
            <Text fw={600} size="sm" c="dimmed">
              {objective.serialNumber}
            </Text>
          </Group>
          <Badge color={STATUS_COLORS[objective.status]} variant="light">
            {STATUS_LABELS[objective.status]}
          </Badge>
        </Group>
      </Card.Section>

      <Stack gap="sm" mt="md">
        <Group justify="space-between">
          <Text size="lg" fw={700}>
            {objective.brand}
          </Text>
          <Group gap="xs">
            <Badge variant="outline" size="lg">
              {objective.magnification}×
            </Badge>
            <Badge variant="outline" size="lg">
              NA {objective.numericalAperture}
            </Badge>
          </Group>
        </Group>

        {objective.damages.length > 0 && (
          <Group gap="xs">
            {objective.damages.slice(0, 3).map((d, i) => (
              <Badge
                key={i}
                color={DAMAGE_TYPE_COLORS[d.type]}
                size="xs"
                variant="filled"
              >
                {DAMAGE_TYPE_LABELS[d.type]}
              </Badge>
            ))}
            {objective.damages.length > 3 && (
              <Badge size="xs">+{objective.damages.length - 3}</Badge>
            )}
          </Group>
        )}

        <Group gap="xs">
          <Text size="sm" c="dimmed">
            接口: {objective.interfaceSpec}
          </Text>
          <Text size="sm" c="dimmed">
            |
          </Text>
          <Text size="sm" c="dimmed">
            {objective.coatingStatus}
          </Text>
        </Group>

        <Group justify="space-between" mt="xs">
          <Text size="sm" c="dimmed">
            📍 {objective.storageLocation}
          </Text>
          {latestScore !== null && (
            <Badge color={getScoreColor(latestScore)} size="sm">
              评分: {latestScore}
            </Badge>
          )}
        </Group>
      </Stack>

      <Group mt="md" justify="flex-end" gap="xs">
        <Tooltip label="查看详情">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={handleViewDetails}
          >
            <IconEye size={18} />
          </ActionIcon>
        </Tooltip>
        {!isScrapped && (
          <>
            <Tooltip label="编辑">
              <ActionIcon variant="subtle" color="gray" onClick={handleEdit}>
                <IconEdit size={18} />
              </ActionIcon>
            </Tooltip>
          </>
        )}
        <Tooltip label="删除">
          <ActionIcon variant="subtle" color="red" onClick={handleDelete}>
            <IconTrash size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Card>
  );
}
