import type { ReactNode } from 'react';
import { Modal, Group, Button, Stack, Divider } from '@mantine/core';

interface ModalDialogProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  confirmColor?: string;
  hideFooter?: boolean;
  loading?: boolean;
}

export function ModalDialog({
  opened,
  onClose,
  title,
  children,
  size = 'md',
  onConfirm,
  confirmLabel = '确认',
  cancelLabel = '取消',
  confirmDisabled = false,
  confirmColor = 'blue',
  hideFooter = false,
  loading = false,
}: ModalDialogProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} size={size}>
      <Stack gap="md">
        {children}
        {!hideFooter && (
          <>
            <Divider />
            <Group justify="flex-end">
              <Button variant="light" onClick={onClose} disabled={loading}>
                {cancelLabel}
              </Button>
              {onConfirm && (
                <Button
                  color={confirmColor}
                  onClick={onConfirm}
                  disabled={confirmDisabled || loading}
                  loading={loading}
                >
                  {confirmLabel}
                </Button>
              )}
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}
