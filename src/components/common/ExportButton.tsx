import { Button, Menu } from '@mantine/core';
import { IconDownload, IconFileText, IconFileSpreadsheet } from '@tabler/icons-react';
import { exportToJson, exportToCsv } from '../../utils/exportUtils';

interface ExportButtonProps<T> {
  data: T[];
  filename: string;
  csvHeaders?: { key: keyof T; label: string }[];
  label?: string;
  disabled?: boolean;
  onExport?: (format: 'json' | 'csv') => void;
}

export function ExportButton<T>({
  data,
  filename,
  csvHeaders,
  label = '导出',
  disabled = false,
  onExport,
}: ExportButtonProps<T>) {
  const handleExportJson = () => {
    exportToJson(data, filename);
    onExport?.('json');
  };

  const handleExportCsv = () => {
    if (csvHeaders) {
      exportToCsv(data, csvHeaders, filename);
    } else {
      const defaultHeaders = Object.keys(data[0] || {}).map((key) => ({
        key: key as keyof T,
        label: key,
      }));
      exportToCsv(data, defaultHeaders, filename);
    }
    onExport?.('csv');
  };

  return (
    <Menu shadow="md" width={180}>
      <Menu.Target>
        <Button
          leftSection={<IconDownload size={16} />}
          disabled={disabled || data.length === 0}
        >
          {label}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconFileText size={16} />}
          onClick={handleExportJson}
        >
          导出 JSON
        </Menu.Item>
        <Menu.Item
          leftSection={<IconFileSpreadsheet size={16} />}
          onClick={handleExportCsv}
        >
          导出 CSV
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
