import { Card, Badge, Group, Text, Stack, ActionIcon, Tooltip } from '@mantine/core';
import { IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import type { Objective } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../types';
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

  const records = getRecordsByObjectiveId(objective.id);
  const latestScore = records.length > 0 ? records[0].clarityScore : null;

  const handleViewDetails = () => {
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
        backgroundColor:
          objective.status === 'scrapped'
            ? 'rgba(239, 68, 68, 0.05)'
            : undefined,
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
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Text fw={600} size="sm" c="dimmed">
            {objective.serialNumber}
          </Text>
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
        <Tooltip label="编辑">
          <ActionIcon variant="subtle" color="gray" onClick={handleEdit}>
            <IconEdit size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="删除">
          <ActionIcon variant="subtle" color="red" onClick={handleDelete}>
            <IconTrash size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Card>
  );
}
