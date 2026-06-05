import { Card, Title, Text, SimpleGrid, Box, Stack } from '@mantine/core';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useObjectiveStore } from '../store/objectiveStore';

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
];

export function StatsPanel() {
  const objectives = useObjectiveStore((state) => state.objectives);
  const records = useObjectiveStore((state) => state.records);
  const getAvailableCount = useObjectiveStore((state) => state.getAvailableCount);
  const getBorrowedCount = useObjectiveStore((state) => state.getBorrowedCount);
  const getOverdueCount = useObjectiveStore((state) => state.getOverdueCount);

  const availableCount = getAvailableCount();
  const borrowedCount = getBorrowedCount();
  const overdueCount = getOverdueCount();

  const magnificationData = objectives.reduce((acc, obj) => {
    const key = `${obj.magnification}×`;
    const existing = acc.find((item) => item.name === key);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: key, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const scoreTrendData = records
    .slice()
    .sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime())
    .reduce((acc, record) => {
      const existing = acc.find((item) => item.date === record.testDate);
      if (existing) {
        existing.scores.push(record.clarityScore);
        existing.avg = Math.round(
          existing.scores.reduce((sum: number, s: number) => sum + s, 0) /
            existing.scores.length
        );
      } else {
        acc.push({
          date: record.testDate,
          scores: [record.clarityScore],
          avg: record.clarityScore,
        });
      }
      return acc;
    }, [] as { date: string; scores: number[]; avg: number }[]);

  const statusStats = {
    normal: objectives.filter((o) => o.status === 'normal').length,
    scratched: objectives.filter((o) => o.status === 'scratched').length,
    moldy: objectives.filter((o) => o.status === 'moldy').length,
    coating_damaged: objectives.filter((o) => o.status === 'coating_damaged').length,
    in_repair: objectives.filter((o) => o.status === 'in_repair').length,
    scrapped: objectives.filter((o) => o.status === 'scrapped').length,
  };

  return (
    <Stack gap="md">
      <Title order={4}>统计概览</Title>

      <SimpleGrid cols={2}>
        <Card withBorder p="md" radius="sm">
          <Text size="sm" c="dimmed" mb="xs">
            物镜总数
          </Text>
          <Text fw={700} size="xl">
            {objectives.length}
          </Text>
        </Card>
        <Card withBorder p="md" radius="sm">
          <Text size="sm" c="dimmed" mb="xs">
            保养记录
          </Text>
          <Text fw={700} size="xl">
            {records.length}
          </Text>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={3}>
        <Card withBorder p="sm" radius="sm">
          <Text size="xs" c="dimmed">
            完好
          </Text>
          <Text fw={700} c="green">
            {statusStats.normal}
          </Text>
        </Card>
        <Card withBorder p="sm" radius="sm">
          <Text size="xs" c="dimmed">
            划痕
          </Text>
          <Text fw={700} c="orange">
            {statusStats.scratched}
          </Text>
        </Card>
        <Card withBorder p="sm" radius="sm">
          <Text size="xs" c="dimmed">
            霉斑
          </Text>
          <Text fw={700} c="yellow">
            {statusStats.moldy}
          </Text>
        </Card>
        <Card withBorder p="sm" radius="sm">
          <Text size="xs" c="dimmed">
            镀膜损伤
          </Text>
          <Text fw={700} c="pink">
            {statusStats.coating_damaged}
          </Text>
        </Card>
        <Card withBorder p="sm" radius="sm">
          <Text size="xs" c="dimmed">
            维修中
          </Text>
          <Text fw={700} c="blue">
            {statusStats.in_repair}
          </Text>
        </Card>
        <Card withBorder p="sm" radius="sm">
          <Text size="xs" c="dimmed">
            报废
          </Text>
          <Text fw={700} c="red">
            {statusStats.scrapped}
          </Text>
        </Card>
      </SimpleGrid>

      <Title order={5}>借用统计</Title>
      <SimpleGrid cols={3}>
        <Card withBorder p="sm" radius="sm">
          <Text size="xs" c="dimmed">
            可借用
          </Text>
          <Text fw={700} c="green">
            {availableCount}
          </Text>
        </Card>
        <Card withBorder p="sm" radius="sm">
          <Text size="xs" c="dimmed">
            已借出
          </Text>
          <Text fw={700} c="blue">
            {borrowedCount}
          </Text>
        </Card>
        <Card withBorder p="sm" radius="sm">
          <Text size="xs" c="dimmed">
            已超期
          </Text>
          <Text fw={700} c="red">
            {overdueCount}
          </Text>
        </Card>
      </SimpleGrid>

      <Card withBorder p="md" radius="sm">
        <Text size="sm" c="dimmed" mb="md">
          倍率分布
        </Text>
        <Box h={200}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={magnificationData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                }
              >
                {magnificationData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Card>

      <Card withBorder p="md" radius="sm">
        <Text size="sm" c="dimmed" mb="md">
          评分趋势
        </Text>
        <Box h={200}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scoreTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => value.slice(5)}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value) => [`${value} 分`, '平均评分']}
              />
              <Line
                type="monotone"
                dataKey="avg"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="平均评分"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Card>
    </Stack>
  );
}
