import { useState, useEffect, FormEvent } from 'react';
import {
  Box,
  Button,
  FileInput,
  Flex,
  Group,
  Input,
  Modal,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  TagsInput,
  Text,
  TextInput,
  Textarea,
  Select,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { v7 as uuid } from 'uuid';
import { useForm } from '@mantine/form';
import {
  TEnpassField,
  TEnpassFolder,
  TEnpassItem,
  TEnpassSecretFile,
  TFolder,
  TSecret,
} from '../../../../types';
import { selectSecrets, setFolders, useAppSelector, useSecrets } from '../../../../stores';
import { getProperty, mapValuesToSecretProperties } from '../../../../shared';
import { PasswordInputWithCapsLock } from '../../../../components';
import { Secret } from './Secret';

export const Secrets = (): JSX.Element => {
  const { t } = useTranslation('secrets');
  const {
    filteredSecrets,
    selectedSecret,
    selectedFolder,
    setSecrets,
    setSelectedSecret,
    setFilteredSecrets,
  } = useSecrets();
  const { secrets, folders } = useAppSelector(selectSecrets);

  const [searchQuery, setSearchQuery] = useState('');
  const [addModal, addModalCtrl] = useDisclosure(false);
  const [editModal, editModalCtrl] = useDisclosure(false);
  const [importModal, importModalCtrl] = useDisclosure(false);
  const [importedSecretFile, setImportedSecretFile] = useState<File | null>(null);

  const secretsToRender = selectedFolder
    ? (filteredSecrets ?? []).filter((s) => s.folders?.value?.includes(selectedFolder.id))
    : filteredSecrets;

  const form = useForm({
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
    validate: { label: (val) => (val.length < 1 ? 'fields.label.canNotBeEmpty' : null) },
  });

  useEffect(() => {
    if (selectedSecret && editModalCtrl.open()) {
      form.setValues({
        label: selectedSecret.label?.value || '',
        username: selectedSecret.username?.value || '',
        email: selectedSecret.email?.value || '',
        password: selectedSecret.password?.value || '',
        websites: selectedSecret.website?.value || [],
        phone: selectedSecret.phone?.value || '',
        mfa: selectedSecret.mfa?.value || '',
        notes: selectedSecret.notes?.value || '',
        folder: selectedSecret.folders?.value?.[0] || null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSecret]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setFilteredSecrets(secrets);
      return;
    }
    const term = q.toLowerCase();
    setFilteredSecrets(
      (secrets ?? []).filter((s) => (s.label?.value || '').toLowerCase().includes(term)),
    );
  };

  const addSecret = (e: FormEvent) => {
    e.preventDefault();
    if (form.validate().hasErrors) return;

    const { folder, websites, ...fields } = form.values;
    const newSecret: TSecret = {
      id: uuid(),
      folders: getProperty<string[]>(folder ? [folder] : []),
      lastUpdated: Date.now(),
      created: Date.now(),
      ...mapValuesToSecretProperties(fields),
      website: getProperty<string[]>(websites),
    };

    const updated = [newSecret, ...(secrets ?? [])];
    setSecrets(updated);
    setFilteredSecrets(updated);
    addModalCtrl.close();
    form.reset();
  };

  const editSecret = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSecret) return;
    if (form.validate().hasErrors) return;

    const { folder, websites, ...fields } = form.values;
    const updatedOne: TSecret = {
      ...selectedSecret,
      folders: getProperty<string[]>(folder ? [folder] : []),
      lastUpdated: Date.now(),
      ...mapValuesToSecretProperties(fields),
      website: getProperty<string[]>(websites),
    };

    const list = secrets ?? [];
    const updatedList = list.map((s) => (s.id === updatedOne.id ? updatedOne : s));
    setSecrets(updatedList);
    setFilteredSecrets(updatedList);
    editModalCtrl.close();
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

  const modalStyles = {
    content: {
      background: 'rgba(20,20,22,0.92)',
      backdropFilter: 'blur(14px)',
      border: '1px solid rgba(60,60,65,0.5)',
      borderRadius: 12,
    },
  };

  const inputStyles = {
    input: {
      background: 'rgba(28,28,30,0.65)',
      border: '1px solid rgba(60,60,65,0.5)',
      color: '#e6e7ea',
      '&:focus': { border: '1px solid rgba(59,130,246,0.85)' },
    },
    label: { color: '#bfc5cc' },
  };

  return (
    <Box>
      <Input
        placeholder={t('search.placeholder')}
        mb='md'
        value={searchQuery}
        onChange={(e) => handleSearch(e.currentTarget.value)}
        variant='filled'
        radius='md'
        size='md'
        styles={{
          input: {
            background: 'rgba(20,20,22,0.6)',
            border: '1px solid rgba(50,50,55,0.5)',
            color: '#e6e7ea',
          },
        }}
      />

      <Flex gap='md' mb='lg'>
        <Button
          fullWidth
          radius='md'
          size='md'
          color='blue'
          onClick={() => {
            form.reset();
            addModalCtrl.open();
          }}
        >
          {t('buttons.add')}
        </Button>
        <Button
          fullWidth
          radius='md'
          size='md'
          variant='light'
          onClick={() => importModalCtrl.open()}
          color='blue'
        >
          {t('buttons.import')}
        </Button>
      </Flex>

      <ScrollArea style={{ maxHeight: 540 }}>
        {(secretsToRender ?? []).length > 0 ? (
          <SimpleGrid cols={2} spacing='md'>
            {secretsToRender!.map((secret) => {
              const isSel = selectedSecret?.id === secret.id;
              return (
                <Paper
                  key={secret.id}
                  p='md'
                  radius='md'
                  withBorder
                  onClick={() => {
                    setSelectedSecret(secret);
                  }}
                  style={{
                    cursor: 'pointer',
                    background: isSel
                      ? 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(37,99,235,0.03))'
                      : 'rgba(28,28,30,0.6)',
                    border: isSel
                      ? '1px solid rgba(59,130,246,0.25)'
                      : '1px solid rgba(60,60,65,0.5)',
                    transition: 'all 120ms ease',
                  }}
                >
                  <Text size='sm' fw={600} c={isSel ? 'blue.4' : 'gray.0'} mb={4} lineClamp={1}>
                    {secret.label?.value}
                  </Text>
                  <Text size='xs' c={isSel ? 'blue.3' : 'dimmed'} lineClamp={1}>
                    {secret.username?.value || secret.email?.value || ''}
                  </Text>
                </Paper>
              );
            })}
          </SimpleGrid>
        ) : (
          <Box py='xl'>
            <Text c='dimmed' ta='center'>
              {t('elements.notFound')}
            </Text>
          </Box>
        )}
      </ScrollArea>

      {selectedSecret && (
        <Box mt='xl'>
          <Secret sourceSecret={selectedSecret} onEdit={() => editModalCtrl.open()} />
        </Box>
      )}

      <Modal
        centered
        opened={addModal}
        onClose={() => addModalCtrl.close()}
        size='lg'
        styles={modalStyles as any}
        title={
          <Text size='lg' fw={600} c='gray.0'>
            {t('modals.addSecret.title')}
          </Text>
        }
      >
        <form onSubmit={addSecret}>
          <Stack spacing='md'>
            <TextInput
              label={t('fields.label.title')}
              {...form.getInputProps('label')}
              styles={inputStyles}
            />
            <TextInput
              label={t('fields.username.title')}
              {...form.getInputProps('username')}
              styles={inputStyles}
            />
            <TextInput
              label={t('fields.email.title')}
              type='email'
              {...form.getInputProps('email')}
              styles={inputStyles}
            />
            <PasswordInputWithCapsLock
              label={t('fields.password.title')}
              value={form.values.password}
              onChange={(e) => form.setFieldValue('password', e.currentTarget.value)}
            />
            <TagsInput
              label={t('fields.website.title')}
              {...form.getInputProps('websites')}
              styles={inputStyles}
              clearable
            />
            <TextInput
              label={t('fields.phone.title')}
              {...form.getInputProps('phone')}
              styles={inputStyles}
            />
            <TextInput
              label={t('fields.mfa.title')}
              {...form.getInputProps('mfa')}
              styles={inputStyles}
            />
            <Textarea
              label={t('fields.notes.title')}
              {...form.getInputProps('notes')}
              styles={inputStyles}
              minRows={3}
            />
            {folders.length > 0 && (
              <Select
                label={t('fields.folder.title')}
                data={folders.map((f) => ({ value: f.id, label: f.label }))}
                value={form.values.folder}
                onChange={(v) => v && form.setFieldValue('folder', v)}
                styles={inputStyles}
              />
            )}
          </Stack>
          <Group mt='xl' position='right'>
            <Button variant='subtle' color='gray' radius='md' onClick={() => addModalCtrl.close()}>
              {t('modals.addSecret.buttons.cancel')}
            </Button>
            <Button type='submit' color='blue' radius='md'>
              {t('modals.addSecret.buttons.submit')}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        centered
        opened={editModal}
        onClose={() => editModalCtrl.close()}
        size='lg'
        styles={modalStyles as any}
        title={
          <Text size='lg' fw={600} c='gray.0'>
            {t('modals.editSecret.title')}
          </Text>
        }
      >
        <form onSubmit={editSecret}>
          <Stack spacing='md'>
            <TextInput
              label={t('fields.label.title')}
              {...form.getInputProps('label')}
              styles={inputStyles}
            />
            <TextInput
              label={t('fields.username.title')}
              {...form.getInputProps('username')}
              styles={inputStyles}
            />
            <TextInput
              label={t('fields.email.title')}
              type='email'
              {...form.getInputProps('email')}
              styles={inputStyles}
            />
            <PasswordInputWithCapsLock
              label={t('fields.password.title')}
              value={form.values.password}
              onChange={(e) => form.setFieldValue('password', e.currentTarget.value)}
            />
            <TagsInput
              label={t('fields.website.title')}
              {...form.getInputProps('websites')}
              styles={inputStyles}
              clearable
            />
            <TextInput
              label={t('fields.phone.title')}
              {...form.getInputProps('phone')}
              styles={inputStyles}
            />
            <TextInput
              label={t('fields.mfa.title')}
              {...form.getInputProps('mfa')}
              styles={inputStyles}
            />
            <Textarea
              label={t('fields.notes.title')}
              {...form.getInputProps('notes')}
              styles={inputStyles}
              minRows={3}
            />
            {folders.length > 0 && (
              <Select
                label={t('fields.folder.title')}
                data={folders.map((f) => ({ value: f.id, label: f.label }))}
                value={form.values.folder}
                onChange={(v) => v && form.setFieldValue('folder', v)}
                styles={inputStyles}
              />
            )}
          </Stack>
          <Group mt='xl' position='right'>
            <Button variant='subtle' color='gray' radius='md' onClick={() => editModalCtrl.close()}>
              {t('modals.editSecret.buttons.cancel')}
            </Button>
            <Button type='submit' color='blue' radius='md'>
              {t('modals.editSecret.buttons.submit')}
            </Button>
          </Group>
        </form>
      </Modal>

      <Modal
        centered
        opened={importModal}
        onClose={() => importModalCtrl.close()}
        size='md'
        styles={modalStyles as any}
        title={
          <Text size='lg' fw={600} c='gray.0'>
            {t('modals.importSecrets.title')}
          </Text>
        }
      >
        <Stack>
          <FileInput
            label={t('modals.importSecrets.fileInput.label')}
            placeholder={t('modals.importSecrets.fileInput.placeholder')}
            multiple={false}
            value={importedSecretFile}
            onChange={setImportedSecretFile}
            variant='filled'
            radius='md'
            size='md'
            styles={inputStyles}
          />
        </Stack>
        <Group mt='xl' position='right'>
          <Button variant='subtle' color='gray' radius='md' onClick={() => importModalCtrl.close()}>
            {t('modals.importSecrets.buttons.cancel')}
          </Button>
          <Button
            radius='md'
            color='blue'
            onClick={async () => {
              await importSecrets();
              importModalCtrl.close();
              setImportedSecretFile(null);
            }}
          >
            {t('modals.importSecrets.buttons.submit')}
          </Button>
        </Group>
      </Modal>
    </Box>
  );
};
