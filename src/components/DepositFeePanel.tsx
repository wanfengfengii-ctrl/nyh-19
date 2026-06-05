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
} from '@mantine/core';
import { IconCash, IconCheck, IconUser, IconReceipt } from '@tabler/icons-react';
import { useObjectiveStore } from '../store/objectiveStore';

export function DepositFeePanel() {
  const depositRecords = useObjectiveStore((state) => state.depositRecords);
  const addDepositRecord = useObjectiveStore((state) => state.addDepositRecord);
  const returnDeposit = useObjectiveStore((state) => state.returnDeposit);
  const borrowRecords = useObjectiveStore((state) => state.borrowRecords);
  const objectives = useObjectiveStore((state) => state.objectives);
  
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedBorrowId, setSelectedBorrowId] = useState('');
  const [depositAmount, setDepositAmount] = useState<number | string>(200);
  const [depositNotes, setDepositNotes] = useState('');

  const getObjective = (id: string) => objectives.find((o) => o.id === id);
  const getBorrowRecord = (id: string) => borrowRecords.find((r) => r.id === id);

  const activeDeposits = depositRecords.filter((r) => !r.returned);
  const totalDepositAmount = activeDeposits.reduce((sum, r) => sum + r.amount, 0);

  const activeBorrows = borrowRecords.filter(
    (r) => (r.status === 'borrowed' || r.status === 'overdue') && !r.depositAmount
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

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>押金与费用管理</Title>
          <Group>
            <Badge size="lg" color="orange">在押: ¥{totalDepositAmount}</Badge>
            <Badge size="lg" color="blue">未退还: {activeDeposits.length}</Badge>
            <Button
              leftSection={<IconCash size={16} />}
              onClick={() => setDepositModalOpen(true)}
            >
              收取押金
            </Button>
          </Group>
        </Group>

        <ScrollArea>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>借用人</Table.Th>
                <Table.Th>物镜</Table.Th>
                <Table.Th>押金金额</Table.Th>
                <Table.Th>收取时间</Table.Th>
                <Table.Th>状态</Table.Th>
                <Table.Th>退还时间</Table.Th>
                <Table.Th>操作</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {depositRecords.length > 0 ? (
                depositRecords.map((record) => {
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
                        <Group gap="xs">
                          <IconReceipt size={14} />
                          <Text size="sm" fw={500}>¥{record.amount}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{record.paidAt.split('T')[0]}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={record.returned ? 'green' : 'yellow'} size="sm">
                          {record.returned ? '已退还' : '在押'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {record.returnedAt ? record.returnedAt.split('T')[0] : '-'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {!record.returned && (
                          <Button
                            size="xs"
                            leftSection={<IconCheck size={14} />}
                            onClick={() => handleReturnDeposit(record.id)}
                          >
                            退还押金
                          </Button>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={7} align="center" py="xl">
                    <Text c="dimmed">暂无押金记录</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      <Modal
        opened={depositModalOpen}
        onClose={() => {
          setDepositModalOpen(false);
          setSelectedBorrowId('');
          setDepositAmount(200);
          setDepositNotes('');
        }}
        title="收取押金"
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
              onChange={(e) => setSelectedBorrowId(e.target.value)}
            >
              <option value="">请选择借用记录</option>
              {activeBorrows.map((borrow) => {
                const objective = getObjective(borrow.objectiveId);
                return (
                  <option key={borrow.id} value={borrow.id}>
                    {borrow.borrowerName} - {objective?.serialNumber || borrow.objectiveId}
                  </option>
                );
              })}
            </select>
          </div>

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

          <Divider />
          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={() => {
                setDepositModalOpen(false);
                setSelectedBorrowId('');
                setDepositAmount(200);
                setDepositNotes('');
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleAddDeposit}
              disabled={!selectedBorrowId || !depositAmount || Number(depositAmount) <= 0}
            >
              确认收取
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
