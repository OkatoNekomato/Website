import { FormEvent, useEffect, useState } from 'react';
import {
  Button,
  ComboboxItem,
  Flex,
  Group,
  Input,
  Stack,
  Modal,
  Select,
  Text,
  TextInput,
  Paper,
  Box,
} from '@mantine/core';
import { TFolder } from '../../../../types';
import { selectSecrets, useAppSelector, useSecrets } from '../../../../stores';
import { useTranslation } from 'react-i18next';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { v7 as uuid } from 'uuid';
import { getProperty, sendSuccessNotification } from '../../../../shared';

interface FoldersProps {
  allElementsButtonClick?: () => void;
}

export const Folders = ({ allElementsButtonClick }: FoldersProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const { t } = useTranslation('folders');
  const { selectedFolder, setFolders, setSelectedFolder, setSecrets } = useSecrets();

  const { secrets, folders } = useAppSelector(selectSecrets);
  const [filteredFolders, setFilteredFolders] = useState<TFolder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalState, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);
  const [deleteModalState, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [folderForDelete, setFolderForDelete] = useState<ComboboxItem | null>(null);

  const addFolderForm = useForm({
    initialValues: {
      label: '',
    },
    validate: {
      label: (val) => (val.length < 1 ? 'fields.label.canNotBeEmpty' : null),
    },
  });

  useEffect(() => {
    handleSearch(searchQuery);
  }, [folders]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredFolders(folders);
    } else {
      const filtered = folders.filter((folder) =>
        folder.label.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredFolders(filtered);
    }
  };

  const addFolder = async (e: FormEvent) => {
    e.preventDefault();
    if (addFolderForm.validate().hasErrors) {
      return;
    }

    const values = addFolderForm.values;

    if (values.label.length < 1 || secrets === null) {
      return;
    }

    closeAddModal();
    const folder: TFolder = {
      id: uuid(),
      lastUpdated: Date.now(),
      created: Date.now(),
      ...values,
    };

    const newFolders = [folder, ...folders];
    setFolders(newFolders);
    setFilteredFolders(newFolders);
    sendSuccessNotification(t('notifications:folder.addedSuccessfully'));
  };

  const deleteFolder = async (e: FormEvent) => {
    e.preventDefault();
    if (!folderForDelete || !folderForDelete.value) {
      return;
    }

    const folder = JSON.parse(folderForDelete.value) as TFolder;

    const updatedSecrets = (secrets ?? []).map((secret) => ({
      ...secret,
      folders:
        getProperty<string[]>(secret.folders?.value.filter((f) => f !== folder.id)) ??
        getProperty<string[]>([]),
    }));

    const newFolders = folders.filter((f) => f.id !== folder.id);

    setFolders(newFolders);
    setFilteredFolders(newFolders);
    setSecrets(updatedSecrets);
    closeDeleteModal();
    sendSuccessNotification(t('notifications:folder.deletedSuccessfully'));
    setFolderForDelete(null);
  };

  return (
    <>
      <Modal
        centered={true}
        opened={addModalState}
        onClose={closeAddModal}
        size="md"
        title={
          <Text size="lg" fw={600} c="gray.0">
            {t('modals.addFolder.title')}
          </Text>
        }
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
        overlayProps={{
          backgroundOpacity: 0.7,
          blur: 8,
        }}
        styles={{
          content: {
            background: 'rgba(24, 24, 27, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(70, 70, 80, 0.4)',
          },
          header: {
            background: 'transparent',
          },
        }}
      >
        <form onSubmit={addFolder}>
          <Stack gap="md">
            <TextInput
              label={t('fields.label.title')}
              value={addFolderForm.values.label}
              onChange={(event) => addFolderForm.setFieldValue('label', event.currentTarget.value)}
              error={addFolderForm.errors.label && t(addFolderForm.errors.label.toString())}
              variant="filled"
              radius="md"
              size="md"
              styles={{
                input: {
                  background: 'rgba(40, 40, 50, 0.5)',
                  border: '1px solid rgba(70, 70, 80, 0.3)',
                  color: '#e4e4e7',
                  '&:focus': {
                    border: '1px solid rgba(100, 149, 237, 0.5)',
                  },
                },
                label: {
                  color: '#a1a1aa',
                  marginBottom: '8px',
                },
              }}
            />
          </Stack>

          <Group mt="xl" justify="end">
            <Button
              radius="md"
              variant="subtle"
              color="gray"
              onClick={() => {
                closeAddModal();
                addFolderForm.reset();
              }}
            >
              {t('modals.addFolder.buttons.cancel')}
            </Button>
            <Button type="submit" radius="md">
              {t('modals.addFolder.buttons.submit')}
            </Button>
          </Group>
        </form>
      </Modal>
      <Modal
        centered={true}
        opened={deleteModalState}
        onClose={closeDeleteModal}
        size="md"
        title={
          <Text size="lg" fw={600} c="gray.0">
            {t('modals.deleteFolder.title')}
          </Text>
        }
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
        overlayProps={{
          backgroundOpacity: 0.7,
          blur: 8,
        }}
        styles={{
          content: {
            background: 'rgba(24, 24, 27, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(70, 70, 80, 0.4)',
          },
          header: {
            background: 'transparent',
          },
        }}
      >
        <form onSubmit={deleteFolder}>
          <Stack gap="md">
            <Select
              data={folders.map((folder) => ({
                value: JSON.stringify(folder),
                label: folder.label,
              }))}
              value={folderForDelete ? folderForDelete.value : null}
              onChange={(_value, option) => setFolderForDelete(option)}
              variant="filled"
              radius="md"
              size="md"
              styles={{
                input: {
                  background: 'rgba(40, 40, 50, 0.5)',
                  border: '1px solid rgba(70, 70, 80, 0.3)',
                  color: '#e4e4e7',
                },
              }}
            />
          </Stack>

          <Group mt="xl" justify="end">
            <Button
              radius="md"
              variant="subtle"
              color="gray"
              onClick={() => {
                closeDeleteModal();
                setFolderForDelete(null);
              }}
            >
              {t('modals.deleteFolder.buttons.cancel')}
            </Button>
            <Button type="submit" radius="md" color="red">
              {t('modals.deleteFolder.buttons.submit')}
            </Button>
          </Group>
        </form>
      </Modal>
      <Box>
        <Input
          placeholder={t('search.placeholder')}
          mb="md"
          value={searchQuery}
          onChange={(e) => handleSearch(e.currentTarget.value)}
          variant="filled"
          radius="md"
          size="md"
          styles={{
            input: {
              background: 'rgba(40, 40, 50, 0.5)',
              border: '1px solid rgba(70, 70, 80, 0.3)',
              color: '#e4e4e7',
              '&::placeholder': {
                color: '#71717a',
              },
              '&:focus': {
                border: '1px solid rgba(100, 149, 237, 0.5)',
              },
            },
          }}
        />
        <Flex gap="md" mb="lg">
          <Button fullWidth radius="md" size="md" onClick={openAddModal}>
            {t('buttons.add')}
          </Button>
          <Button fullWidth radius="md" size="md" variant="light" color="red" onClick={openDeleteModal}>
            {t('buttons.delete')}
          </Button>
        </Flex>
        <Text size="sm" c="dimmed" mb="md" fw={500}>
          {t('folders.title')}: {filteredFolders.length}
        </Text>
        <Stack gap="sm">
          <Paper
            p="md"
            radius="md"
            style={{
              cursor: 'pointer',
              background: !selectedFolder
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)'
                : 'rgba(39, 39, 42, 0.5)',
              border: `1px solid ${!selectedFolder ? 'rgba(59, 130, 246, 0.3)' : 'rgba(70, 70, 80, 0.3)'}`,
              transition: 'all 0.2s ease',
            }}
            onClick={() => {
              setSelectedFolder(null);
              allElementsButtonClick && allElementsButtonClick();
            }}
          >
            <Text size={isMobile ? 'md' : 'sm'} fw={500} c={!selectedFolder ? 'blue.4' : 'gray.3'}>
              {t('allElements')}
            </Text>
          </Paper>

          {filteredFolders?.length > 0 ? (
            filteredFolders.map((folder) => (
              <Paper
                key={folder.id}
                p="md"
                radius="md"
                style={{
                  cursor: 'pointer',
                  background:
                    selectedFolder?.id === folder.id
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)'
                      : 'rgba(39, 39, 42, 0.5)',
                  border: `1px solid ${selectedFolder?.id === folder.id ? 'rgba(59, 130, 246, 0.3)' : 'rgba(70, 70, 80, 0.3)'}`,
                  transition: 'all 0.2s ease',
                }}
                onClick={() => {
                  setSelectedFolder(folder);
                }}
              >
                <Text
                  size={isMobile ? 'md' : 'sm'}
                  fw={500}
                  c={selectedFolder?.id === folder.id ? 'blue.4' : 'gray.3'}
                >
                  {folder.label}
                </Text>
              </Paper>
            ))
          ) : (
            <Text c="dimmed" size="sm" ta="center" py="md">
              {t('folders.notFound')}
            </Text>
          )}
        </Stack>
      </Box>
    </>
  );
};