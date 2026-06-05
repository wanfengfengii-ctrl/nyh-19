import {
  Drawer,
  Stack,
  Group,
  Badge,
  Text,
  Title,
  Divider,
  Timeline,
  Card,
  Accordion,
  Box,
} from '@mantine/core';
import {
  IconMicroscope,
  IconBrandGoogleMaps,
  IconLink,
  IconSun,
  IconAlertTriangle,
  IconCheck,
} from '@tabler/icons-react';
import { useObjectiveStore } from '../store/objectiveStore';
import type { MaintenanceRecord } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../types';
import { MaintenanceForm } from './MaintenanceForm';

export function DetailDrawer() {
  const selectedObjective = useObjectiveStore(
    (state) => state.selectedObjective
  );
  const setSelectedObjective = useObjectiveStore(
    (state) => state.setSelectedObjective
  );
  const getRecordsByObjectiveId = useObjectiveStore(
    (state) => state.getRecordsByObjectiveId
  );

  if (!selectedObjective) return null;

  const records = getRecordsByObjectiveId(selectedObjective.id);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'green';
    if (score >= 70) return 'yellow';
    if (score >= 50) return 'orange';
    return 'red';
  };

  const renderRecordItem = (record: MaintenanceRecord) => (
    <Timeline.Item
      key={record.id}
      bullet={
        record.clarityScore >= 80 ? (
          <IconCheck size={16} />
        ) : (
          <IconAlertTriangle size={16} />
        )
      }
      color={record.clarityScore >= 80 ? 'green' : 'orange'}
      title={record.testDate}
    >
      <Card withBorder p="sm" radius="sm">
        <Stack gap="xs">
          <Group justify="space-between">
            <Badge color={getScoreColor(record.clarityScore)} size="lg">
              清晰度: {record.clarityScore}
            </Badge>
            <Group gap="xs">
              {record.hasMold && <Badge color="yellow">有霉斑 🟤</Badge>}
              {record.hasScratch && <Badge color="orange">有划痕 ⚠️</Badge>}
            </Group>
          </Group>
          {record.treatmentAdvice && (
            <Text size="sm" c="dimmed">
              💡 {record.treatmentAdvice}
            </Text>
          )}
        </Stack>
      </Card>
    </Timeline.Item>
  );

  return (
    <Drawer
      opened={!!selectedObjective}
      onClose={() => setSelectedObjective(null)}
      title="物镜详情"
      position="right"
      size="lg"
      padding="xl"
    >
      <Stack gap="lg">
        <Box>
          <Group justify="space-between" mb="xs">
            <Title order={3}>{selectedObjective.brand}</Title>
            <Badge
              color={STATUS_COLORS[selectedObjective.status]}
              size="lg"
              variant="light"
            >
              {STATUS_LABELS[selectedObjective.status]}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed" ff="monospace">
            {selectedObjective.serialNumber}
          </Text>
        </Box>

        <Group grow>
          <Card withBorder p="md" radius="sm">
            <Stack gap="xs" align="center">
              <IconMicroscope size={24} />
              <Text fw={700} size="xl">
                {selectedObjective.magnification}×
              </Text>
              <Text size="xs" c="dimmed">
                倍率
              </Text>
            </Stack>
          </Card>
          <Card withBorder p="md" radius="sm">
            <Stack gap="xs" align="center">
              <IconSun size={24} />
              <Text fw={700} size="xl">
                {selectedObjective.numericalAperture}
              </Text>
              <Text size="xs" c="dimmed">
                数值孔径
              </Text>
            </Stack>
          </Card>
        </Group>

        <Divider label="详细信息" labelPosition="center" />

        <Stack gap="sm">
          <Group>
            <IconLink size={18} />
            <Text size="sm">
              接口规格: <strong>{selectedObjective.interfaceSpec}</strong>
            </Text>
          </Group>
          <Group>
            <IconSun size={18} />
            <Text size="sm">
              镀膜状态: <strong>{selectedObjective.coatingStatus}</strong>
            </Text>
          </Group>
          <Group>
            <IconBrandGoogleMaps size={18} />
            <Text size="sm">
              保存位置: <strong>{selectedObjective.storageLocation}</strong>
            </Text>
          </Group>
        </Stack>

        <Accordion variant="separated">
          <Accordion.Item value="add-record">
            <Accordion.Control>添加保养记录</Accordion.Control>
            <Accordion.Panel>
              <MaintenanceForm
                objectiveId={selectedObjective.id}
                isScrapped={selectedObjective.status === 'scrapped'}
              />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Divider label="保养历史" labelPosition="center" />

        {records.length > 0 ? (
          <Timeline active={records.length - 1} bulletSize={24} lineWidth={2}>
            {records.map(renderRecordItem)}
          </Timeline>
        ) : (
          <Text c="dimmed" ta="center" py="xl">
            暂无保养记录
          </Text>
        )}
      </Stack>
    </Drawer>
  );
}
