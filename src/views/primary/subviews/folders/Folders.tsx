import { useEffect, useState, FormEvent } from 'react';
import {
  ActionIcon,
  Box,
  Divider,
  Flex,
  Group,
  Input,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMediaQuery } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { IconCheck, IconFolder, IconPlus, IconTrash } from '@tabler/icons-react';
import { v7 as uuid } from 'uuid';
import { TFolder } from '../../../../types';
import { selectSecrets, useAppSelector, useSecrets } from '../../../../stores';
import { getProperty, sendSuccessNotification } from '../../../../shared';

interface FoldersProps {
  allElementsButtonClick?: () => void;
}

export const Folders = ({ allElementsButtonClick }: FoldersProps) => {
  const { t } = useTranslation('folders');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { secrets, folders } = useAppSelector(selectSecrets);
  const { selectedFolder, setFolders, setSelectedFolder, setSecrets } = useSecrets();

  const [filteredFolders, setFilteredFolders] = useState<TFolder[]>(folders);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const form = useForm({
    initialValues: { label: '' },
    validate: { label: (v) => (v.trim().length < 1 ? t('fields.label.canNotBeEmpty') : null) },
  });

  useEffect(() => handleSearch(search), [folders]);

  const handleSearch = (q: string) => {
    setSearch(q);
    setFilteredFolders(
      q.trim() ? folders.filter((f) => f.label.toLowerCase().includes(q.toLowerCase())) : folders,
    );
  };

  const addFolder = (e: FormEvent) => {
    e.preventDefault();
    if (form.validate().hasErrors || !secrets) return;

    const newFolder: TFolder = {
      id: uuid(),
      label: form.values.label.trim(),
      created: Date.now(),
      lastUpdated: Date.now(),
    };

    const updated = [newFolder, ...folders];
    setFolders(updated);
    setFilteredFolders(updated);
    sendSuccessNotification(t('notifications:folder.addedSuccessfully'));
    form.reset();
  };

  const deleteFolder = (id: string) => {
    const folder = folders.find((f) => f.id === id);
    if (!folder) return;

    const updatedSecrets = (secrets ?? []).map((s) => ({
      ...s,
      folders: getProperty<string[]>(s.folders?.value.filter((fid) => fid !== id)) ?? [],
    }));

    const updatedFolders = folders.filter((f) => f.id !== id);

    setFolders(updatedFolders);
    setFilteredFolders(updatedFolders);
    setSecrets(updatedSecrets);
    sendSuccessNotification(t('notifications:folder.deletedSuccessfully'));
    setConfirmDelete(null);
  };

  return (
    <Box>
      <form onSubmit={addFolder}>
        <Flex gap='xs' mb='md' align='center'>
          <TextInput
            placeholder={t('fields.label.placeholder')}
            {...form.getInputProps('label')}
            flex={1}
            radius='md'
            variant='filled'
            styles={{
              input: {
                backgroundColor: '#0f0f12',
                border: '1px solid #2a2a2e',
                color: '#f2f3f5',
              },
            }}
          />
          <Tooltip label={t('buttons.add')}>
            <ActionIcon type='submit' color='blue' variant='filled' radius='md' size='lg'>
              <IconPlus size={18} />
            </ActionIcon>
          </Tooltip>
        </Flex>
      </form>

      <Input
        placeholder={t('search.placeholder')}
        mb='sm'
        value={search}
        onChange={(e) => handleSearch(e.currentTarget.value)}
        radius='md'
        variant='filled'
        styles={{
          input: {
            backgroundColor: '#0f0f12',
            border: '1px solid #2a2a2e',
            color: '#f2f3f5',
          },
        }}
      />

      <Divider my='xs' color='rgba(255,255,255,0.08)' />
      <Text size='sm' c='dimmed' mb='xs' fw={500}>
        {t('folders.title')}: {filteredFolders.length}
      </Text>

      <ScrollArea h={isMobile ? 300 : 420} offsetScrollbars>
        <Stack gap='xs'>
          <Paper
            p='sm'
            radius='md'
            onClick={() => {
              setSelectedFolder(null);
              allElementsButtonClick?.();
            }}
            style={{
              cursor: 'pointer',
              backgroundColor: '#141418',
              border: !selectedFolder
                ? '1px solid rgba(0,122,255,0.35)'
                : '1px solid rgba(0,122,255,0.25)',
              boxShadow: !selectedFolder ? '0 0 15px rgba(0,122,255,0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Flex align='center' gap='xs'>
              <IconFolder size={16} color={!selectedFolder ? '#007aff' : '#9ca3af'} />
              <Text size='sm' fw={500} c={!selectedFolder ? 'blue.4' : 'gray.3'}>
                {t('allElements')}
              </Text>
            </Flex>
          </Paper>

          {filteredFolders.length ? (
            filteredFolders.map((folder) => (
              <Paper
                key={folder.id}
                p='sm'
                radius='md'
                style={{
                  backgroundColor: '#141418',
                  border:
                    selectedFolder?.id === folder.id
                      ? '1px solid rgba(0,122,255,0.35)'
                      : '1px solid rgba(0,122,255,0.2)',
                  boxShadow:
                    selectedFolder?.id === folder.id ? '0 0 20px rgba(0,122,255,0.08)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <Flex align='center' justify='space-between'>
                  <Flex
                    align='center'
                    gap='xs'
                    onClick={() => setSelectedFolder(folder)}
                    style={{ cursor: 'pointer' }}
                  >
                    <IconFolder
                      size={16}
                      color={selectedFolder?.id === folder.id ? '#007aff' : '#9ca3af'}
                    />
                    <Text
                      size='sm'
                      fw={500}
                      c={selectedFolder?.id === folder.id ? 'blue.4' : 'gray.3'}
                    >
                      {folder.label}
                    </Text>
                  </Flex>

                  {confirmDelete === folder.id ? (
                    <Group gap={4}>
                      <ActionIcon
                        color='red'
                        variant='light'
                        radius='sm'
                        onClick={() => deleteFolder(folder.id)}
                      >
                        <IconCheck size={14} />
                      </ActionIcon>
                      <ActionIcon
                        color='gray'
                        variant='light'
                        radius='sm'
                        onClick={() => setConfirmDelete(null)}
                      >
                        ✕
                      </ActionIcon>
                    </Group>
                  ) : (
                    <Tooltip label={t('buttons.delete')}>
                      <ActionIcon
                        color='red'
                        variant='subtle'
                        radius='md'
                        onClick={() => setConfirmDelete(folder.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Flex>
              </Paper>
            ))
          ) : (
            <Text size='sm' c='dimmed' ta='center' py='md'>
              {t('folders.notFound')}
            </Text>
          )}
        </Stack>
      </ScrollArea>
    </Box>
  );
};
