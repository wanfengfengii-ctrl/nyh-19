import {
  Group,
  Select,
  TextInput,
  Button,
  SegmentedControl,
  Stack,
  Popover,
  Chip,
  Badge,
  Text,
} from '@mantine/core';
import {
  IconSearch,
  IconRefresh,
  IconFilter,
  IconX,
} from '@tabler/icons-react';
import { useInventoryStore, useFilters } from '../store/inventoryStore';
import type { ObjectiveStatus, DamageType } from '../types';
import {
  STATUS_LABELS,
  COATING_OPTIONS,
  DAMAGE_TYPE_LABELS,
  DAMAGE_TYPE_COLORS,
  BORROW_FILTER_OPTIONS,
} from '../types/constants';

export function FilterBar() {
  const filters = useFilters();
  const setFilters = useInventoryStore((state) => state.setFilters);
  const resetFilters = useInventoryStore((state) => state.resetFilters);
  const getUniqueBrands = useInventoryStore((state) => state.getUniqueBrands);
  const getUniqueMagnifications = useInventoryStore(
    (state) => state.getUniqueMagnifications
  );
  const getFilteredObjectives = useInventoryStore(
    (state) => state.getFilteredObjectives
  );

  const brands = getUniqueBrands();
  const magnifications = getUniqueMagnifications();
  const filteredCount = getFilteredObjectives().length;

  const statusOptions = [
    { label: '全部', value: '' },
    { label: STATUS_LABELS.normal, value: 'normal' },
    { label: STATUS_LABELS.scratched, value: 'scratched' },
    { label: STATUS_LABELS.moldy, value: 'moldy' },
    { label: STATUS_LABELS.coating_damaged, value: 'coating_damaged' },
    { label: STATUS_LABELS.in_repair, value: 'in_repair' },
    { label: STATUS_LABELS.scrapped, value: 'scrapped' },
  ];

  const damageTypeOptions: { value: DamageType; label: string; color: string }[] = [
    { value: 'mold', label: DAMAGE_TYPE_LABELS.mold, color: DAMAGE_TYPE_COLORS.mold },
    { value: 'scratch', label: DAMAGE_TYPE_LABELS.scratch, color: DAMAGE_TYPE_COLORS.scratch },
    { value: 'coating', label: DAMAGE_TYPE_LABELS.coating, color: DAMAGE_TYPE_COLORS.coating },
  ];

  const hasActiveDamageFilters = filters.hasMold || filters.hasScratch || filters.hasCoatingDamage;

  const handleDamageTypeToggle = (type: DamageType) => {
    const key = type === 'mold' ? 'hasMold' : type === 'scratch' ? 'hasScratch' : 'hasCoatingDamage';
    setFilters({ [key]: !filters[key as keyof typeof filters] });
  };

  return (
    <Stack gap="sm" w="100%">
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
          placeholder="借用状态"
          clearable
          value={filters.borrowStatus || null}
          onChange={(value) =>
            setFilters({ borrowStatus: (value as 'available' | 'borrowed' | 'overdue') || undefined })
          }
          data={BORROW_FILTER_OPTIONS}
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
              magnification: value ? Number(value) : undefined,
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

        <Popover width={260} position="bottom" withArrow shadow="md">
          <Popover.Target>
            <Button
              variant={hasActiveDamageFilters ? 'filled' : 'light'}
              leftSection={<IconFilter size={16} />}
              rightSection={
                hasActiveDamageFilters ? (
                  <Badge size="xs" circle>
                    {[filters.hasMold, filters.hasScratch, filters.hasCoatingDamage].filter(Boolean).length}
                  </Badge>
                ) : null
              }
              size="sm"
            >
              损伤筛选
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack gap="xs">
              <Text size="sm" fw={600}>
                按损伤类型筛选
              </Text>
              {damageTypeOptions.map((d) => (
                <Chip
                  key={d.value}
                  checked={
                    d.value === 'mold'
                      ? filters.hasMold
                      : d.value === 'scratch'
                      ? filters.hasScratch
                      : filters.hasCoatingDamage
                  }
                  onChange={() => handleDamageTypeToggle(d.value)}
                  color={d.color}
                  variant="filled"
                >
                  {d.label}
                </Chip>
              ))}
              <Button
                variant="subtle"
                size="xs"
                leftSection={<IconX size={14} />}
                onClick={() =>
                  setFilters({
                    hasMold: undefined,
                    hasScratch: undefined,
                    hasCoatingDamage: undefined,
                  })
                }
              >
                清除损伤筛选
              </Button>
            </Stack>
          </Popover.Dropdown>
        </Popover>

        <TextInput
          placeholder="搜索编号、品牌、位置..."
          leftSection={<IconSearch size={16} />}
          value={filters.search || ''}
          onChange={(e) => setFilters({ search: e.target.value })}
          size="sm"
        />

        <Group gap="xs" grow>
          <Button
            variant="subtle"
            leftSection={<IconRefresh size={16} />}
            onClick={resetFilters}
            size="sm"
          >
            重置
          </Button>
          <Text size="sm" c="dimmed" ta="center">
            共 <strong>{filteredCount}</strong> 条记录
          </Text>
        </Group>
      </Group>
    </Stack>
  );
}
