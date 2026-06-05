import { useState, useEffect } from 'react';
import {
  Stack,
  TextInput,
  Select,
  Textarea,
  Button,
  Group,
  Text,
  Card,
  Badge,
  Alert,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconAlertCircle, IconUser, IconBuilding, IconPhone, IconCalendar } from '@tabler/icons-react';
import { useObjectiveStore } from '../store/objectiveStore';
import type { BorrowRecord } from '../types';
import { DEPARTMENT_OPTIONS, BORROW_STATUS_LABELS, BORROW_STATUS_COLORS } from '../types';

interface BorrowFormProps {
  objectiveId: string;
  isScrapped: boolean;
}

export function BorrowForm({ objectiveId, isScrapped }: BorrowFormProps) {
  const addBorrowRecord = useObjectiveStore((state) => state.addBorrowRecord);
  const returnObjective = useObjectiveStore((state) => state.returnObjective);
  const getCurrentBorrowRecord = useObjectiveStore((state) => state.getCurrentBorrowRecord);
  const canBorrowObjective = useObjectiveStore((state) => state.canBorrowObjective);

  const currentBorrow = getCurrentBorrowRecord(objectiveId);
  const { canBorrow, reason: borrowReason } = canBorrowObjective(objectiveId);

  const [mode, setMode] = useState<'borrow' | 'return'>(currentBorrow ? 'return' : 'borrow');

  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerDepartment, setBorrowerDepartment] = useState('');
  const [borrowerContact, setBorrowerContact] = useState('');
  const [reason, setReason] = useState('');
  const [borrowDate, setBorrowDate] = useState<Date | null>(new Date());
  const [expectedReturnDate, setExpectedReturnDate] = useState<Date | null>(null);
  const [borrowNotes, setBorrowNotes] = useState('');

  const [actualReturnDate, setActualReturnDate] = useState<Date | null>(new Date());
  const [returnNotes, setReturnNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMode(currentBorrow ? 'return' : 'borrow');
  }, [currentBorrow]);

  const validateBorrowForm = () => {
    const newErrors: Record<string, string> = {};
    if (!borrowerName.trim()) newErrors.borrowerName = '请输入借用人姓名';
    if (!borrowerDepartment) newErrors.borrowerDepartment = '请选择所属部门';
    if (!borrowerContact.trim()) newErrors.borrowerContact = '请输入联系方式';
    if (!reason.trim()) newErrors.reason = '请输入借用原因';
    if (!borrowDate) newErrors.borrowDate = '请选择借出日期';
    if (!expectedReturnDate) newErrors.expectedReturnDate = '请选择预计归还日期';
    if (borrowDate && expectedReturnDate && expectedReturnDate < borrowDate) {
      newErrors.expectedReturnDate = '预计归还日期不能早于借出日期';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBorrow = () => {
    if (!validateBorrowForm()) return;
    addBorrowRecord({
      objectiveId,
      borrowerName: borrowerName.trim(),
      borrowerDepartment,
      borrowerContact: borrowerContact.trim(),
      reason: reason.trim(),
      borrowDate: borrowDate!.toISOString().split('T')[0],
      expectedReturnDate: expectedReturnDate!.toISOString().split('T')[0],
      notes: borrowNotes.trim() || undefined,
    });
    setBorrowerName('');
    setBorrowerDepartment('');
    setBorrowerContact('');
    setReason('');
    setBorrowDate(new Date());
    setExpectedReturnDate(null);
    setBorrowNotes('');
    setErrors({});
  };

  const handleReturn = () => {
    if (!actualReturnDate) {
      setErrors({ actualReturnDate: '请选择实际归还日期' });
      return;
    }
    if (currentBorrow && actualReturnDate < new Date(currentBorrow.borrowDate)) {
      setErrors({ actualReturnDate: '归还日期不能早于借出日期' });
      return;
    }
    setErrors({});
    returnObjective(
      currentBorrow!.id,
      actualReturnDate.toISOString().split('T')[0],
      returnNotes.trim() || undefined
    );
    setActualReturnDate(new Date());
    setReturnNotes('');
  };

  const renderCurrentBorrowInfo = (record: BorrowRecord) => (
    <Card withBorder p="sm" radius="sm" bg="blue.0" mb="md">
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm" fw={600}>
            当前借用状态
          </Text>
          <Badge color={BORROW_STATUS_COLORS[record.status]} size="lg">
            {BORROW_STATUS_LABELS[record.status]}
          </Badge>
        </Group>
        <Group gap="xs">
          <IconUser size={14} />
          <Text size="sm">
            借用人: <strong>{record.borrowerName}</strong>
          </Text>
        </Group>
        <Group gap="xs">
          <IconBuilding size={14} />
          <Text size="sm">部门: {record.borrowerDepartment}</Text>
        </Group>
        <Group gap="xs">
          <IconPhone size={14} />
          <Text size="sm">联系方式: {record.borrowerContact}</Text>
        </Group>
        <Group gap="xs">
          <IconCalendar size={14} />
          <Text size="sm">
            借出日期: {record.borrowDate} ~ 预计归还: {record.expectedReturnDate}
          </Text>
        </Group>
        <Text size="sm" c="dimmed">
          借用原因: {record.reason}
        </Text>
      </Stack>
    </Card>
  );

  if (isScrapped) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" title="已报废物镜">
        已报废的物镜不能进行借用操作
      </Alert>
    );
  }

  if (mode === 'borrow' && !canBorrow) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="orange" title="无法借出">
        {borrowReason}
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      {currentBorrow && renderCurrentBorrowInfo(currentBorrow)}

      {mode === 'borrow' ? (
        <>
          <Group grow>
            <TextInput
              label="借用人姓名"
              placeholder="请输入姓名"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              error={errors.borrowerName}
              size="sm"
            />
            <Select
              label="所属部门"
              placeholder="请选择部门"
              value={borrowerDepartment}
              onChange={(value) => setBorrowerDepartment(value || '')}
              data={DEPARTMENT_OPTIONS.map((d) => ({ value: d, label: d }))}
              error={errors.borrowerDepartment}
              size="sm"
            />
          </Group>

          <TextInput
            label="联系方式"
            placeholder="请输入电话或邮箱"
            value={borrowerContact}
            onChange={(e) => setBorrowerContact(e.target.value)}
            error={errors.borrowerContact}
            size="sm"
          />

          <Textarea
            label="借用原因"
            placeholder="请详细说明借用用途"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={errors.reason}
            size="sm"
            minRows={2}
          />

          <Group grow>
            <DateInput
              label="借出日期"
              value={borrowDate}
              onChange={setBorrowDate}
              error={errors.borrowDate}
              size="sm"
              maxDate={new Date()}
            />
            <DateInput
              label="预计归还日期"
              value={expectedReturnDate}
              onChange={setExpectedReturnDate}
              error={errors.expectedReturnDate}
              size="sm"
              minDate={borrowDate || new Date()}
            />
          </Group>

          <Textarea
            label="备注（可选）"
            placeholder="其他需要说明的事项"
            value={borrowNotes}
            onChange={(e) => setBorrowNotes(e.target.value)}
            size="sm"
            minRows={2}
          />

          <Button onClick={handleBorrow} color="blue">
            确认借出
          </Button>
        </>
      ) : (
        <>
          <DateInput
            label="实际归还日期"
            value={actualReturnDate}
            onChange={setActualReturnDate}
            error={errors.actualReturnDate}
            size="sm"
            maxDate={new Date()}
          />

          <Textarea
            label="归还备注（可选）"
            placeholder="归还时的状态说明等"
            value={returnNotes}
            onChange={(e) => setReturnNotes(e.target.value)}
            size="sm"
            minRows={2}
          />

          <Button onClick={handleReturn} color="green">
            确认归还
          </Button>
        </>
      )}
    </Stack>
  );
}
