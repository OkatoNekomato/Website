import { FormEvent, useEffect, useState } from 'react';
import {
  Button,
  FileInput,
  Flex,
  Group,
  Input,
  Modal,
  Select,
  TagsInput,
  Text,
  Textarea,
  TextInput,
  Paper,
  Box,
  Stack,
} from '@mantine/core';
import {
  TEnpassField,
  TEnpassFolder,
  TEnpassItem,
  TEnpassSecretFile,
  TFolder,
  TSecret,
} from '../../../../types';
import { selectSecrets, useAppSelector, useSecrets } from '../../../../stores';
import { useTranslation } from 'react-i18next';
import { useDisclosure } from '@mantine/hooks';
import { v7 as uuid } from 'uuid';
import { useForm } from '@mantine/form';
import { getProperty, mapValuesToSecretProperties, trimText } from '../../../../shared';
import { PasswordInputWithCapsLock } from '../../../../components';

export const Secrets = () => {
  const { t } = useTranslation('secrets');
  const {
    filteredSecrets,
    selectedSecret,
    selectedFolder,
    setSecrets,
    setFolders,
    setSelectedSecret,
    setFilteredSecrets,
  } = useSecrets();
  const { secrets, folders } = useAppSelector(selectSecrets);
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalState, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);
  const [importModalState, { open: openImportModal, close: closeImportModal }] =
    useDisclosure(false);
  const [importedSecretFile, setImportedSecretFile] = useState<File | null>(null);

  const secretsToRender = selectedFolder
    ? (filteredSecrets ?? []).filter((s) =>
        s.folders?.value?.map((f) => f).includes(selectedFolder.id),
      )
    : filteredSecrets;

  const addSecretForm = useForm({
    initialValues: {
      label: '',
      username: '',
      email: '',
      password: '',
      websites: [] as string[],
      phone: '',
      mfa: '',
      notes: '',
      folder: selectedFolder ? selectedFolder.id : null,
    },
    validate: {
      label: (val) => (val.length < 1 ? 'fields.label.canNotBeEmpty' : null),
    },
  });

  useEffect(() => {
    handleSearch(searchQuery);
  }, [secrets]);

  const addSecret = async (e: FormEvent) => {
    e.preventDefault();
    if (addSecretForm.validate().hasErrors) {
      return;
    }
    const { folder: folderId, websites: websites, ...stringValues } = addSecretForm.values;

    if (stringValues.label.length < 1) {
      return;
    }

    closeAddModal();
    addSecretForm.reset();

    const secret: TSecret = {
      id: uuid(),
      folders: getProperty<string[]>(folderId ? [folderId] : []),
      lastUpdated: Date.now(),
      created: Date.now(),
      ...mapValuesToSecretProperties(stringValues),
      website: getProperty<string[]>(websites),
    };

    const newSecrets = [secret, ...(secrets ?? [])];
    setSecrets(newSecrets);
    setFilteredSecrets(newSecrets);
  };

  const importSecrets = async () => {
    if (importedSecretFile?.type != 'application/json') {
      return;
    }

    const fileContent = JSON.parse(await importedSecretFile?.text()) as TEnpassSecretFile;
    const importedSecrets: TSecret[] = [];
    const importedFolders: TFolder[] = [];

    if (fileContent.items) {
      fileContent.items.map((item: TEnpassItem) => {
        if ((secrets ?? []).find((s) => s.id === item.uuid)) {
          return;
        }

        const fields = item.fields;

        const importedWebsiteRawUrl =
          fields.find((f: TEnpassField) => f.type === 'url')?.value ?? '';
        const importedWebsiteUrl =
          importedWebsiteRawUrl.trim() !== '' ? [importedWebsiteRawUrl] : [];
        const importedWebsites = getProperty<string[]>(importedWebsiteUrl);

        importedSecrets.push({
          id: item.uuid,
          folders: getProperty((item.folders ?? []).map((e) => e)),
          label: getProperty(item.title),
          username: getProperty(
            fields.find((f: TEnpassField) => f.type === 'username')?.value ?? '',
          ),
          email: getProperty(fields.find((f: TEnpassField) => f.type === 'email')?.value ?? ''),
          password: getProperty(
            fields.find((f: TEnpassField) => f.type === 'password')?.value ?? '',
          ),
          website: importedWebsites,
          phone: getProperty(fields.find((f: TEnpassField) => f.type === 'phone')?.value ?? ''),
          mfa: getProperty(fields.find((f: TEnpassField) => f.type === 'totp')?.value ?? ''),
          notes: getProperty(item.note),
          lastUpdated: item.updated_at * 1000,
          created: item.createdAt * 1000,
        });
      });
    }

    if (fileContent.folders) {
      fileContent.folders.map((folder: TEnpassFolder) => {
        if (folders.find((f) => f.id === folder.uuid)) {
          return;
        }

        importedFolders.push({
          id: folder.uuid,
          label: folder.title,
          lastUpdated: folder.updated_at * 1000,
          created: folder.updated_at * 1000,
        });
      });
    }

    const newSecrets = [...importedSecrets, ...(secrets ?? [])];
    const newFolders = [...importedFolders, ...folders];

    if (importedSecrets.length > 0) {
      setSecrets(newSecrets);
      setFilteredSecrets(newSecrets);
    }

    if (importedFolders.length > 0) {
      setFolders(newFolders);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredSecrets(secrets);
    } else {
      const filtered = (secrets ?? []).filter((secret) =>
        secret.label.value.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredSecrets(filtered);
    }
  };

  const getSecretWidth = (secret: TSecret) => {
    const label = secret.label?.value || '';
    const username = secret?.username?.value || secret?.email?.value || '';
    const totalLength = label.length + username.length;

    if (totalLength < 20) return '200px';
    if (totalLength < 35) return '250px';
    if (totalLength < 50) return '320px';
    return '100%';
  };

  const modalStyles = {
    content: {
      background: 'rgba(24, 24, 27, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(70, 70, 80, 0.4)',
    },
    header: {
      background: 'transparent',
    },
  };

  const inputStyles = {
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
  };

  return (
    <>
      <Modal
        centered={true}
        opened={addModalState}
        onClose={closeAddModal}
        size="lg"
        title={
          <Text size="lg" fw={600} c="gray.0">
            {t('modals.addSecret.title')}
          </Text>
        }
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
        overlayProps={{
          backgroundOpacity: 0.7,
          blur: 8,
        }}
        styles={modalStyles}
      >
        <form onSubmit={addSecret}>
          <Stack gap="md">
            <TextInput
              label={t('fields.label.title')}
              value={addSecretForm.values.label}
              onChange={(event) => addSecretForm.setFieldValue('label', event.currentTarget.value)}
              error={addSecretForm.errors.label && t(addSecretForm.errors.label.toString())}
              variant="filled"
              radius="md"
              size="md"
              styles={inputStyles}
            />
            <TextInput
              label={t('fields.username.title')}
              value={addSecretForm.values.username}
              onChange={(event) =>
                addSecretForm.setFieldValue('username', event.currentTarget.value)
              }
              variant="filled"
              radius="md"
              size="md"
              styles={inputStyles}
            />
            <TextInput
              label={t('fields.email.title')}
              value={addSecretForm.values.email}
              onChange={(event) => addSecretForm.setFieldValue('email', event.currentTarget.value)}
              type={'email'}
              variant="filled"
              radius="md"
              size="md"
              styles={inputStyles}
            />
            <PasswordInputWithCapsLock
              label={t('fields.password.title')}
              value={addSecretForm.values.password}
              onChange={(event) =>
                addSecretForm.setFieldValue('password', event.currentTarget.value)
              }
            />
            <TagsInput
              value={addSecretForm.values.websites}
              onChange={(newTags) => {
                addSecretForm.setFieldValue('websites', newTags);
              }}
              label={t('fields.website.title')}
              clearable
              variant="filled"
              radius="md"
              size="md"
              styles={inputStyles}
            />
            <TextInput
              label={t('fields.phone.title')}
              type={'phone'}
              value={addSecretForm.values.phone}
              onChange={(event) => addSecretForm.setFieldValue('phone', event.currentTarget.value)}
              variant="filled"
              radius="md"
              size="md"
              styles={inputStyles}
            />
            <TextInput
              label={t('fields.mfa.title')}
              value={addSecretForm.values.mfa}
              onChange={(event) => addSecretForm.setFieldValue('mfa', event.currentTarget.value)}
              variant="filled"
              radius="md"
              size="md"
              styles={inputStyles}
            />
            <Textarea
              label={t('fields.notes.title')}
              value={addSecretForm.values.notes}
              onChange={(event) => addSecretForm.setFieldValue('notes', event.currentTarget.value)}
              variant="filled"
              radius="md"
              minRows={3}
              size="md"
              styles={inputStyles}
            />

            {folders.length > 0 && (
              <Select
                label={t('fields.folder.title')}
                data={folders.map((f) => ({ value: f.id, label: f.label }))}
                value={addSecretForm.values.folder}
                onChange={(value) => {
                  if (!value) {
                    return;
                  }

                  addSecretForm.setFieldValue('folder', value);
                }}
                variant="filled"
                radius="md"
                size="md"
                styles={inputStyles}
              />
            )}
          </Stack>

          <Group mt="xl" justify="end">
            <Button
              radius="md"
              variant="subtle"
              color="gray"
              onClick={() => {
                closeAddModal();
                addSecretForm.reset();
              }}
            >
              {t('modals.addSecret.buttons.cancel')}
            </Button>
            <Button type="submit" radius="md">
              {t('modals.addSecret.buttons.submit')}
            </Button>
          </Group>
        </form>
      </Modal>
      <Modal
        centered={true}
        opened={importModalState}
        onClose={closeImportModal}
        size="md"
        title={
          <Text size="lg" fw={600} c="gray.0">
            {t('modals.importSecrets.title')}
          </Text>
        }
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
        overlayProps={{
          backgroundOpacity: 0.7,
          blur: 8,
        }}
        styles={modalStyles}
      >
        <Stack gap="md">
          <FileInput
            label={t('modals.importSecrets.fileInput.label')}
            placeholder={t('modals.importSecrets.fileInput.placeholder')}
            multiple={false}
            value={importedSecretFile}
            onChange={setImportedSecretFile}
            variant="filled"
            radius="md"
            size="md"
            styles={inputStyles}
          />
        </Stack>

        <Group mt="xl" justify="end">
          <Button
            radius="md"
            variant="subtle"
            color="gray"
            onClick={() => {
              closeImportModal();
              setImportedSecretFile(null);
            }}
          >
            {t('modals.importSecrets.buttons.cancel')}
          </Button>
          <Button
            radius="md"
            onClick={async () => {
              await importSecrets();
              closeImportModal();
              setImportedSecretFile(null);
            }}
          >
            {t('modals.importSecrets.buttons.submit')}
          </Button>
        </Group>
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
          <Button
            fullWidth
            radius="md"
            size="md"
            onClick={() => {
              addSecretForm.values.folder = selectedFolder ? selectedFolder.id : null;
              openAddModal();
            }}
          >
            {t('buttons.add')}
          </Button>
          <Button fullWidth radius="md" size="md" variant="light" onClick={openImportModal}>
            {t('buttons.import')}
          </Button>
        </Flex>
        <Text size="sm" c="dimmed" mb="md" fw={500}>
          {t('elements.title')}: {(secretsToRender ?? []).length}
        </Text>
        {(secretsToRender ?? [])?.length > 0 ? (
          <Flex wrap="wrap" gap="md" justify="flex-start">
            {(secretsToRender ?? []).map((secret) => (
              <Paper
                key={secret.id}
                p="md"
                radius="md"
                style={{
                  cursor: 'pointer',
                  background:
                    selectedSecret?.id === secret.id
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)'
                      : 'rgba(39, 39, 42, 0.5)',
                  border: `1px solid ${selectedSecret?.id === secret.id ? 'rgba(59, 130, 246, 0.3)' : 'rgba(70, 70, 80, 0.3)'}`,
                  transition: 'all 0.2s ease',
                  minHeight: '80px',
                  minWidth: getSecretWidth(secret),
                  maxWidth: '100%',
                  flex: '1 1 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
                onClick={() => {
                  setSelectedSecret(secret);
                }}
              >
                <Text
                  size="sm"
                  fw={600}
                  c={selectedSecret?.id === secret.id ? 'blue.4' : 'gray.0'}
                  mb={4}
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {secret.label?.value}
                </Text>
                <Text
                  size="xs"
                  c={selectedSecret?.id === secret.id ? 'blue.5' : 'dimmed'}
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {secret?.username?.value || secret?.email?.value || ''}
                </Text>
              </Paper>
            ))}
          </Flex>
        ) : (
          <Text c="dimmed" size="sm" ta="center" py="xl">
            {t('elements.notFound')}
          </Text>
        )}
      </Box>
    </>
  );
};