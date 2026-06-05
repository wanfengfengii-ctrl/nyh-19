import type { ReactNode } from 'react';
import { Timeline as MantineTimeline, Text, Group, Paper, Badge } from '@mantine/core';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  color?: string;
  icon?: ReactNode;
  badge?: string;
  badgeColor?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  title?: string;
  emptyMessage?: string;
}

export function Timeline({
  items,
  title,
  emptyMessage = '暂无记录',
}: TimelineProps) {
  if (items.length === 0) {
    return (
      <Paper p="md" withBorder>
        <Text c="dimmed" ta="center">
          {emptyMessage}
        </Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder>
      {title && (
        <Text size="sm" fw={600} mb="md">
          {title}
        </Text>
      )}
      <MantineTimeline active={items.length - 1} bulletSize={20} lineWidth={2}>
        {items.map((item) => (
          <MantineTimeline.Item
            key={item.id}
            bullet={item.icon}
            color={item.color || 'blue'}
          >
            <Group justify="space-between" mb={4}>
              <Text size="sm" fw={500}>
                {item.title}
              </Text>
              <Group gap="xs">
                {item.badge && (
                  <Badge size="xs" color={item.badgeColor}>
                    {item.badge}
                  </Badge>
                )}
                <Text size="xs" c="dimmed">
                  {item.date}
                </Text>
              </Group>
            </Group>
            {item.description && (
              <Text size="sm" c="dimmed">
                {item.description}
              </Text>
            )}
          </MantineTimeline.Item>
        ))}
      </MantineTimeline>
    </Paper>
  );
}
