import { Badge } from '@mantine/core';

interface StatusBadgeProps {
  status: string;
  labels: Record<string, string>;
  colors: Record<string, string>;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function StatusBadge({
  status,
  labels,
  colors,
  size = 'sm',
}: StatusBadgeProps) {
  return (
    <Badge color={colors[status] || 'gray'} size={size}>
      {labels[status] || status}
    </Badge>
  );
}
