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
  Textarea,
  Stack,
  Avatar,
  ScrollArea,
  Divider,
} from '@mantine/core';
import { IconCheck, IconX, IconUser, IconCalendar, IconRefresh } from '@tabler/icons-react';
import { useObjectiveStore } from '../store/objectiveStore';
import {
  RENEWAL_STATUS_LABELS,
  RENEWAL_STATUS_COLORS,
} from '../types';

export function RenewalPanel() {
  const renewalRequests = useObjectiveStore((state) => state.renewalRequests);
  const approveRenewalRequest = useObjectiveStore((state) => state.approveRenewalRequest);
  const rejectRenewalRequest = useObjectiveStore((state) => state.rejectRenewalRequest);
  const objectives = useObjectiveStore((state) => state.objectives);
  
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const getObjective = (id: string) => objectives.find((o) => o.id === id);

  const pendingRequests = renewalRequests.filter((r) => r.status === 'pending');
  const approvedRequests = renewalRequests.filter((r) => r.status === 'approved');
  const rejectedRequests = renewalRequests.filter((r) => r.status === 'rejected');

  const handleApprove = (id: string) => {
    approveRenewalRequest(id, '管理员');
  };

  const handleReject = () => {
    if (selectedRequest && rejectReason.trim()) {
      rejectRenewalRequest(selectedRequest, '管理员', rejectReason);
      setRejectModalOpen(false);
      setRejectReason('');
      setSelectedRequest(null);
    }
  };

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>续借申请管理</Title>
          <Group>
            <Badge size="lg" color="yellow">待审批: {pendingRequests.length}</Badge>
            <Badge size="lg" color="green">已批准: {approvedRequests.length}</Badge>
            <Badge size="lg" color="gray">已拒绝: {rejectedRequests.length}</Badge>
          </Group>
        </Group>

        <ScrollArea>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>借用人</Table.Th>
                <Table.Th>物镜</Table.Th>
                <Table.Th>续借原因</Table.Th>
                <Table.Th>当前到期日</Table.Th>
                <Table.Th>申请到期日</Table.Th>
                <Table.Th>状态</Table.Th>
                <Table.Th>操作</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {renewalRequests.length > 0 ? (
                renewalRequests.map((request) => {
                  const objective = getObjective(request.objectiveId);
                  return (
                    <Table.Tr key={request.id}>
                      <Table.Td>
                        <Group>
                          <Avatar size="sm" radius="xl">
                            <IconUser size={16} />
                          </Avatar>
                          <Text size="sm" fw={500}>{request.borrowerName}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <div>
                          <Text size="sm" fw={500}>{objective?.serialNumber || request.objectiveId}</Text>
                          <Text size="xs" c="dimmed">{objective?.brand} {objective?.magnification}x</Text>
                        </div>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{request.reason}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <IconCalendar size={14} />
                          <Text size="sm">{request.currentReturnDate}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <IconRefresh size={14} />
                          <Text size="sm">{request.requestedReturnDate}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={RENEWAL_STATUS_COLORS[request.status]} size="sm">
                          {RENEWAL_STATUS_LABELS[request.status]}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {request.status === 'pending' && (
                          <Group gap="xs">
                            <Button
                              size="xs"
                              leftSection={<IconCheck size={14} />}
                              onClick={() => handleApprove(request.id)}
                            >
                              批准
                            </Button>
                            <Button
                              size="xs"
                              variant="light"
                              color="red"
                              leftSection={<IconX size={14} />}
                              onClick={() => {
                                setSelectedRequest(request.id);
                                setRejectModalOpen(true);
                              }}
                            >
                              拒绝
                            </Button>
                          </Group>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={7} align="center" py="xl">
                    <Text c="dimmed">暂无续借申请</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      <Modal
        opened={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setRejectReason('');
          setSelectedRequest(null);
        }}
        title="拒绝续借申请"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">请填写拒绝原因：</Text>
          <Textarea
            placeholder="请输入拒绝原因..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            minRows={4}
          />
          <Divider />
          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={() => {
                setRejectModalOpen(false);
                setRejectReason('');
                setSelectedRequest(null);
              }}
            >
              取消
            </Button>
            <Button
              color="red"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
            >
              确认拒绝
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
