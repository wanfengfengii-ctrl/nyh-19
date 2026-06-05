import { useState } from 'react';
import {
  Group,
  Button,
  Text,
  Badge,
  Modal,
  TextInput,
  Textarea,
  Stack,
} from '@mantine/core';
import {
  IconTrash,
  IconRestore,
  IconDownload,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { useObjectiveStore } from '../store/objectiveStore';
import type { ObjectiveFormData } from '../types';

export function BatchActionBar() {
  const selectedIds = useObjectiveStore((state) => state.selectedIds);
  const clearSelectedIds = useObjectiveStore(
    (state) => state.clearSelectedIds
  );
  const batchScrap = useObjectiveStore((state) => state.batchScrap);
  const batchRestore = useObjectiveStore((state) => state.batchRestore);
  const batchExport = useObjectiveStore((state) => state.batchExport);
  const batchImport = useObjectiveStore((state) => state.batchImport);
  const objectives = useObjectiveStore((state) => state.objectives);
  const setNotification = useObjectiveStore(
    (state) => state.setNotification
  );

  const [showScrapModal, setShowScrapModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [scrapReason, setScrapReason] = useState('');
  const [importData, setImportData] = useState('');

  const selectedScrappedCount = selectedIds.filter(
    (id) => objectives.find((o) => o.id === id)?.status === 'scrapped'
  ).length;
  const selectedNonScrappedCount = selectedIds.length - selectedScrappedCount;

  const handleExport = () => {
    const json = batchExport(selectedIds);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `objectives-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotification({
      message: `已导出 ${selectedIds.length} 条数据`,
      type: 'success',
    });
  };

  const handleBatchScrap = () => {
    if (scrapReason.trim()) {
      const idsToScrap = selectedIds.filter(
        (id) => objectives.find((o) => o.id === id)?.status !== 'scrapped'
      );
      batchScrap(idsToScrap, scrapReason, '当前用户');
      setShowScrapModal(false);
      setScrapReason('');
      clearSelectedIds();
      setNotification({
        message: `已批量报废 ${idsToScrap.length} 个物镜`,
        type: 'success',
      });
    }
  };

  const handleBatchRestore = () => {
    const idsToRestore = selectedIds.filter(
      (id) => objectives.find((o) => o.id === id)?.status === 'scrapped'
    );
    batchRestore(idsToRestore, '当前用户');
    clearSelectedIds();
    setNotification({
      message: `已批量恢复 ${idsToRestore.length} 个物镜`,
      type: 'success',
    });
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importData) as ObjectiveFormData[];
      const result = batchImport(data);
      setShowImportModal(false);
      setImportData('');
      setNotification({
        message: `导入完成: 成功 ${result.success} 条，失败 ${result.failed} 条`,
        type: result.failed === 0 ? 'success' : 'info',
      });
    } catch (e) {
      setNotification({
        message: '导入失败: JSON 格式错误',
        type: 'error',
      });
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <Group
        p="sm"
        bg="blue.0"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <Group gap="sm">
          <Badge size="lg" color="blue">
            已选择 {selectedIds.length} 项
          </Badge>
          {selectedNonScrappedCount > 0 && (
            <Button
              size="sm"
              color="red"
              variant="light"
              leftSection={<IconTrash size={16} />}
              onClick={() => setShowScrapModal(true)}
            >
              批量报废 ({selectedNonScrappedCount})
            </Button>
          )}
          {selectedScrappedCount > 0 && (
            <Button
              size="sm"
              color="green"
              variant="light"
              leftSection={<IconRestore size={16} />}
              onClick={handleBatchRestore}
            >
              批量恢复 ({selectedScrappedCount})
            </Button>
          )}
          <Button
            size="sm"
            variant="light"
            leftSection={<IconDownload size={16} />}
            onClick={handleExport}
          >
            导出数据
          </Button>
          <Button
            size="sm"
            variant="light"
            leftSection={<IconUpload size={16} />}
            onClick={() => setShowImportModal(true)}
          >
            批量导入
          </Button>
        </Group>
        <Group justify="flex-end">
          <Button
            size="sm"
            variant="subtle"
            leftSection={<IconX size={16} />}
            onClick={clearSelectedIds}
          >
            取消选择
          </Button>
        </Group>
      </Group>

      <Modal
        opened={showScrapModal}
        onClose={() => setShowScrapModal(false)}
        title="批量报废"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            确定要报废选中的 <strong>{selectedNonScrappedCount}</strong> 个物镜吗？
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
              onClick={handleBatchScrap}
              disabled={!scrapReason.trim()}
            >
              确认报废
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="批量导入物镜"
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            请粘贴 JSON 格式的物镜数据进行批量导入。示例格式：
          </Text>
          <Text size="xs" c="dimmed" fs="italic">
            {`[{"serialNumber":"TEST-001","brand":"Zeiss","magnification":10,"numericalAperture":0.25,"interfaceSpec":"RMS","coatingStatus":"原厂镀膜完好","storageLocation":"A-01-01","status":"normal"}]`}
          </Text>
          <Textarea
            label="JSON 数据"
            placeholder="粘贴 JSON 数据..."
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            rows={8}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setShowImportModal(false)}>
              取消
            </Button>
            <Button onClick={handleImport} disabled={!importData.trim()}>
              导入
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
