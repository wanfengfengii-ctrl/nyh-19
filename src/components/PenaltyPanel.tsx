import { useState } from 'react';
import {
  Paper,
  Title,
  Table,
  Badge,
  Group,
  Button,
  Text,
  Modal,
  NumberInput,
  Stack,
  Avatar,
  ScrollArea,
  Divider,
  Textarea,
  Select,
} from '@mantine/core';
import { IconCheck, IconUser, IconReceipt, IconAlertTriangle } from '@tabler/icons-react';
import { useObjectiveStore } from '../store/objectiveStore';
import { PENALTY_TYPE_LABELS } from '../types';

export function PenaltyPanel() {
  const penaltyRecords = useObjectiveStore((state) => state.penaltyRecords);
  const addPenaltyRecord = useObjectiveStore((state) => state.addPenaltyRecord);
  const markPenaltyPaid = useObjectiveStore((state) => state.markPenaltyPaid);
  const borrowRecords = useObjectiveStore((state) => state.borrowRecords);
  const objectives = useObjectiveStore((state) => state.objectives);
  const calculateOverduePenalty = useObjectiveStore((state) => state.calculateOverduePenalty);
  
  const [penaltyModalOpen, setPenaltyModalOpen] = useState(false);
  const [selectedBorrowId, setSelectedBorrowId] = useState('');
  const [penaltyType, setPenaltyType] = useState<'overdue_fee' | 'damage_compensation' | 'rule_violation'>('overdue_fee');
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

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>逾期处罚管理</Title>
          <Group>
            <Badge size="lg" color="red">未缴纳: ¥{totalUnpaidAmount}</Badge>
            <Badge size="lg" color="orange">待处理: {unpaidPenalties.length}</Badge>
            <Button
              leftSection={<IconAlertTriangle size={16} />}
              color="red"
              onClick={() => setPenaltyModalOpen(true)}
            >
              开具处罚
            </Button>
          </Group>
        </Group>

        <ScrollArea>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>借用人</Table.Th>
                <Table.Th>物镜</Table.Th>
                <Table.Th>处罚类型</Table.Th>
                <Table.Th>处罚金额</Table.Th>
                <Table.Th>处罚原因</Table.Th>
                <Table.Th>开具时间</Table.Th>
                <Table.Th>状态</Table.Th>
                <Table.Th>操作</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {penaltyRecords.length > 0 ? (
                penaltyRecords.map((record) => {
                  const objective = getObjective(record.objectiveId);
                  return (
                    <Table.Tr key={record.id}>
                      <Table.Td>
                        <Group>
                          <Avatar size="sm" radius="xl">
                            <IconUser size={16} />
                          </Avatar>
                          <Text size="sm" fw={500}>{record.borrowerName}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <div>
                          <Text size="sm" fw={500}>{objective?.serialNumber || record.objectiveId}</Text>
                          <Text size="xs" c="dimmed">{objective?.brand} {objective?.magnification}x</Text>
                        </div>
                      </Table.Td>
                      <Table.Td>
                        <Badge color="orange" size="sm">
                          {PENALTY_TYPE_LABELS[record.type]}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <IconReceipt size={14} />
                          <Text size="sm" fw={500}>¥{record.amount}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{record.reason}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{record.issuedAt.split('T')[0]}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={record.paid ? 'green' : 'red'} size="sm">
                          {record.paid ? '已缴纳' : '未缴纳'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {!record.paid && (
                          <Button
                            size="xs"
                            leftSection={<IconCheck size={14} />}
                            onClick={() => handleMarkPaid(record.id)}
                          >
                            确认缴纳
                          </Button>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={8} align="center" py="xl">
                    <Text c="dimmed">暂无处罚记录</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      <Modal
        opened={penaltyModalOpen}
        onClose={() => {
          setPenaltyModalOpen(false);
          setSelectedBorrowId('');
          setPenaltyType('overdue_fee');
          setPenaltyAmount(0);
          setPenaltyReason('');
        }}
        title="开具处罚"
      >
        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} mb="xs">选择借用记录</Text>
            <select
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #ced4da',
              }}
              value={selectedBorrowId}
              onChange={(e) => handleBorrowChange(e.target.value)}
            >
              <option value="">请选择借用记录</option>
              {overdueRecords.map((borrow) => {
                const objective = getObjective(borrow.objectiveId);
                return (
                  <option key={borrow.id} value={borrow.id}>
                    {borrow.borrowerName} - {objective?.serialNumber || borrow.objectiveId} (逾期)
                  </option>
                );
              })}
            </select>
          </div>

          <Select
            label="处罚类型"
            value={penaltyType}
            onChange={(value) => setPenaltyType(value as any)}
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

          <Divider />
          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={() => {
                setPenaltyModalOpen(false);
                setSelectedBorrowId('');
                setPenaltyType('overdue_fee');
                setPenaltyAmount(0);
                setPenaltyReason('');
              }}
            >
              取消
            </Button>
            <Button
              color="red"
              onClick={handleAddPenalty}
              disabled={!selectedBorrowId || !penaltyAmount || Number(penaltyAmount) <= 0 || !penaltyReason.trim()}
            >
              确认开具
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
