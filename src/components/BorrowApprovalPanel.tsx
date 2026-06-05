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
import { IconCheck, IconX, IconUser, IconCalendar, IconAlertCircle } from '@tabler/icons-react';
import { useObjectiveStore } from '../store/objectiveStore';
import {
  APPROVAL_STATUS_LABELS,
  APPROVAL_STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from '../types';

export function BorrowApprovalPanel() {
  const borrowApplications = useObjectiveStore((state) => state.borrowApplications);
  const approveBorrowApplication = useObjectiveStore((state) => state.approveBorrowApplication);
  const rejectBorrowApplication = useObjectiveStore((state) => state.rejectBorrowApplication);
  const objectives = useObjectiveStore((state) => state.objectives);
  const detectBorrowConflict = useObjectiveStore((state) => state.detectBorrowConflict);
  
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const pendingApps = borrowApplications.filter((a) => a.status === 'pending');
  const approvedApps = borrowApplications.filter((a) => a.status === 'approved');
  const rejectedApps = borrowApplications.filter((a) => a.status === 'rejected');

  const getObjective = (id: string) => objectives.find((o) => o.id === id);

  const handleApprove = (id: string) => {
    const app = borrowApplications.find((a) => a.id === id);
    if (app) {
      const conflict = detectBorrowConflict(app.objectiveId, app.requestedBorrowDate, app.requestedReturnDate);
      if (conflict) {
        if (!window.confirm(`检测到借用冲突：该物镜在申请时间段内已被${conflict.existingBorrow.borrowerName}借用，重叠${conflict.overlapDays}天。是否仍要批准？`)) {
          return;
        }
      }
      approveBorrowApplication(id, '管理员');
    }
  };

  const handleReject = () => {
    if (selectedApp && rejectReason.trim()) {
      rejectBorrowApplication(selectedApp, '管理员', rejectReason);
      setRejectModalOpen(false);
      setRejectReason('');
      setSelectedApp(null);
    }
  };

  const renderApplicationRow = (app: typeof borrowApplications[0]) => {
    const objective = getObjective(app.objectiveId);
    const conflict = detectBorrowConflict(app.objectiveId, app.requestedBorrowDate, app.requestedReturnDate);
    
    return (
      <Table.Tr key={app.id}>
        <Table.Td>
          <Group>
            <Avatar size="sm" radius="xl">
              <IconUser size={16} />
            </Avatar>
            <div>
              <Text size="sm" fw={500}>{app.borrowerName}</Text>
              <Text size="xs" c="dimmed">{app.borrowerDepartment}</Text>
            </div>
          </Group>
        </Table.Td>
        <Table.Td>
          <div>
            <Text size="sm" fw={500}>{objective?.serialNumber || app.objectiveId}</Text>
            <Text size="xs" c="dimmed">{objective?.brand} {objective?.magnification}x</Text>
          </div>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{app.reason}</Text>
        </Table.Td>
        <Table.Td>
          <Badge color={PRIORITY_COLORS[app.priority]} size="sm">
            {PRIORITY_LABELS[app.priority]}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Group gap="xs">
            <IconCalendar size={14} />
            <Text size="sm">{app.requestedBorrowDate} ~ {app.requestedReturnDate}</Text>
          </Group>
          {conflict && app.status === 'pending' && (
            <Group gap="xs" mt="xs" c="red">
              <IconAlertCircle size={14} />
              <Text size="xs">借用冲突</Text>
            </Group>
          )}
        </Table.Td>
        <Table.Td>
          <Badge color={APPROVAL_STATUS_COLORS[app.status]} size="sm">
            {APPROVAL_STATUS_LABELS[app.status]}
          </Badge>
        </Table.Td>
        <Table.Td>
          {app.status === 'pending' && (
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
                  setSelectedApp(app.id);
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
  };

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>借用申请审批</Title>
          <Group>
            <Badge size="lg" color="yellow">待审批: {pendingApps.length}</Badge>
            <Badge size="lg" color="green">已批准: {approvedApps.length}</Badge>
            <Badge size="lg" color="gray">已拒绝: {rejectedApps.length}</Badge>
          </Group>
        </Group>

        <ScrollArea>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>申请人</Table.Th>
                <Table.Th>物镜</Table.Th>
                <Table.Th>用途</Table.Th>
                <Table.Th>优先级</Table.Th>
                <Table.Th>借用时间</Table.Th>
                <Table.Th>状态</Table.Th>
                <Table.Th>操作</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {borrowApplications.length > 0 ? (
                borrowApplications.map((app) => renderApplicationRow(app))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={7} align="center" py="xl">
                    <Text c="dimmed">暂无借用申请</Text>
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
          setSelectedApp(null);
        }}
        title="拒绝借用申请"
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
                setSelectedApp(null);
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
