import {
  Paper,
  Title,
  Badge,
  Group,
  Button,
  Text,
  Stack,
  Avatar,
  SimpleGrid,
  Card,
  Progress,
  RingProgress,
} from '@mantine/core';
import { IconUser, IconTrophy, IconRefresh, IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import { useCreditStore } from '../store/creditStore';
import { DataTable } from './common';
import type { CreditProfile, TableColumn } from '../types';
import {
  CREDIT_LEVEL_LABELS,
  CREDIT_LEVEL_COLORS,
} from '../types/constants';

export function CreditProfilePanel() {
  const updateProfile = useCreditStore((state) => state.updateProfile);
  const getBorrowerRanking = useCreditStore((state) => state.getBorrowerRanking);

  const ranking = getBorrowerRanking();

  const handleRefreshProfile = (borrowerName: string) => {
    updateProfile(borrowerName);
  };

  const getCreditColor = (score: number) => {
    if (score >= 85) return 'green';
    if (score >= 70) return 'blue';
    if (score >= 50) return 'yellow';
    return 'red';
  };

  const columns: TableColumn<CreditProfile>[] = [
    {
      key: 'rank',
      title: '排名',
      render: (profile) => {
        const index = ranking.findIndex((p: CreditProfile) => p.id === profile.id);
        return (
          <Group gap="xs">
            {index < 3 && (
              <IconTrophy
                size={16}
                color={
                  index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : '#d97706'
                }
              />
            )}
            <Text size="sm" fw={500}>
              #{index + 1}
            </Text>
          </Group>
        );
      },
    },
    {
      key: 'borrowerName',
      title: '借用人',
      render: (profile) => (
        <Group>
          <Avatar size="sm" radius="xl">
            <IconUser size={16} />
          </Avatar>
          <Text size="sm" fw={500}>
            {profile.borrowerName}
          </Text>
        </Group>
      ),
    },
    {
      key: 'creditScore',
      title: '信用评分',
      render: (profile) => (
        <Group gap="sm" wrap="nowrap">
          <Progress
            value={profile.creditScore}
            color={getCreditColor(profile.creditScore)}
            size="sm"
            style={{ width: 100 }}
          />
          <Text size="sm" fw={500}>
            {profile.creditScore}
          </Text>
        </Group>
      ),
    },
    {
      key: 'creditLevel',
      title: '信用等级',
      render: (profile) => (
        <Badge color={CREDIT_LEVEL_COLORS[profile.creditLevel]}>
          {CREDIT_LEVEL_LABELS[profile.creditLevel]}
        </Badge>
      ),
    },
    {
      key: 'totalBorrows',
      title: '总借用次数',
      render: (profile) => <Text size="sm">{profile.totalBorrows}</Text>,
    },
    {
      key: 'onTimeReturns',
      title: '按时归还',
      render: (profile) => (
        <Group gap="xs">
          <IconCircleCheck size={14} color="green" />
          <Text size="sm">{profile.onTimeReturns}</Text>
        </Group>
      ),
    },
    {
      key: 'overdueCount',
      title: '超期次数',
      render: (profile) =>
        profile.overdueCount > 0 ? (
          <Group gap="xs">
            <IconAlertCircle size={14} color="red" />
            <Text size="sm" c="red">
              {profile.overdueCount}
            </Text>
          </Group>
        ) : (
          <Text size="sm">0</Text>
        ),
    },
    {
      key: 'totalOverdueDays',
      title: '累计超期天数',
      render: (profile) => (
        <Text size="sm">{profile.totalOverdueDays} 天</Text>
      ),
    },
    {
      key: 'damageCount',
      title: '损坏次数',
      render: (profile) => <Text size="sm">{profile.damageCount}</Text>,
    },
    {
      key: 'penaltyCount',
      title: '处罚次数',
      render: (profile) => <Text size="sm">{profile.penaltyCount}</Text>,
    },
    {
      key: 'actions',
      title: '操作',
      render: (profile) => (
        <Button
          size="xs"
          variant="light"
          leftSection={<IconRefresh size={14} />}
          onClick={() => handleRefreshProfile(profile.borrowerName)}
        >
          更新
        </Button>
      ),
    },
  ];

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>借用人信用画像</Title>
          <Group>
            <Badge size="lg" color="green">
              优秀信用:{' '}
              {ranking.filter((p) => p.creditLevel === 'excellent').length}
            </Badge>
            <Badge size="lg" color="red">
              信用预警:{' '}
              {ranking.filter((p) => p.creditLevel === 'poor').length}
            </Badge>
          </Group>
        </Group>

        <Title order={5} mb="sm">
          信用排名 Top 5
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }} mb="md">
          {ranking.slice(0, 5).map((profile, index) => (
            <Card key={profile.id} padding="md" withBorder>
              <Stack align="center" gap="xs">
                <Group gap="xs">
                  <IconTrophy
                    size={20}
                    color={
                      index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : '#d97706'
                    }
                  />
                  <Text fw={700}>#{index + 1}</Text>
                </Group>
                <Avatar size="lg" radius="xl">
                  <IconUser size={30} />
                </Avatar>
                <Text fw={500} ta="center">
                  {profile.borrowerName}
                </Text>
                <RingProgress
                  size={80}
                  thickness={8}
                  roundCaps
                  sections={[
                    {
                      value: profile.creditScore,
                      color: getCreditColor(profile.creditScore),
                    },
                  ]}
                  label={
                    <Text size="xs" fw={700} ta="center">
                      {profile.creditScore}
                    </Text>
                  }
                />
                <Badge color={CREDIT_LEVEL_COLORS[profile.creditLevel]}>
                  {CREDIT_LEVEL_LABELS[profile.creditLevel]}
                </Badge>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>

        <Title order={5} mb="sm">
          信用详情
        </Title>
        <DataTable<CreditProfile>
          data={ranking}
          columns={columns}
          keyExtractor={(profile) => profile.id}
          emptyMessage="暂无信用数据"
        />
      </Paper>

      <Paper p="md" withBorder>
        <Title order={5} mb="sm">
          信用评级说明
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
          <Card padding="sm" withBorder style={{ borderColor: '#22c55e' }}>
            <Group gap="xs" mb="xs">
              <Badge color="green">优秀 (85-100分)</Badge>
            </Group>
            <Text size="sm">信用极佳，可享受优先借用、延长借用期限等特权</Text>
          </Card>
          <Card padding="sm" withBorder style={{ borderColor: '#3b82f6' }}>
            <Group gap="xs" mb="xs">
              <Badge color="blue">良好 (70-84分)</Badge>
            </Group>
            <Text size="sm">信用良好，可正常借用物镜</Text>
          </Card>
          <Card padding="sm" withBorder style={{ borderColor: '#eab308' }}>
            <Group gap="xs" mb="xs">
              <Badge color="yellow">一般 (50-69分)</Badge>
            </Group>
            <Text size="sm">信用一般，需缴纳押金，借用期限受限</Text>
          </Card>
          <Card padding="sm" withBorder style={{ borderColor: '#ef4444' }}>
            <Group gap="xs" mb="xs">
              <Badge color="red">较差 (0-49分)</Badge>
            </Group>
            <Text size="sm">信用较差，暂停借用权限，需缴纳高额押金</Text>
          </Card>
        </SimpleGrid>
      </Paper>
    </Stack>
  );
}
