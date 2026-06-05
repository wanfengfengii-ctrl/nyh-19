import dayjs from 'dayjs';
import {
  NumberInput,
  Checkbox,
  Button,
  Stack,
  Group,
  Textarea,
  Alert,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useObjectiveStore } from '../store/objectiveStore';
import type { DamageDetail } from '../types';
import {
  validateTestDate,
  validateClarityScore,
  validateTreatmentAdvice,
} from '../utils/validation';

interface MaintenanceFormProps {
  objectiveId: string;
  isScrapped: boolean;
  onSuccess?: () => void;
}

export function MaintenanceForm({
  objectiveId,
  isScrapped,
  onSuccess,
}: MaintenanceFormProps) {
  const addRecord = useObjectiveStore((state) => state.addRecord);

  const form = useForm({
    initialValues: {
      testDate: new Date(),
      clarityScore: 80,
      hasMold: false,
      hasScratch: false,
      hasCoatingDamage: false,
      treatmentAdvice: '',
    },

    validate: {
      testDate: (value) => validateTestDate(value),
      clarityScore: (value) => validateClarityScore(value),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const adviceError = validateTreatmentAdvice(
      values.treatmentAdvice,
      values.hasMold,
      values.hasScratch,
      values.hasCoatingDamage
    );
    if (adviceError) {
      form.setFieldError('treatmentAdvice', adviceError);
      return;
    }

    const damages: DamageDetail[] = [];
    if (values.hasMold) {
      damages.push({
        type: 'mold',
        severity: 'mild',
        description: values.treatmentAdvice,
      });
    }
    if (values.hasScratch) {
      damages.push({
        type: 'scratch',
        severity: 'mild',
        description: values.treatmentAdvice,
      });
    }
    if (values.hasCoatingDamage) {
      damages.push({
        type: 'coating',
        severity: 'mild',
        description: values.treatmentAdvice,
      });
    }

    addRecord({
      objectiveId,
      testDate: dayjs(values.testDate).format('YYYY-MM-DD'),
      clarityScore: values.clarityScore,
      hasMold: values.hasMold,
      hasScratch: values.hasScratch,
      hasCoatingDamage: values.hasCoatingDamage,
      damages,
      beforeImages: [],
      afterImages: [],
      treatmentAdvice: values.treatmentAdvice,
    });
    form.reset();
    onSuccess?.();
  };

  if (isScrapped) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="无法添加记录"
        color="red"
      >
        已报废物镜不能新增保养记录
      </Alert>
    );
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <Group grow>
          <DateInput
            label="测试日期"
            placeholder="选择日期"
            maxDate={new Date()}
            {...form.getInputProps('testDate')}
          />

          <NumberInput
            label="清晰度评分"
            placeholder="0-100"
            min={0}
            max={100}
            {...form.getInputProps('clarityScore')}
          />
        </Group>

        <Group grow>
          <Checkbox
            label="有霉斑"
            {...form.getInputProps('hasMold', { type: 'checkbox' })}
          />
          <Checkbox
            label="有划痕"
            {...form.getInputProps('hasScratch', { type: 'checkbox' })}
          />
          <Checkbox
            label="有镀膜损伤"
            {...form.getInputProps('hasCoatingDamage', { type: 'checkbox' })}
          />
        </Group>

        {(form.values.hasMold ||
          form.values.hasScratch ||
          form.values.hasCoatingDamage) && (
          <Textarea
            label="处理建议"
            placeholder="请描述问题并给出处理建议..."
            minRows={3}
            required
            {...form.getInputProps('treatmentAdvice')}
          />
        )}

        <Group justify="flex-end">
          <Button type="submit">添加保养记录</Button>
        </Group>
      </Stack>
    </form>
  );
}
