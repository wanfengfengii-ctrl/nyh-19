import type { ReactNode } from 'react';
import { Group, TextInput, Button, Chip, Badge, Popover, Stack, Text } from '@mantine/core';
import { IconSearch, IconRefresh, IconFilter, IconX } from '@tabler/icons-react';

interface FilterChip {
  value: string;
  label: string;
  color?: string;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  chips?: FilterChip[];
  selectedChips?: string[];
  onChipToggle?: (value: string) => void;
  chipTitle?: string;
  onReset: () => void;
  resultCount?: number;
  children?: ReactNode;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = '搜索...',
  filters,
  chips,
  selectedChips = [],
  onChipToggle,
  chipTitle = '筛选',
  onReset,
  resultCount,
  children,
}: FilterBarProps) {
  return (
    <Stack gap="sm" w="100%">
      <Group gap="sm" grow wrap="wrap">
        {children}
        {filters}
        {chips && chips.length > 0 && (
          <Popover width={260} position="bottom" withArrow shadow="md">
            <Popover.Target>
              <Button
                variant={selectedChips.length > 0 ? 'filled' : 'light'}
                leftSection={<IconFilter size={16} />}
                rightSection={
                  selectedChips.length > 0 ? (
                    <Badge size="xs" circle>
                      {selectedChips.length}
                    </Badge>
                  ) : null
                }
                size="sm"
              >
                {chipTitle}
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack gap="xs">
                <Text size="sm" fw={600}>
                  {chipTitle}
                </Text>
                <Group gap="xs">
                  {chips.map((chip) => (
                    <Chip
                      key={chip.value}
                      checked={selectedChips.includes(chip.value)}
                      onChange={() => onChipToggle?.(chip.value)}
                      color={chip.color}
                      variant="filled"
                      size="sm"
                    >
                      {chip.label}
                    </Chip>
                  ))}
                </Group>
                {selectedChips.length > 0 && (
                  <Button
                    variant="subtle"
                    size="xs"
                    leftSection={<IconX size={14} />}
                    onClick={() => selectedChips.forEach((v) => onChipToggle?.(v))}
                  >
                    清除筛选
                  </Button>
                )}
              </Stack>
            </Popover.Dropdown>
          </Popover>
        )}
        <TextInput
          placeholder={searchPlaceholder}
          leftSection={<IconSearch size={16} />}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          size="sm"
        />
        <Group gap="xs" grow>
          <Button
            variant="subtle"
            leftSection={<IconRefresh size={16} />}
            onClick={onReset}
            size="sm"
          >
            重置
          </Button>
          {resultCount !== undefined && (
            <Text size="sm" c="dimmed" ta="center">
              共 <strong>{resultCount}</strong> 条记录
            </Text>
          )}
        </Group>
      </Group>
    </Stack>
  );
}
