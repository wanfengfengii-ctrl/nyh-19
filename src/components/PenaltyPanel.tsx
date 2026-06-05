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
import { IconCheck, IconUser, IconReceipt, IconAlertTriangle } from '@tabler/icons-react';
import {
  useFinanceStore,
  usePenaltyRecords,
} from '../store/financeStore';
import { useBorrowRecords } from '../store/borrowStore';
import { useObjectives } from '../store/inventoryStore';
import { ModalDialog, DataTable } from './common';
import type { PenaltyRecord, TableColumn } from '../types';
import { PENALTY_TYPE_LABELS } from '../types/constants';

export function PenaltyPanel() {
  const penaltyRecords = usePenaltyRecords();
  const addPenaltyRecord = useFinanceStore((state) => state.addPenaltyRecord);
  const markPenaltyPaid = useFinanceStore((state) => state.markPenaltyPaid);
  const calculateOverduePenalty = useFinanceStore(
    (state) => state.calculateOverduePenalty
  );
  const borrowRecords = useBorrowRecords();
  const objectives = useObjectives();

  const [penaltyModalOpen, setPenaltyModalOpen] = useState(false);
  const [selectedBorrowId, setSelectedBorrowId] = useState('');
  const [penaltyType, setPenaltyType] = useState<
    'overdue_fee' | 'damage_compensation' | 'rule_violation'
  >('overdue_fee');
  const [penaltyAmount, setPenaltyAmount] = useState<number | string>(0);
  const [penaltyReason, setPenaltyReason] = useState('');

  const getObjective = (id: string) => objectives.find((o) => o.id === id);
  const getBorrowRecord = (id: string) => borrowRecords.find((r) => r.id === id);

  const unpaidPenalties = penaltyRecords.filter((r) => !r.paid);
  const totalUnpaidAmount = unpaidPenalties.reduce((sum, r) => sum + r.amount, 0);

  const overdueRecords = borrowRecords.filter((r) => r.status === 'overdue');

  const handleAddPenalty = () => {
    const amount = Number(penaltyAmount);
    if (selectedBorrowId && amount > 0 && penaltyReason.trim()) {
      const borrow = getBorrowRecord(selectedBorrowId);
      if (borrow) {
        addPenaltyRecord({
          borrowRecordId: selectedBorrowId,
          objectiveId: borrow.objectiveId,
          borrowerName: borrow.borrowerName,
          type: penaltyType,
          amount,
          reason: penaltyReason,
          issuedBy: '管理员',
        });
        setPenaltyModalOpen(false);
        setSelectedBorrowId('');
        setPenaltyType('overdue_fee');
        setPenaltyAmount(0);
        setPenaltyReason('');
      }
    }
  };

  const handleMarkPaid = (id: string) => {
    markPenaltyPaid(id);
  };

  const handleBorrowChange = (value: string) => {
    setSelectedBorrowId(value);
    if (value && penaltyType === 'overdue_fee') {
      const calculated = calculateOverduePenalty(value);
      setPenaltyAmount(calculated);
    }
  };

  const columns: TableColumn<PenaltyRecord>[] = [
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
      key: 'type',
      title: '处罚类型',
      render: (record) => (
        <Badge color="orange" size="sm">
          {PENALTY_TYPE_LABELS[record.type]}
        </Badge>
      ),
    },
    {
      key: 'amount',
      title: '处罚金额',
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
      key: 'reason',
      title: '处罚原因',
      render: (record) => <Text size="sm">{record.reason}</Text>,
    },
    {
      key: 'issuedAt',
      title: '开具时间',
      render: (record) => (
        <Text size="sm">{record.issuedAt.split('T')[0]}</Text>
      ),
    },
    {
      key: 'paid',
      title: '状态',
      render: (record) => (
        <Badge color={record.paid ? 'green' : 'red'} size="sm">
          {record.paid ? '已缴纳' : '未缴纳'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      render: (record) =>
        !record.paid ? (
          <Button
            size="xs"
            leftSection={<IconCheck size={14} />}
            onClick={() => handleMarkPaid(record.id)}
          >
            确认缴纳
          </Button>
        ) : null,
    },
  ];

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>逾期处罚管理</Title>
          <Group>
            <Badge size="lg" color="red">
              未缴纳: ¥{totalUnpaidAmount}
            </Badge>
            <Badge size="lg" color="orange">
              待处理: {unpaidPenalties.length}
            </Badge>
            <Button
              leftSection={<IconAlertTriangle size={16} />}
              color="red"
              onClick={() => setPenaltyModalOpen(true)}
            >
              开具处罚
            </Button>
          </Group>
        </Group>

        <DataTable<PenaltyRecord>
          data={penaltyRecords}
          columns={columns}
          keyExtractor={(record) => record.id}
          emptyMessage="暂无处罚记录"
        />
      </Paper>

      <ModalDialog
        opened={penaltyModalOpen}
        onClose={() => {
          setPenaltyModalOpen(false);
          setSelectedBorrowId('');
          setPenaltyType('overdue_fee');
          setPenaltyAmount(0);
          setPenaltyReason('');
        }}
        title="开具处罚"
        onConfirm={handleAddPenalty}
        confirmLabel="确认开具"
        confirmDisabled={
          !selectedBorrowId ||
          !penaltyAmount ||
          Number(penaltyAmount) <= 0 ||
          !penaltyReason.trim()
        }
        confirmColor="red"
      >
        <Select
          label="选择借用记录"
          placeholder="请选择借用记录"
          value={selectedBorrowId}
          onChange={(value) => handleBorrowChange(value || '')}
          data={overdueRecords.map((borrow) => {
            const objective = getObjective(borrow.objectiveId);
            return {
              value: borrow.id,
              label: `${borrow.borrowerName} - ${objective?.serialNumber || borrow.objectiveId} (逾期)`,
            };
          })}
          clearable
        />

        <Select
          label="处罚类型"
          value={penaltyType}
          onChange={(value) =>
            setPenaltyType(
              (value as 'overdue_fee' | 'damage_compensation' | 'rule_violation') ||
                'overdue_fee'
            )
          }
          data={[
            { value: 'overdue_fee', label: '逾期费用' },
            { value: 'damage_compensation', label: '损坏赔偿' },
            { value: 'rule_violation', label: '违规处罚' },
          ]}
        />

        <NumberInput
          label="处罚金额"
          placeholder="请输入处罚金额"
          value={penaltyAmount}
          onChange={setPenaltyAmount}
          min={0}
          prefix="¥"
        />

        <Textarea
          label="处罚原因"
          placeholder="请详细说明处罚原因..."
          value={penaltyReason}
          onChange={(e) => setPenaltyReason(e.target.value)}
          minRows={3}
          required
        />
      </ModalDialog>
    </Stack>
  );
}
