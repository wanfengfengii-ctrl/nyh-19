import { useState } from 'react';
import {
  Paper,
  Title,
  Badge,
  Group,
  Button,
  Text,
  Textarea,
  Stack,
  Avatar,
} from '@mantine/core';
import { IconCheck, IconX, IconUser, IconCalendar, IconRefresh } from '@tabler/icons-react';
import { useBorrowStore, useRenewalRequests } from '../store/borrowStore';
import { useObjectives } from '../store/inventoryStore';
import { ModalDialog, DataTable } from './common';
import type { RenewalRequest, TableColumn } from '../types';
import {
  RENEWAL_STATUS_LABELS,
  RENEWAL_STATUS_COLORS,
} from '../types/constants';

export function RenewalPanel() {
  const renewalRequests = useRenewalRequests();
  const approveRenewalRequest = useBorrowStore((state) => state.approveRenewalRequest);
  const rejectRenewalRequest = useBorrowStore((state) => state.rejectRenewalRequest);
  const objectives = useObjectives();

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
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
    if (selectedRequestId && rejectReason.trim()) {
      rejectRenewalRequest(selectedRequestId, '管理员', rejectReason);
      setRejectModalOpen(false);
      setRejectReason('');
      setSelectedRequestId(null);
    }
  };

  const columns: TableColumn<RenewalRequest>[] = [
    {
      key: 'borrowerName',
      title: '借用人',
      render: (request) => (
        <Group>
          <Avatar size="sm" radius="xl">
            <IconUser size={16} />
          </Avatar>
          <Text size="sm" fw={500}>
            {request.borrowerName}
          </Text>
        </Group>
      ),
    },
    {
      key: 'objectiveId',
      title: '物镜',
      render: (request) => {
        const objective = getObjective(request.objectiveId);
        return (
          <div>
            <Text size="sm" fw={500}>
              {objective?.serialNumber || request.objectiveId}
            </Text>
            <Text size="xs" c="dimmed">
              {objective?.brand} {objective?.magnification}x
            </Text>
          </div>
        );
      },
    },
    {
      key: 'reason',
      title: '续借原因',
      render: (request) => <Text size="sm">{request.reason}</Text>,
    },
    {
      key: 'currentReturnDate',
      title: '当前到期日',
      render: (request) => (
        <Group gap="xs">
          <IconCalendar size={14} />
          <Text size="sm">{request.currentReturnDate}</Text>
        </Group>
      ),
    },
    {
      key: 'requestedReturnDate',
      title: '申请到期日',
      render: (request) => (
        <Group gap="xs">
          <IconRefresh size={14} />
          <Text size="sm">{request.requestedReturnDate}</Text>
        </Group>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (request) => (
        <Badge color={RENEWAL_STATUS_COLORS[request.status]} size="sm">
          {RENEWAL_STATUS_LABELS[request.status]}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      render: (request) =>
        request.status === 'pending' ? (
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
                setSelectedRequestId(request.id);
                setRejectModalOpen(true);
              }}
            >
              拒绝
            </Button>
          </Group>
        ) : null,
    },
  ];

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>续借申请管理</Title>
          <Group>
            <Badge size="lg" color="yellow">
              待审批: {pendingRequests.length}
            </Badge>
            <Badge size="lg" color="green">
              已批准: {approvedRequests.length}
            </Badge>
            <Badge size="lg" color="gray">
              已拒绝: {rejectedRequests.length}
            </Badge>
          </Group>
        </Group>

        <DataTable<RenewalRequest>
          data={renewalRequests}
          columns={columns}
          keyExtractor={(request) => request.id}
          emptyMessage="暂无续借申请"
        />
      </Paper>

      <ModalDialog
        opened={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setRejectReason('');
          setSelectedRequestId(null);
        }}
        title="拒绝续借申请"
        onConfirm={handleReject}
        confirmLabel="确认拒绝"
        confirmDisabled={!rejectReason.trim()}
        confirmColor="red"
      >
        <Text size="sm" c="dimmed">
          请填写拒绝原因：
        </Text>
        <Textarea
          placeholder="请输入拒绝原因..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          minRows={4}
        />
      </ModalDialog>
    </Stack>
  );
}
