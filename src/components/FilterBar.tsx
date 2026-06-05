import { Group, Select, TextInput, Button, SegmentedControl, Stack } from '@mantine/core';
import { IconSearch, IconRefresh } from '@tabler/icons-react';
import { useObjectiveStore } from '../store/objectiveStore';
import type { ObjectiveStatus } from '../types';
import { STATUS_LABELS, COATING_OPTIONS } from '../types';

export function FilterBar() {
  const filters = useObjectiveStore((state) => state.filters);
  const setFilters = useObjectiveStore((state) => state.setFilters);
  const resetFilters = useObjectiveStore((state) => state.resetFilters);
  const getUniqueBrands = useObjectiveStore((state) => state.getUniqueBrands);
  const getUniqueMagnifications = useObjectiveStore(
    (state) => state.getUniqueMagnifications
  );

  const brands = getUniqueBrands();
  const magnifications = getUniqueMagnifications();

  const statusOptions = [
    { label: '全部', value: '' },
    { label: STATUS_LABELS.normal, value: 'normal' },
    { label: STATUS_LABELS.scratched, value: 'scratched' },
    { label: STATUS_LABELS.moldy, value: 'moldy' },
    { label: STATUS_LABELS.scrapped, value: 'scrapped' },
  ];

  return (
    <Stack gap="sm">
      <Group gap="sm" grow wrap="wrap">
        <SegmentedControl
          value={filters.status || ''}
          onChange={(value) =>
            setFilters({ status: (value as ObjectiveStatus) || undefined })
          }
          data={statusOptions}
          size="sm"
        />

        <Select
          placeholder="选择品牌"
          clearable
          value={filters.brand || null}
          onChange={(value) => setFilters({ brand: value || undefined })}
          data={brands.map((b) => ({ value: b, label: b }))}
          size="sm"
        />

        <Select
          placeholder="选择倍率"
          clearable
          value={filters.magnification?.toString() || null}
          onChange={(value) =>
            setFilters({
              magnification: value ? parseInt(value) : undefined,
            })
          }
          data={magnifications.map((m) => ({
            value: m.toString(),
            label: `${m}×`,
          }))}
          size="sm"
        />
      </Group>

      <Group gap="sm" grow wrap="wrap">
        <Select
          placeholder="镀膜状态"
          clearable
          value={filters.coatingStatus || null}
          onChange={(value) =>
            setFilters({ coatingStatus: value || undefined })
          }
          data={COATING_OPTIONS.map((c) => ({ value: c, label: c }))}
          size="sm"
        />

        <TextInput
          placeholder="搜索编号、品牌、位置..."
          leftSection={<IconSearch size={16} />}
          value={filters.search || ''}
          onChange={(e) => setFilters({ search: e.target.value })}
          size="sm"
        />

        <Button
          variant="subtle"
          leftSection={<IconRefresh size={16} />}
          onClick={resetFilters}
          size="sm"
        >
          重置筛选
        </Button>
      </Group>
    </Stack>
  );
}
