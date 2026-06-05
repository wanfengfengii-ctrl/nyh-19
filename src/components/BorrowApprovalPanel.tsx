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
import { IconCheck, IconX, IconUser, IconCalendar, IconAlertCircle } from '@tabler/icons-react';
import { useApprovalStore, useApplications } from '../store/approvalStore';
import { useObjectives } from '../store/inventoryStore';
import { useBorrowStore } from '../store/borrowStore';
import { ModalDialog, DataTable } from './common';
import type { BorrowApplication, TableColumn } from '../types';
import {
  APPROVAL_STATUS_LABELS,
  APPROVAL_STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from '../types/constants';

export function BorrowApprovalPanel() {
  const applications = useApplications();
  const approveApplication = useApprovalStore((state) => state.approveApplication);
  const rejectApplication = useApprovalStore((state) => state.rejectApplication);
  const objectives = useObjectives();
  const detectBorrowConflict = useBorrowStore((state) => state.detectBorrowConflict);

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const pendingApps = applications.filter((a) => a.status === 'pending');
  const approvedApps = applications.filter((a) => a.status === 'approved');
  const rejectedApps = applications.filter((a) => a.status === 'rejected');

  const getObjective = (id: string) => objectives.find((o) => o.id === id);

  const handleApprove = (id: string) => {
    const app = applications.find((a) => a.id === id);
    if (app) {
      const conflict = detectBorrowConflict(
        app.objectiveId,
        app.requestedBorrowDate,
        app.requestedReturnDate
      );
      if (conflict) {
        if (
          !window.confirm(
            `检测到借用冲突：该物镜在申请时间段内已被${conflict.existingBorrow.borrowerName}借用，重叠${conflict.overlapDays}天。是否仍要批准？`
          )
        ) {
          return;
        }
      }
      approveApplication(id, '管理员');
    }
  };

  const handleReject = () => {
    if (selectedAppId && rejectReason.trim()) {
      rejectApplication(selectedAppId, '管理员', rejectReason);
      setRejectModalOpen(false);
      setRejectReason('');
      setSelectedAppId(null);
    }
  };

  const columns: TableColumn<BorrowApplication>[] = [
    {
      key: 'borrowerName',
      title: '申请人',
      render: (app) => (
        <Group>
          <Avatar size="sm" radius="xl">
            <IconUser size={16} />
          </Avatar>
          <div>
            <Text size="sm" fw={500}>
              {app.borrowerName}
            </Text>
            <Text size="xs" c="dimmed">
              {app.borrowerDepartment}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: 'objectiveId',
      title: '物镜',
      render: (app) => {
        const objective = getObjective(app.objectiveId);
        return (
          <div>
            <Text size="sm" fw={500}>
              {objective?.serialNumber || app.objectiveId}
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
      title: '用途',
      render: (app) => <Text size="sm">{app.reason}</Text>,
    },
    {
      key: 'priority',
      title: '优先级',
      render: (app) => (
        <Badge
          color={PRIORITY_COLORS[app.priority as keyof typeof PRIORITY_COLORS]}
          size="sm"
        >
          {PRIORITY_LABELS[app.priority as keyof typeof PRIORITY_LABELS]}
        </Badge>
      ),
    },
    {
      key: 'requestedBorrowDate',
      title: '借用时间',
      render: (app) => {
        const conflict = detectBorrowConflict(
          app.objectiveId,
          app.requestedBorrowDate,
          app.requestedReturnDate
        );
        return (
          <div>
            <Group gap="xs">
              <IconCalendar size={14} />
              <Text size="sm">
                {app.requestedBorrowDate} ~ {app.requestedReturnDate}
              </Text>
            </Group>
            {conflict && app.status === 'pending' && (
              <Group gap="xs" mt="xs" c="red">
                <IconAlertCircle size={14} />
                <Text size="xs">借用冲突</Text>
              </Group>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      title: '状态',
      render: (app) => (
        <Badge color={APPROVAL_STATUS_COLORS[app.status]} size="sm">
          {APPROVAL_STATUS_LABELS[app.status]}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      render: (app) =>
        app.status === 'pending' ? (
          <Group gap="xs">
            <Button
              size="xs"
              leftSection={<IconCheck size={14} />}
              onClick={() => handleApprove(app.id)}
            >
              批准
            </Button>
            <Button
              size="xs"
              variant="light"
              color="red"
              leftSection={<IconX size={14} />}
              onClick={() => {
                setSelectedAppId(app.id);
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
          <Title order={3}>借用申请审批</Title>
          <Group>
            <Badge size="lg" color="yellow">
              待审批: {pendingApps.length}
            </Badge>
            <Badge size="lg" color="green">
              已批准: {approvedApps.length}
            </Badge>
            <Badge size="lg" color="gray">
              已拒绝: {rejectedApps.length}
            </Badge>
          </Group>
        </Group>

        <DataTable<BorrowApplication>
          data={applications}
          columns={columns}
          keyExtractor={(app) => app.id}
          emptyMessage="暂无借用申请"
        />
      </Paper>

      <ModalDialog
        opened={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setRejectReason('');
          setSelectedAppId(null);
        }}
        title="拒绝借用申请"
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
