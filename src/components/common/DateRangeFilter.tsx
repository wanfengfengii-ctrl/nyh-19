import { Button, Popover, Stack, Text, Group } from '@mantine/core';
import { DatePickerInput, DatesProvider } from '@mantine/dates';
import { IconCalendar, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import 'dayjs/locale/zh-cn';

interface DateRangeFilterProps {
  value: [Date | null, Date | null];
  onChange: (value: [Date | null, Date | null]) => void;
  label?: string;
  placeholder?: string;
}

export function DateRangeFilter({
  value,
  onChange,
  label = '日期范围',
  placeholder = '选择日期范围',
}: DateRangeFilterProps) {
  const [opened, setOpened] = useState(false);

  const hasValue = value[0] || value[1];
  const displayValue = hasValue
    ? `${value[0]?.toLocaleDateString() || ''} ~ ${value[1]?.toLocaleDateString() || ''}`
    : placeholder;

  return (
    <DatesProvider settings={{ locale: 'zh-cn' }}>
      <Popover
        opened={opened}
        onChange={setOpened}
        width={280}
        position="bottom"
        withArrow
        shadow="md"
      >
        <Popover.Target>
          <Button
            variant={hasValue ? 'filled' : 'light'}
            leftSection={<IconCalendar size={16} />}
            rightSection={
              hasValue ? (
                <IconX
                  size={14}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange([null, null]);
                  }}
                />
              ) : null
            }
            onClick={() => setOpened((o) => !o)}
            size="sm"
          >
            {displayValue}
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack gap="sm">
            <Text size="sm" fw={600}>
              {label}
            </Text>
            <Group grow>
              <DatePickerInput
                value={value[0]}
                onChange={(date) => onChange([date, value[1]])}
                placeholder="开始日期"
                size="sm"
                label="开始"
              />
              <DatePickerInput
                value={value[1]}
                onChange={(date) => onChange([value[0], date])}
                placeholder="结束日期"
                size="sm"
                label="结束"
              />
            </Group>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </DatesProvider>
  );
}
