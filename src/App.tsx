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
} from '@mantine/core';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import { theme } from './theme';
import { useObjectiveStore } from './store/objectiveStore';
import { ObjectiveCard } from './components/ObjectiveCard';
import { FilterBar } from './components/FilterBar';
import { ObjectiveForm } from './components/ObjectiveForm';
import { DetailDrawer } from './components/DetailDrawer';
import { StatsPanel } from './components/StatsPanel';
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

  const objectives = getFilteredObjectives();

  const handleAddObjective = () => {
    setEditingObjective(null);
    setObjectiveModalOpen(true);
  };

  const handleResetData = () => {
    if (window.confirm('确定要重置所有数据吗？这将恢复为初始演示数据。')) {
      resetToMockData();
    }
  };

  return (
    <AppShell header={{ height: 70 }} padding="md">
      <AppShell.Header>
        <Container h="100%">
          <Group h="100%" justify="space-between">
            <Group>
              <Title order={2} c="darkBlue.7">
                🔬 物镜档案管理系统
              </Title>
              <Text size="sm" c="dimmed">
                显微镜收藏与维修工作室
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
          <Group align="flex-start" gap="lg">
            <Box style={{ flex: 3, minWidth: 0 }}>
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
        </Container>
      </AppShell.Main>

      <ObjectiveForm />
      <DetailDrawer />
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
