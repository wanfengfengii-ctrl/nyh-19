import { useEffect } from 'react';
import {
  MantineProvider,
  AppShell,
  Container,
  Group,
  Button,
  Title,
  SimpleGrid,
  Text,
  ActionIcon,
  Tooltip,
  Box,
  Affix,
  Paper,
  Transition,
  Tabs,
  Badge,
} from '@mantine/core';
import {
  IconPlus,
  IconRefresh,
  IconCheck,
  IconX,
  IconMicroscope,
  IconClipboardList,
  IconCash,
  IconAlertTriangle,
  IconFileReport,
  IconStar,
} from '@tabler/icons-react';
import { theme } from './theme';
import { useObjectiveStore } from './store/objectiveStore';
import { ObjectiveCard } from './components/ObjectiveCard';
import { FilterBar } from './components/FilterBar';
import { ObjectiveForm } from './components/ObjectiveForm';
import { DetailDrawer } from './components/DetailDrawer';
import { StatsPanel } from './components/StatsPanel';
import { BatchActionBar } from './components/BatchActionBar';
import { MaintenanceReminders } from './components/MaintenanceReminders';
import { BorrowApprovalPanel } from './components/BorrowApprovalPanel';
import { DepositFeePanel } from './components/DepositFeePanel';
import { PenaltyPanel } from './components/PenaltyPanel';
import { ReportExportPanel } from './components/ReportExportPanel';
import { CreditProfilePanel } from './components/CreditProfilePanel';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

function AppContent() {
  const getFilteredObjectives = useObjectiveStore(
    (state) => state.getFilteredObjectives
  );
  const setObjectiveModalOpen = useObjectiveStore(
    (state) => state.setObjectiveModalOpen
  );
  const setEditingObjective = useObjectiveStore(
    (state) => state.setEditingObjective
  );
  const resetToMockData = useObjectiveStore((state) => state.resetToMockData);
  const notification = useObjectiveStore((state) => state.notification);
  const setNotification = useObjectiveStore(
    (state) => state.setNotification
  );
  const clearSelectedIds = useObjectiveStore((state) => state.clearSelectedIds);
  const activeTab = useObjectiveStore((state) => state.activeTab);
  const setActiveTab = useObjectiveStore((state) => state.setActiveTab);
  const getPendingApprovalCount = useObjectiveStore((state) => state.getPendingApprovalCount);
  const getUnpaidPenaltyCount = useObjectiveStore((state) => state.getUnpaidPenaltyCount);

  const objectives = getFilteredObjectives();
  const pendingApprovalCount = getPendingApprovalCount();
  const unpaidPenaltyCount = getUnpaidPenaltyCount();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, setNotification]);

  const handleAddObjective = () => {
    setEditingObjective(null);
    setObjectiveModalOpen(true);
  };

  const handleResetData = () => {
    if (window.confirm('确定要重置所有数据吗？这将恢复为初始演示数据。')) {
      resetToMockData();
      clearSelectedIds();
      setNotification({
        message: '数据已重置',
        type: 'success',
      });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'inventory':
        return (
          <Group align="flex-start" gap="lg">
            <Box style={{ flex: 3, minWidth: 0 }}>
              <MaintenanceReminders />

              <BatchActionBar />

              <Group mb="md">
                <FilterBar />
              </Group>

              {objectives.length > 0 ? (
                <SimpleGrid
                  cols={{ base: 1, sm: 2, md: 3 }}
                  spacing="md"
                  verticalSpacing="md"
                >
                  {objectives.map((objective) => (
                    <ObjectiveCard key={objective.id} objective={objective} />
                  ))}
                </SimpleGrid>
              ) : (
                <Text ta="center" c="dimmed" py="xl">
                  没有找到匹配的物镜
                </Text>
              )}
            </Box>

            <Box style={{ flex: 1, minWidth: 280 }}>
              <StatsPanel />
            </Box>
          </Group>
        );
      case 'approval':
        return <BorrowApprovalPanel />;
      case 'deposit':
        return <DepositFeePanel />;
      case 'penalty':
        return <PenaltyPanel />;
      case 'report':
        return <ReportExportPanel />;
      case 'credit':
        return <CreditProfilePanel />;
      default:
        return null;
    }
  };

  return (
    <AppShell header={{ height: 70 }} padding="md">
      <AppShell.Header>
        <Container h="100%">
          <Group h="100%" justify="space-between">
            <Group>
              <Title order={2} c="darkBlue.7">
                🔬 物镜借用审批与追踪中心
              </Title>
              <Text size="sm" c="dimmed">
                升级版 - 显微镜管理系统
              </Text>
            </Group>
            <Group>
              <Tooltip label="重置演示数据">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={handleResetData}
                >
                  <IconRefresh size={20} />
                </ActionIcon>
              </Tooltip>
              <Button
                leftSection={<IconPlus size={18} />}
                onClick={handleAddObjective}
              >
                新增物镜
              </Button>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="xl">
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value as any)} mb="md">
            <Tabs.List>
              <Tabs.Tab value="inventory" leftSection={<IconMicroscope size={16} />}>
                物镜管理
              </Tabs.Tab>
              <Tabs.Tab
                value="approval"
                leftSection={<IconClipboardList size={16} />}
                rightSection={
                  pendingApprovalCount > 0 ? (
                    <Badge size="xs" circle>{pendingApprovalCount}</Badge>
                  ) : null
                }
              >
                借用审批
              </Tabs.Tab>
              <Tabs.Tab value="deposit" leftSection={<IconCash size={16} />}>
                押金费用
              </Tabs.Tab>
              <Tabs.Tab
                value="penalty"
                leftSection={<IconAlertTriangle size={16} />}
                rightSection={
                  unpaidPenaltyCount > 0 ? (
                    <Badge size="xs" circle color="red">{unpaidPenaltyCount}</Badge>
                  ) : null
                }
              >
                逾期处罚
              </Tabs.Tab>
              <Tabs.Tab value="report" leftSection={<IconFileReport size={16} />}>
                报表导出
              </Tabs.Tab>
              <Tabs.Tab value="credit" leftSection={<IconStar size={16} />}>
                信用画像
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>

          {renderTabContent()}
        </Container>
      </AppShell.Main>

      <ObjectiveForm />
      <DetailDrawer />

      <Affix position={{ bottom: 20, right: 20 }}>
        <Transition mounted={!!notification} transition="slide-up">
          {(transitionStyles) => (
            <Paper
              shadow="md"
              p="md"
              style={{
                ...transitionStyles,
                backgroundColor:
                  notification?.type === 'success'
                    ? '#dcfce7'
                    : notification?.type === 'error'
                    ? '#fee2e2'
                    : '#dbeafe',
                borderLeft: `4px solid ${
                  notification?.type === 'success'
                    ? '#22c55e'
                    : notification?.type === 'error'
                    ? '#ef4444'
                    : '#3b82f6'
                }`,
                minWidth: 280,
              }}
            >
              <Group gap="sm">
                {notification?.type === 'error' ? (
                  <IconX size={20} color="#ef4444" />
                ) : (
                  <IconCheck size={20} color="#22c55e" />
                )}
                <Text size="sm" fw={500}>
                  {notification?.message}
                </Text>
              </Group>
            </Paper>
          )}
        </Transition>
      </Affix>
    </AppShell>
  );
}

export default function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <AppContent />
    </MantineProvider>
  );
}
