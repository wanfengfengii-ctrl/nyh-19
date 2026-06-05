import { useState } from 'react';
import {
  Drawer,
  Stack,
  Group,
  Badge,
  Text,
  Title,
  Divider,
  Timeline,
  Card,
  Accordion,
  Box,
  Image,
  SimpleGrid,
  ActionIcon,
  Tooltip,
  Button,
  Modal,
  TextInput,
  ScrollArea,
  Chip,
  Alert,
} from '@mantine/core';
import {
  IconMicroscope,
  IconBrandGoogleMaps,
  IconLink,
  IconSun,
  IconAlertTriangle,
  IconCheck,
  IconTrash,
  IconRestore,
  IconTool,
  IconTrendingUp,
  IconX,
  IconCalendar,
  IconUser,
  IconCoin,
  IconBuilding,
  IconAlertCircle,
} from '@tabler/icons-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { useObjectiveStore } from '../store/objectiveStore';
import type {
  MaintenanceRecord,
  RepairRecord,
  ImageArchive,
  OperationLog,
} from '../types';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  DAMAGE_TYPE_LABELS,
  DAMAGE_TYPE_COLORS,
  SEVERITY_LABELS,
  SEVERITY_COLORS,
  REPAIR_STATUS_LABELS,
  REPAIR_STATUS_COLORS,
  IMAGE_TYPE_OPTIONS,
  BORROW_STATUS_LABELS,
  BORROW_STATUS_COLORS,
} from '../types/constants';
import { MaintenanceForm } from './MaintenanceForm';
import { BorrowForm } from './BorrowForm';
import { BorrowHistoryTimeline } from './BorrowHistoryTimeline';

