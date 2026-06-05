import { useEffect } from 'react';
import {
  Modal,
  TextInput,
  Select,
  NumberInput,
  Button,
  Stack,
  Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useObjectiveStore } from '../store/objectiveStore';
import type { ObjectiveFormData, ObjectiveStatus } from '../types';
import {
  BRAND_OPTIONS,
  MAGNIFICATION_OPTIONS,
  INTERFACE_OPTIONS,
  COATING_OPTIONS,
} from '../types';
import {
  validateSerialNumber,
  validateMagnification,
  validateNumericalAperture,
  validateBrand,
  validateInterfaceSpec,
  validateCoatingStatus,
  validateStorageLocation,
} from '../utils/validation';

export function ObjectiveForm() {
  const isOpen = useObjectiveStore((state) => state.isObjectiveModalOpen);
  const editingObjective = useObjectiveStore((state) => state.editingObjective);
  const setObjectiveModalOpen = useObjectiveStore(
    (state) => state.setObjectiveModalOpen
  );
  const setEditingObjective = useObjectiveStore(
    (state) => state.setEditingObjective
  );
  const addObjective = useObjectiveStore((state) => state.addObjective);
  const updateObjective = useObjectiveStore((state) => state.updateObjective);
  const isSerialNumberUnique = useObjectiveStore(
    (state) => state.isSerialNumberUnique
  );
  const setNotification = useObjectiveStore(
    (state) => state.setNotification
  );

  const isEditing = !!editingObjective;

  const form = useForm<ObjectiveFormData>({
    initialValues: {
      serialNumber: '',
      brand: '',
      magnification: 10,
      numericalAperture: 0.25,
      interfaceSpec: 'RMS',
      coatingStatus: '原厂镀膜完好',
      storageLocation: '',
      status: 'normal' as ObjectiveStatus,
    },

    validate: {
      serialNumber: (value) =>
        validateSerialNumber(
          value,
          isSerialNumberUnique(value, editingObjective?.id)
        ),
      brand: (value) => validateBrand(value),
      magnification: (value) => validateMagnification(value),
      numericalAperture: (value) => validateNumericalAperture(value),
      interfaceSpec: (value) => validateInterfaceSpec(value),
      coatingStatus: (value) => validateCoatingStatus(value),
      storageLocation: (value) => validateStorageLocation(value),
    },
  });

  useEffect(() => {
    if (editingObjective) {
      form.setValues({
        serialNumber: editingObjective.serialNumber,
        brand: editingObjective.brand,
        magnification: Number(editingObjective.magnification),
        numericalAperture: Number(editingObjective.numericalAperture),
        interfaceSpec: editingObjective.interfaceSpec,
        coatingStatus: editingObjective.coatingStatus,
        storageLocation: editingObjective.storageLocation,
        status: editingObjective.status,
      });
    } else {
      form.reset();
    }
  }, [editingObjective, isOpen]);

  const handleClose = () => {
    setObjectiveModalOpen(false);
    setEditingObjective(null);
    form.reset();
  };

  const handleSubmit = (values: ObjectiveFormData) => {
    const dataToSave = {
      ...values,
      magnification: Number(values.magnification),
      numericalAperture: Number(values.numericalAperture),
    };
    if (isEditing && editingObjective) {
      updateObjective(editingObjective.id, dataToSave);
      setNotification({
        message: '物镜信息已更新',
        type: 'success',
      });
    } else {
      addObjective(dataToSave);
      setNotification({
        message: '物镜添加成功',
        type: 'success',
      });
    }
    handleClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={isEditing ? '编辑物镜' : '新增物镜'}
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="物镜编号"
            placeholder="例如: ZEISS-2024-001"
            {...form.getInputProps('serialNumber')}
          />

          <Select
            label="品牌"
            placeholder="选择品牌"
            data={BRAND_OPTIONS.map((b) => ({ value: b, label: b }))}
            {...form.getInputProps('brand')}
          />

          <Group grow>
            <Select
              label="倍率"
              placeholder="选择倍率"
              data={MAGNIFICATION_OPTIONS.map((m) => ({
                value: m.toString(),
                label: `${m}×`,
              }))}
              value={form.values.magnification.toString()}
              onChange={(value) =>
                form.setFieldValue('magnification', Number(value) || 0)
              }
              error={form.errors.magnification}
            />

            <NumberInput
              label="数值孔径 (NA)"
              placeholder="0.25"
              min={0}
              max={1.65}
              step={0.05}
              decimalScale={2}
              {...form.getInputProps('numericalAperture')}
            />
          </Group>

          <Select
            label="接口规格"
            placeholder="选择接口规格"
            data={INTERFACE_OPTIONS.map((i) => ({ value: i, label: i }))}
            {...form.getInputProps('interfaceSpec')}
          />

          <Select
            label="镀膜状态"
            placeholder="选择镀膜状态"
            data={COATING_OPTIONS.map((c) => ({ value: c, label: c }))}
            {...form.getInputProps('coatingStatus')}
          />

          <TextInput
            label="保存位置"
            placeholder="例如: A-01-03"
            {...form.getInputProps('storageLocation')}
          />

          <Select
            label="物镜状态"
            data={[
              { value: 'normal', label: '完好' },
              { value: 'scratched', label: '有划痕' },
              { value: 'moldy', label: '有霉斑' },
              { value: 'coating_damaged', label: '镀膜损伤' },
              { value: 'in_repair', label: '维修中' },
              { value: 'scrapped', label: '已报废' },
            ]}
            {...form.getInputProps('status')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose}>
              取消
            </Button>
            <Button type="submit">{isEditing ? '保存' : '添加'}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
