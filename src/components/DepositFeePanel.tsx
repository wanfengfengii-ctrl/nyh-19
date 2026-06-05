import { useState } from 'react';
import {
  Paper,
  Title,
  Badge,
  Group,
  Button,
  Text,
  NumberInput,
  Stack,
  Avatar,
  Select,
  Textarea,
} from '@mantine/core';
import { IconCash, IconCheck, IconUser, IconReceipt } from '@tabler/icons-react';
import {
  useFinanceStore,
  useDepositRecords,
} from '../store/financeStore';
import { useBorrowRecords } from '../store/borrowStore';
import { useObjectives } from '../store/inventoryStore';
import { ModalDialog, DataTable } from './common';
import type { DepositRecord, TableColumn } from '../types';

export function DepositFeePanel() {
  const depositRecords = useDepositRecords();
  const addDepositRecord = useFinanceStore((state) => state.addDepositRecord);
  const returnDeposit = useFinanceStore((state) => state.returnDeposit);
  const borrowRecords = useBorrowRecords();
  const objectives = useObjectives();

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedBorrowId, setSelectedBorrowId] = useState('');
  const [depositAmount, setDepositAmount] = useState<number | string>(200);
  const [depositNotes, setDepositNotes] = useState('');

  const getObjective = (id: string) => objectives.find((o) => o.id === id);
  const getBorrowRecord = (id: string) => borrowRecords.find((r) => r.id === id);

  const activeDeposits = depositRecords.filter((r) => !r.returned);
  const totalDepositAmount = activeDeposits.reduce((sum, r) => sum + r.amount, 0);

  const activeBorrows = borrowRecords.filter(
    (r) =>
      (r.status === 'borrowed' || r.status === 'overdue') && !r.depositAmount
  );

  const handleAddDeposit = () => {
    const amount = Number(depositAmount);
    if (selectedBorrowId && amount > 0) {
      const borrow = getBorrowRecord(selectedBorrowId);
      if (borrow) {
        addDepositRecord({
          borrowRecordId: selectedBorrowId,
          objectiveId: borrow.objectiveId,
          borrowerName: borrow.borrowerName,
          amount,
          paidAt: new Date().toISOString(),
          notes: depositNotes,
        });
        setDepositModalOpen(false);
        setSelectedBorrowId('');
        setDepositAmount(200);
        setDepositNotes('');
      }
    }
  };

  const handleReturnDeposit = (id: string) => {
    returnDeposit(id);
  };

  const columns: TableColumn<DepositRecord>[] = [
    {
      key: 'borrowerName',
      title: '借用人',
      render: (record) => (
        <Group>
          <Avatar size="sm" radius="xl">
            <IconUser size={16} />
          </Avatar>
          <Text size="sm" fw={500}>
            {record.borrowerName}
          </Text>
        </Group>
      ),
    },
    {
      key: 'objectiveId',
      title: '物镜',
      render: (record) => {
        const objective = getObjective(record.objectiveId);
        return (
          <div>
            <Text size="sm" fw={500}>
              {objective?.serialNumber || record.objectiveId}
            </Text>
            <Text size="xs" c="dimmed">
              {objective?.brand} {objective?.magnification}x
            </Text>
          </div>
        );
      },
    },
    {
      key: 'amount',
      title: '押金金额',
      render: (record) => (
        <Group gap="xs">
          <IconReceipt size={14} />
          <Text size="sm" fw={500}>
            ¥{record.amount}
          </Text>
        </Group>
      ),
    },
    {
      key: 'paidAt',
      title: '收取时间',
      render: (record) => (
        <Text size="sm">{record.paidAt.split('T')[0]}</Text>
      ),
    },
    {
      key: 'returned',
      title: '状态',
      render: (record) => (
        <Badge color={record.returned ? 'green' : 'yellow'} size="sm">
          {record.returned ? '已退还' : '在押'}
        </Badge>
      ),
    },
    {
      key: 'returnedAt',
      title: '退还时间',
      render: (record) => (
        <Text size="sm">
          {record.returnedAt ? record.returnedAt.split('T')[0] : '-'}
        </Text>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      render: (record) =>
        !record.returned ? (
          <Button
            size="xs"
            leftSection={<IconCheck size={14} />}
            onClick={() => handleReturnDeposit(record.id)}
          >
            退还押金
          </Button>
        ) : null,
    },
  ];

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>押金与费用管理</Title>
          <Group>
            <Badge size="lg" color="orange">
              在押: ¥{totalDepositAmount}
            </Badge>
            <Badge size="lg" color="blue">
              未退还: {activeDeposits.length}
            </Badge>
            <Button
              leftSection={<IconCash size={16} />}
              onClick={() => setDepositModalOpen(true)}
            >
              收取押金
            </Button>
          </Group>
        </Group>

        <DataTable<DepositRecord>
          data={depositRecords}
          columns={columns}
          keyExtractor={(record) => record.id}
          emptyMessage="暂无押金记录"
        />
      </Paper>

      <ModalDialog
        opened={depositModalOpen}
        onClose={() => {
          setDepositModalOpen(false);
          setSelectedBorrowId('');
          setDepositAmount(200);
          setDepositNotes('');
        }}
        title="收取押金"
        onConfirm={handleAddDeposit}
        confirmLabel="确认收取"
        confirmDisabled={
          !selectedBorrowId || !depositAmount || Number(depositAmount) <= 0
        }
      >
        <Select
          label="选择借用记录"
          placeholder="请选择借用记录"
          value={selectedBorrowId}
          onChange={(value) => setSelectedBorrowId(value || '')}
          data={activeBorrows.map((borrow) => {
            const objective = getObjective(borrow.objectiveId);
            return {
              value: borrow.id,
              label: `${borrow.borrowerName} - ${objective?.serialNumber || borrow.objectiveId}`,
            };
          })}
          clearable
        />

        <NumberInput
          label="押金金额"
          placeholder="请输入押金金额"
          value={depositAmount}
          onChange={setDepositAmount}
          min={0}
          prefix="¥"
        />

        <Textarea
          label="备注"
          placeholder="可选备注信息..."
          value={depositNotes}
          onChange={(e) => setDepositNotes(e.target.value)}
          minRows={2}
        />
      </ModalDialog>
    </Stack>
  );
}