export function DetailDrawer() {
  const selectedObjective = useObjectiveStore(
    (state) => state.selectedObjective
  );
  const setSelectedObjective = useObjectiveStore(
    (state) => state.setSelectedObjective
  );
  const getRecordsByObjectiveId = useObjectiveStore(
    (state) => state.getRecordsByObjectiveId
  );
  const getImagesByObjectiveId = useObjectiveStore(
    (state) => state.getImagesByObjectiveId
  );
  const getRepairsByObjectiveId = useObjectiveStore(
    (state) => state.getRepairsByObjectiveId
  );
  const getLogsByObjectiveId = useObjectiveStore(
    (state) => state.getLogsByObjectiveId
  );
  const getBorrowRecordsByObjectiveId = useObjectiveStore(
    (state) => state.getBorrowRecordsByObjectiveId
  );
  const getCurrentBorrowRecord = useObjectiveStore(
    (state) => state.getCurrentBorrowRecord
  );
  const scrapObjective = useObjectiveStore((state) => state.scrapObjective);
  const restoreObjective = useObjectiveStore((state) => state.restoreObjective);
  const deleteObjective = useObjectiveStore((state) => state.deleteObjective);
  const setNotification = useObjectiveStore((state) => state.setNotification);

  const [showScrapModal, setShowScrapModal] = useState(false);
  const [scrapReason, setScrapReason] = useState('');
  const [imagePreview, setImagePreview] = useState<ImageArchive | null>(null);

  if (!selectedObjective) return null;

  const records = getRecordsByObjectiveId(selectedObjective.id);
  const images = getImagesByObjectiveId(selectedObjective.id);
  const repairs = getRepairsByObjectiveId(selectedObjective.id);
  const logs = getLogsByObjectiveId(selectedObjective.id);
  const objectiveBorrowRecords = getBorrowRecordsByObjectiveId(selectedObjective.id);
  const currentBorrow = getCurrentBorrowRecord(selectedObjective.id);
  const isScrapped = selectedObjective.status === 'scrapped';

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'green';
    if (score >= 70) return 'yellow';
    if (score >= 50) return 'orange';
    return 'red';
  };

  const handleScrap = () => {
    if (scrapReason.trim()) {
      scrapObjective(selectedObjective.id, scrapReason, '当前用户');
      setShowScrapModal(false);
      setScrapReason('');
      setNotification({
        message: '物镜已成功报废',
        type: 'success',
      });
    }
  };

  const handleRestore = () => {
    restoreObjective(selectedObjective.id, '当前用户');
    setNotification({
      message: '物镜已成功恢复',
      type: 'success',
    });
  };

  const handleDelete = () => {
    if (window.confirm(`确定要永久删除物镜 ${selectedObjective.serialNumber} 吗？此操作不可恢复。`)) {
      deleteObjective(selectedObjective.id);
      setNotification({
        message: '物镜已删除',
        type: 'info',
      });
    }
  };

  const renderRecordItem = (record: MaintenanceRecord) => (
    <Timeline.Item
      key={record.id}
      bullet={
        record.clarityScore >= 80 ? (
          <IconCheck size={16} />
        ) : (
          <IconAlertTriangle size={16} />
        )
      }
      color={record.clarityScore >= 80 ? 'green' : 'orange'}
      title={record.testDate}
    >
      <Card withBorder p="sm" radius="sm">
        <Stack gap="xs">
          <Group justify="space-between">
            <Badge color={getScoreColor(record.clarityScore)} size="lg">
              清晰度: {record.clarityScore}
            </Badge>
            <Group gap="xs">
              {record.hasMold && <Badge color="yellow">有霉斑 🟤</Badge>}
              {record.hasScratch && <Badge color="orange">有划痕 ⚠️</Badge>}
              {record.hasCoatingDamage && <Badge color="pink">镀膜损伤</Badge>}
            </Group>
          </Group>
          {record.damages.length > 0 && (
            <Group gap="xs">
              {record.damages.map((d, i) => (
                <Chip
                  key={i}
                  size="xs"
                  color={DAMAGE_TYPE_COLORS[d.type]}
                  variant="light"
                >
                  {DAMAGE_TYPE_LABELS[d.type]} - {SEVERITY_LABELS[d.severity]}
                </Chip>
              ))}
            </Group>
          )}
          {record.treatmentAdvice && (
            <Text size="sm" c="dimmed">
              💡 {record.treatmentAdvice}
            </Text>
          )}
        </Stack>
      </Card>
    </Timeline.Item>
  );

  const renderRepairItem = (repair: RepairRecord) => (
    <Timeline.Item
      key={repair.id}
      bullet={<IconTool size={16} />}
      color={REPAIR_STATUS_COLORS[repair.status]}
      title={repair.title}
    >
      <Card withBorder p="sm" radius="sm">
        <Stack gap="xs">
          <Group justify="space-between">
            <Badge color={REPAIR_STATUS_COLORS[repair.status]} size="sm">
              {REPAIR_STATUS_LABELS[repair.status]}
            </Badge>
            {repair.cost && (
              <Group gap="xs">
                <IconCoin size={14} />
                <Text size="sm">¥{repair.cost}</Text>
              </Group>
            )}
          </Group>
          <Text size="sm">{repair.description}</Text>
          <Group gap="md">
            <Group gap="xs">
              <IconCalendar size={14} />
              <Text size="xs" c="dimmed">
                {repair.startDate}
                {repair.endDate ? ` ~ ${repair.endDate}` : ''}
              </Text>
            </Group>
            <Group gap="xs">
              <IconUser size={14} />
              <Text size="xs" c="dimmed">
                {repair.technician}
              </Text>
            </Group>
          </Group>
          {repair.notes && (
            <Text size="xs" c="dimmed" fs="italic">
              备注: {repair.notes}
            </Text>
          )}
        </Stack>
      </Card>
    </Timeline.Item>
  );

  const renderLogItem = (log: OperationLog) => (
    <Group key={log.id} justify="space-between" py="xs" style={{ borderBottom: '1px solid #eee' }}>
      <Stack gap={4}>
        <Text size="sm">{log.description}</Text>
        <Text size="xs" c="dimmed">
          {log.operator} · {new Date(log.timestamp).toLocaleString('zh-CN')}
        </Text>
      </Stack>
      <Badge size="xs" variant="light">
        {log.type}
      </Badge>
    </Group>
  );

  const groupedImages = {
    before_cleaning: images.filter((i) => i.type === 'before_cleaning'),
    after_cleaning: images.filter((i) => i.type === 'after_cleaning'),
    damage: images.filter((i) => i.type === 'damage'),
    general: images.filter((i) => i.type === 'general'),
  };

  const beforeAfterPairs = groupedImages.before_cleaning.map((before, i) => ({
    before,
    after: groupedImages.after_cleaning[i],
  }));

  const scoreTrendData = records
    .slice()
    .reverse()
    .map((r) => ({
      date: r.testDate,
      score: r.clarityScore,
    }));

  return (
    <>
      <Drawer
        opened={!!selectedObjective}
        onClose={() => setSelectedObjective(null)}
        title="物镜详情"
        position="right"
        size="xl"
        padding="xl"
      >
        <ScrollArea h="calc(100vh - 80px)">
          <Stack gap="lg">
            <Box>
              <Group justify="space-between" mb="xs">
                <Title order={3}>{selectedObjective.brand}</Title>
                <Group gap="xs">
                  <Badge
                    color={STATUS_COLORS[selectedObjective.status]}
                    size="lg"
                    variant="light"
                  >
                    {STATUS_LABELS[selectedObjective.status]}
                  </Badge>
                  {!isScrapped ? (
                    <>
                      <Tooltip label="报废">
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => setShowScrapModal(true)}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </>
                  ) : (
                    <Tooltip label="恢复">
                      <ActionIcon
                        color="green"
                        variant="light"
                        onClick={handleRestore}
                      >
                        <IconRestore size={18} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  <Tooltip label="删除">
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={handleDelete}
                    >
                      <IconX size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
              <Text size="sm" c="dimmed" ff="monospace">
                {selectedObjective.serialNumber}
              </Text>
              {selectedObjective.damages.length > 0 && (
                <Group gap="xs" mt="sm">
                  {selectedObjective.damages.map((d, i) => (
                    <Chip
                      key={i}
                      color={DAMAGE_TYPE_COLORS[d.type]}
                      variant="filled"
                      size="sm"
                    >
                      {DAMAGE_TYPE_LABELS[d.type]}
                      <Badge
                        size="xs"
                        color={SEVERITY_COLORS[d.severity]}
                        ml="xs"
                      >
                        {SEVERITY_LABELS[d.severity]}
                      </Badge>
                    </Chip>
                  ))}
                </Group>
              )}
            </Box>

            <Group grow>
              <Card withBorder p="md" radius="sm">
                <Stack gap="xs" align="center">
                  <IconMicroscope size={24} />
                  <Text fw={700} size="xl">
                    {selectedObjective.magnification}×
                  </Text>
                  <Text size="xs" c="dimmed">
                    倍率
                  </Text>
                </Stack>
              </Card>
              <Card withBorder p="md" radius="sm">
                <Stack gap="xs" align="center">
                  <IconSun size={24} />
                  <Text fw={700} size="xl">
                    {selectedObjective.numericalAperture}
                  </Text>
                  <Text size="xs" c="dimmed">
                    数值孔径
                  </Text>
                </Stack>
              </Card>
            </Group>

            <Divider label="详细信息" labelPosition="center" />

            <Stack gap="sm">
              <Group>
                <IconLink size={18} />
                <Text size="sm">
                  接口规格: <strong>{selectedObjective.interfaceSpec}</strong>
                </Text>
              </Group>
              <Group>
                <IconSun size={18} />
                <Text size="sm">
                  镀膜状态: <strong>{selectedObjective.coatingStatus}</strong>
                </Text>
              </Group>
              <Group>
                <IconBrandGoogleMaps size={18} />
                <Text size="sm">
                  保存位置: <strong>{selectedObjective.storageLocation}</strong>
                </Text>
              </Group>
              {selectedObjective.lastMaintenanceDate && (
                <Group>
                  <IconCalendar size={18} />
                  <Text size="sm">
                    上次保养:{' '}
                    <strong>{selectedObjective.lastMaintenanceDate}</strong>
                  </Text>
                </Group>
              )}
              {selectedObjective.nextMaintenanceDate && (
                <Group>
                  <IconTrendingUp size={18} />
                  <Text size="sm">
                    下次保养:{' '}
                    <strong>{selectedObjective.nextMaintenanceDate}</strong>
                  </Text>
                </Group>
              )}
              {selectedObjective.scrappingRecord && (
                <Card withBorder p="sm" radius="sm" bg="red.0">
                  <Stack gap="xs">
                    <Text size="sm" fw={600} c="red">
                      报废信息
                    </Text>
                    <Text size="sm">
                      原因: {selectedObjective.scrappingRecord.reason}
                    </Text>
                    <Text size="xs" c="dimmed">
                      批准人: {selectedObjective.scrappingRecord.approvedBy} ·{' '}
                      {new Date(
                        selectedObjective.scrappingRecord.approvedAt
                      ).toLocaleDateString('zh-CN')}
                    </Text>
                  </Stack>
                </Card>
              )}
            </Stack>

            {currentBorrow && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                color={currentBorrow.status === 'overdue' ? 'red' : 'blue'}
                title="当前借用信息"
              >
                <Stack gap="xs" mt="xs">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <IconUser size={14} />
                      <Text size="sm">
                        借用人: <strong>{currentBorrow.borrowerName}</strong>
                      </Text>
                    </Group>
                    <Badge color={BORROW_STATUS_COLORS[currentBorrow.status]}>
                      {BORROW_STATUS_LABELS[currentBorrow.status]}
                    </Badge>
                  </Group>
                  <Group gap="xs">
                    <IconBuilding size={14} />
                    <Text size="sm">部门: {currentBorrow.borrowerDepartment}</Text>
                  </Group>
                  <Group gap="xs">
                    <IconCalendar size={14} />
                    <Text size="sm">
                      借出: {currentBorrow.borrowDate} ~ 预计归还: {currentBorrow.expectedReturnDate}
                    </Text>
                  </Group>
                  <Text size="sm" c="dimmed">
                    原因: {currentBorrow.reason}
                  </Text>
                </Stack>
              </Alert>
            )}

            <Accordion variant="separated">
              <Accordion.Item value="add-record">
                <Accordion.Control>添加保养记录</Accordion.Control>
                <Accordion.Panel>
                  <MaintenanceForm
                    objectiveId={selectedObjective.id}
                    isScrapped={isScrapped}
                  />
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="borrow-manage">
                <Accordion.Control>借用管理</Accordion.Control>
                <Accordion.Panel>
                  <BorrowForm
                    objectiveId={selectedObjective.id}
                    isScrapped={isScrapped}
                  />
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>

            <Divider label="评分趋势分析" labelPosition="center" />

            {scoreTrendData.length > 0 ? (
              <Card withBorder p="md" radius="sm">
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
                      <RechartsTooltip
                        formatter={(value) => [`${value} 分`, '清晰度']}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        name="清晰度评分"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            ) : (
              <Text c="dimmed" ta="center" py="md" size="sm">
                暂无评分数据
              </Text>
            )}

            {beforeAfterPairs.length > 0 && (
              <>
                <Divider label="清洁前后对比" labelPosition="center" />
                <SimpleGrid cols={2}>
                  {beforeAfterPairs.map(({ before, after }, i) => (
                    <Card key={i} withBorder p="sm" radius="sm">
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Badge color="yellow">清洁前</Badge>
                          {after && <Badge color="green">清洁后</Badge>}
                        </Group>
                        <SimpleGrid cols={after ? 2 : 1}>
                          <Image
                            src={before.url}
                            alt={before.description}
                            radius="sm"
                            h={120}
                            fit="cover"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setImagePreview(before)}
                          />
                          {after && (
                            <Image
                              src={after.url}
                              alt={after.description}
                              radius="sm"
                              h={120}
                              fit="cover"
                              style={{ cursor: 'pointer' }}
                              onClick={() => setImagePreview(after)}
                            />
                          )}
                        </SimpleGrid>
                      </Stack>
                    </Card>
                  ))}
                </SimpleGrid>
              </>
            )}

            {images.length > 0 && (
              <>
                <Divider label="图片档案" labelPosition="center" />
                <SimpleGrid cols={3}>
                  {images.map((img) => (
                    <Card
                      key={img.id}
                      withBorder
                      p={0}
                      radius="sm"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setImagePreview(img)}
                    >
                      <Image
                        src={img.url}
                        alt={img.description}
                        h={100}
                        fit="cover"
                      />
                      <Box p="xs">
                        <Badge size="xs" variant="light" mb="xs">
                          {IMAGE_TYPE_OPTIONS.find(
                            (t) => t.value === img.type
                          )?.label || img.type}
                        </Badge>
                        <Text size="xs" lineClamp={1}>
                          {img.description}
                        </Text>
                      </Box>
                    </Card>
                  ))}
                </SimpleGrid>
              </>
            )}

            {repairs.length > 0 && (
              <>
                <Divider label="维修流程" labelPosition="center" />
                <Timeline active={repairs.length - 1} bulletSize={24} lineWidth={2}>
                  {repairs.map(renderRepairItem)}
                </Timeline>
              </>
            )}

            <Divider label="保养历史" labelPosition="center" />

            {records.length > 0 ? (
              <Timeline active={records.length - 1} bulletSize={24} lineWidth={2}>
                {records.map(renderRecordItem)}
              </Timeline>
            ) : (
              <Text c="dimmed" ta="center" py="xl">
                暂无保养记录
              </Text>
            )}

            <Divider label="借用历史" labelPosition="center" />
            <BorrowHistoryTimeline records={objectiveBorrowRecords} />

            {logs.length > 0 && (
              <>
                <Divider label="操作日志" labelPosition="center" />
                <Card withBorder p="sm" radius="sm">
                  <Stack gap={0}>
                    {logs.slice(0, 10).map(renderLogItem)}
                  </Stack>
                </Card>
              </>
            )}
          </Stack>
        </ScrollArea>
      </Drawer>

      <Modal
        opened={showScrapModal}
        onClose={() => setShowScrapModal(false)}
        title="报废物镜"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            确定要报废物镜 <strong>{selectedObjective.serialNumber}</strong> 吗？
            报废后可以随时恢复。
          </Text>
          <TextInput
            label="报废原因"
            placeholder="请输入报废原因"
            value={scrapReason}
            onChange={(e) => setScrapReason(e.target.value)}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setShowScrapModal(false)}>
              取消
            </Button>
            <Button
              color="red"
              onClick={handleScrap}
              disabled={!scrapReason.trim()}
            >
              确认报废
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={!!imagePreview}
        onClose={() => setImagePreview(null)}
        title={imagePreview?.description}
        size="lg"
      >
        {imagePreview && (
          <Stack gap="sm">
            <Image
              src={imagePreview.url}
              alt={imagePreview.description}
              radius="md"
            />
            <Group justify="space-between">
              <Badge variant="light">
                {IMAGE_TYPE_OPTIONS.find((t) => t.value === imagePreview.type)?.label}
              </Badge>
              <Text size="sm" c="dimmed">
                上传于: {new Date(imagePreview.uploadedAt).toLocaleDateString('zh-CN')}
              </Text>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
}
