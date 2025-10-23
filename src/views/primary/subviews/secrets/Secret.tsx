import { Box, Button, Divider, Flex, Group, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { IconTrash, IconEdit, IconClock } from '@tabler/icons-react';
import { TSecret } from '../../../../types';
import { useSecrets } from '../../../../stores';
import { useTranslation } from 'react-i18next';

interface SecretProps {
  sourceSecret: TSecret;
  onEdit?: () => void;
}

export function Secret({ sourceSecret, onEdit }: SecretProps) {
  const { deleteSecret, setSelectedSecret } = useSecrets();
  const { t } = useTranslation('secrets');

  const { label, username, email, password, website, phone, mfa, notes, created, lastUpdated } =
    sourceSecret;

  const formatDate = (timestamp?: number) => {
    if (!timestamp || isNaN(timestamp)) return t('fields.noDate');
    try {
      return new Intl.DateTimeFormat('ru-RU', {
        dateStyle: 'long',
        timeStyle: 'short',
      }).format(new Date(timestamp));
    } catch {
      return t('fields.invalidDate');
    }
  };

  const infoBlock = (title: string, value?: string | string[]) => {
    if (!value || (Array.isArray(value) ? value.length === 0 : String(value).trim() === '')) {
      return null;
    }
    return (
      <Box>
        <Text size='sm' c='dimmed' fw={600} mb={3}>
          {title}
        </Text>
        <Text size='sm' c='gray.0' fw={500} style={{ wordBreak: 'break-word', userSelect: 'text' }}>
          {Array.isArray(value) ? value.join(', ') : value}
        </Text>
      </Box>
    );
  };

  const handleDelete = async () => {
    setSelectedSecret(null);
    await deleteSecret(sourceSecret);
  };

  return (
    <Paper
      p='xl'
      radius='md'
      style={{
        background: 'rgba(22,22,26,0.75)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(10px)',
        minHeight: 420,
        boxShadow: '0 0 20px rgba(0,0,0,0.25) inset',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <Flex direction='column' gap='lg'>
        <Flex justify='space-between' align='center'>
          <Text size='xl' fw={700} c='gray.0'>
            {label?.value || t('fields.noTitle')}
          </Text>
          <Group spacing='xs'>
            {onEdit && (
              <Tooltip label={t('buttons.edit')} withArrow>
                <Button
                  variant='subtle'
                  color='blue'
                  size='sm'
                  px='sm'
                  onClick={onEdit}
                  leftSection={<IconEdit size={16} />}
                  style={{ transition: 'background 0.2s ease' }}
                >
                  {t('buttons.edit')}
                </Button>
              </Tooltip>
            )}
            <Tooltip label={t('buttons.delete')} withArrow>
              <Button
                variant='subtle'
                color='red'
                size='sm'
                px='sm'
                onClick={handleDelete}
                leftSection={<IconTrash size={16} />}
                style={{ transition: 'background 0.2s ease' }}
              >
                {t('buttons.delete')}
              </Button>
            </Tooltip>
          </Group>
        </Flex>

        <Divider color='rgba(255,255,255,0.06)' />

        <Stack spacing='sm' mt='xs'>
          {infoBlock(t('fields.username.title'), username?.value)}
          {infoBlock(t('fields.email.title'), email?.value)}
          {infoBlock(t('fields.password.title'), password?.value ? '••••••••' : undefined)}
          {infoBlock(t('fields.website.title'), website?.value)}
          {infoBlock(t('fields.phone.title'), phone?.value)}
          {infoBlock(t('fields.mfa.title'), mfa?.value)}
          {infoBlock(t('fields.notes.title'), notes?.value)}
        </Stack>

        <Divider mt='lg' color='rgba(255,255,255,0.06)' />

        <Group mt='xs' spacing='lg'>
          <Flex align='center' gap={6}>
            <IconClock size={14} color='gray' />
            <Text size='xs' c='dimmed'>
              {t('fields.updated')}: {formatDate(lastUpdated)}
            </Text>
          </Flex>
          <Flex align='center' gap={6}>
            <IconClock size={14} color='gray' />
            <Text size='xs' c='dimmed'>
              {t('fields.created')}: {formatDate(created)}
            </Text>
          </Flex>
        </Group>
      </Flex>
    </Paper>
  );
}
