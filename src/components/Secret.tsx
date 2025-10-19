import {
  Anchor,
  Button,
  CopyButton,
  Divider,
  Flex,
  Grid,
  Group,
  Modal,
  MultiSelect,
  Pill,
  TagsInput,
  Text,
  Textarea,
  TextInput,
  Title,
  UnstyledButton,
} from '@mantine/core';
import {
  FaAddressCard,
  FaClock,
  FaCopy,
  FaExternalLinkAlt,
  FaFolder,
  FaLock,
  FaPhoneAlt,
  FaRegEye,
  FaRegEyeSlash,
  FaStickyNote,
  FaUserAlt,
} from 'react-icons/fa';
import { TSecret } from '../types';
import { ReactNode, useEffect, useState } from 'react';
import { useDisclosure, useInterval, useMediaQuery } from '@mantine/hooks';
import {
  selectAuth,
  selectSecrets,
  updateSecret,
  useAppDispatch,
  useAppSelector,
  useSecrets,
} from '../stores';
import { useTranslation } from 'react-i18next';
import { MdOutlineAlternateEmail } from 'react-icons/md';
import {
  getCurrentSecretTimeProperty,
  getDateTimeFormatOptions,
  getProperty,
  sendSuccessNotification,
  trimText,
} from '../shared';
import { PasswordInputWithCapsLock } from './PasswordInputWithCapsLock.tsx';
import { TFunction } from 'i18next';
import { Si2Fas } from 'react-icons/si';

export const getCopyButton = (copy: string, t: TFunction<string, undefined>) => {
  return (
    <CopyButton value={copy} timeout={500}>
      {({ copied, copy }) => (
        <UnstyledButton
          size='xs'
          onClick={() => {
            copy();
            sendSuccessNotification(t('notifications:copied'));
          }}
        >
          <FaCopy size={18} color={copied ? '#3fa2ed' : 'gray'} />
        </UnstyledButton>
      )}
    </CopyButton>
  );
};

export const Secret = (props: { sourceSecret: TSecret; delete: () => Promise<void> }) => {
  const { setSelectedFolder } = useSecrets();
  const { secrets, folders } = useAppSelector(selectSecrets);
  const { t, i18n } = useTranslation('secrets');
  const { is12HoursFormat } = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [mfa, setMfa] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [secret, setSecret] = useState<TSecret | null>(null);
  const [editedSecret, setEditedSecret] = useState<TSecret | null>(null);
  const [submitModalState, { open: openSubmitModal, close: closeSubmitModal }] =
    useDisclosure(false);

  const dateTimeFormatOptions = getDateTimeFormatOptions(i18n.language, is12HoursFormat);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const mfaUpdateInterval = useInterval(() => mfaUpdate(), 100);

  const mfaUpdate = () => {
    if (!secret?.mfa?.value) {
      return;
    }

    setMfa(window.otplib.authenticator.generate(secret.mfa.value));
  };

  useEffect(() => {
    mfaUpdateInterval.start();

    return () => mfaUpdateInterval.stop();
  }, []);

  useEffect(() => {
    setSecret(props.sourceSecret);
    setEditedSecret(props.sourceSecret);
    setShowPassword(false);
  }, [props.sourceSecret]);

  useEffect(() => {
    if (!secret) {
      return;
    }

    if (secret.id !== props.sourceSecret.id) {
      setIsEditing(false);
    }
  }, [secret, props.sourceSecret]);

  useEffect(() => {
    setShowPassword(false);
  }, [isEditing]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditedSecret(secret);
  };

  const handleSave = async () => {
    if (!editedSecret || !secret || !secrets) {
      return;
    }

    const secretIndex = secrets.findIndex((s) => s.id === secret.id);
    if (secretIndex !== -1) {
      dispatch(
        updateSecret({
          editedSecret: { ...editedSecret, lastUpdated: Date.now() },
        }),
      );

      setSecret(editedSecret);
    }
    setIsEditing(false);
  };

  const renderField = (
    icon: ReactNode,
    label: string,
    value: string | string[],
    copyable = false,
    isPassword = false,
    isWebsite = false,
  ) => (
    <Grid align='center' mb='xs'>
      <Grid.Col span={isMobile ? 6 : 2.25}>
        <Group>
          {icon}
          <Text c='gray'>{label}</Text>
        </Group>
      </Grid.Col>
      <Grid.Col span={isMobile ? 4 : 3}>
        <Flex align='center' gap='sm'>
          {isPassword && (
            <Text c='white' style={{ wordBreak: 'break-word' }}>
              {!showPassword ? '••••••••' : trimText(value as string, 80)}
            </Text>
          )}
          {isWebsite && Array.isArray(value) && (
            <Flex direction='column' gap='xs'>
              {value.map((url, index) => (
                <Anchor
                  key={'website-secret' + index}
                  href={url.startsWith('http') ? url : `https://${url}`}
                  target='_blank'
                  underline='never'
                  style={{ wordBreak: 'break-word' }}
                >
                  {trimText(url, 80)}
                </Anchor>
              ))}
            </Flex>
          )}
          {!isPassword && !isWebsite && (
            <Text c='white' style={{ wordBreak: 'break-word' }}>
              {trimText(value as string, 80)}
            </Text>
          )}
        </Flex>
      </Grid.Col>
      <Grid.Col span={1}>
        <Flex direction={'row'} gap={'sm'}>
          {copyable && getCopyButton(value as string, t)}
          {isPassword && (
            <UnstyledButton size='xs' onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <FaRegEyeSlash size={22} color={'gray'} />
              ) : (
                <FaRegEye size={22} color={'gray'} />
              )}
            </UnstyledButton>
          )}
        </Flex>
      </Grid.Col>
    </Grid>
  );

  const getEditorLayout = () => (
    <>
      <Flex direction={'column'} gap={'md'}>
        <Group>
          <FaAddressCard size={18} />
          <Text c='gray'>{t('fields.label.title')}:</Text>
          <TextInput
            w={'22rem'}
            value={editedSecret?.label?.value || ''}
            onChange={(e) =>
              editedSecret &&
              setEditedSecret({
                ...editedSecret,
                label: {
                  value: e.target.value,
                  ...getCurrentSecretTimeProperty(),
                },
              })
            }
          />
        </Group>
        <Group>
          <FaUserAlt size={18} />
          <Text c='gray'>{t('fields.username.title')}:</Text>
          <TextInput
            w={'18rem'}
            value={editedSecret?.username?.value || ''}
            onChange={(e) =>
              editedSecret &&
              setEditedSecret({
                ...editedSecret,
                username: { value: e.target.value, ...getCurrentSecretTimeProperty() },
              })
            }
          />
        </Group>
        <Group>
          <MdOutlineAlternateEmail size={18} />
          <Text c='gray'>{t('fields.email.title')}:</Text>
          <TextInput
            w={'17.6rem'}
            value={editedSecret?.email?.value || ''}
            onChange={(e) =>
              editedSecret &&
              setEditedSecret({
                ...editedSecret,
                email: { value: e.target.value, ...getCurrentSecretTimeProperty() },
              })
            }
          />
        </Group>
        <Group>
          <FaLock size={18} />
          <Text c='gray'>{t('fields.password.title')}:</Text>

          <PasswordInputWithCapsLock
            w={'23rem'}
            value={editedSecret?.password?.value || ''}
            onChange={(e) =>
              editedSecret &&
              setEditedSecret({
                ...editedSecret,
                password: { value: e.target.value, ...getCurrentSecretTimeProperty() },
              })
            }
          />
        </Group>
        <Group>
          <FaExternalLinkAlt size={18} />
          <Text c='gray'>{t('fields.website.title')}:</Text>
          <TagsInput
            w='22.5rem'
            value={editedSecret?.website?.value ?? []}
            onChange={(newTags) => {
              if (!editedSecret) return;

              setEditedSecret({
                ...editedSecret,
                website: {
                  value: [...newTags],
                  ...getCurrentSecretTimeProperty(),
                },
              });
            }}
            clearable
          />
        </Group>
        <Group>
          <FaPhoneAlt size={18} />
          <Text c='gray'>{t('fields.phone.title')}:</Text>
          <TextInput
            w={'22.7rem'}
            value={editedSecret?.phone?.value || ''}
            onChange={(e) =>
              editedSecret &&
              setEditedSecret({
                ...editedSecret,
                phone: { value: e.target.value, ...getCurrentSecretTimeProperty() },
              })
            }
          />
        </Group>
        <Group>
          <Si2Fas size={18} />
          <Text c='gray'>{t('fields.mfa.title')}:</Text>
          <TextInput
            w={'22.7rem'}
            value={editedSecret?.mfa?.value || ''}
            onChange={(e) =>
              editedSecret &&
              setEditedSecret({
                ...editedSecret,
                mfa: { value: e.target.value, ...getCurrentSecretTimeProperty() },
              })
            }
          />
        </Group>
        <Group>
          <FaStickyNote size={18} />
          <Text c='gray'>{t('fields.notes.title')}:</Text>
          <Textarea
            w={'22.8rem'}
            value={editedSecret?.notes?.value || ''}
            onChange={(e) =>
              editedSecret &&
              setEditedSecret({
                ...editedSecret,
                notes: { value: e.target.value, ...getCurrentSecretTimeProperty() },
              })
            }
          />
        </Group>

        <Group>
          <FaFolder />
          <Text c='gray'>{t('fields.folders.title')}:</Text>

          <MultiSelect
            w={'22.8rem'}
            data={folders.map((folder) => ({
              value: folder.id,
              label: folder.label,
              ...getCurrentSecretTimeProperty(),
            }))}
            value={editedSecret?.folders?.value?.map((e) => e) ?? []}
            onChange={(folders) =>
              editedSecret &&
              setEditedSecret({
                ...editedSecret,
                folders: getProperty(folders.map((e) => e)),
              })
            }
            clearable
          />
        </Group>
      </Flex>
    </>
  );

  const getLayout = () => (
    <>
      <Group align='center' mb='md'>
        <FaAddressCard size={24} />
        <Title order={3} c='white' style={{ wordBreak: 'break-word' }}>
          {secret?.label?.value}
        </Title>
      </Group>

      <Divider mb='md' />

      <Flex direction='column' gap='sm' mb='lg'>
        {secret?.username?.value &&
          renderField(
            <FaUserAlt size={18} />,
            t('fields.username.title'),
            secret.username.value,
            true,
          )}
        {secret?.email?.value &&
          renderField(
            <MdOutlineAlternateEmail size={18} />,
            t('fields.email.title'),
            secret.email.value,
            true,
          )}
        {secret?.password?.value &&
          renderField(
            <FaLock size={18} />,
            t('fields.password.title'),
            secret.password.value,
            true,
            true,
          )}
        {secret?.website?.value &&
          secret?.website?.value?.length > 0 &&
          renderField(
            <FaExternalLinkAlt size={18} />,
            t('fields.website.title'),
            secret.website.value,
            false,
            false,
            true,
          )}
        {secret?.phone?.value &&
          renderField(<FaPhoneAlt size={18} />, t('fields.phone.title'), secret.phone.value, true)}
        {secret?.mfa?.value && renderField(<Si2Fas size={18} />, t('fields.mfa.title'), mfa, true)}
        {secret?.notes?.value &&
          renderField(
            <FaStickyNote size={18} />,
            t('fields.notes.title'),
            secret.notes.value,
            true,
          )}

        {secret && secret?.folders?.value?.length > 0 && (
          <Grid align='center' mb='xs'>
            <Grid.Col span={2.25}>
              <Group>
                <FaFolder />
                <Text c='gray'>{t('fields.folders.title')}</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={5}>
              <Group gap={'sm'}>
                {secret.folders.value.map((secretFolder) => {
                  const f = folders.find((folder) => folder.id === secretFolder);
                  return f ? (
                    <Pill
                      key={f.id}
                      size='lg'
                      radius='lg'
                      bg='gray'
                      onClick={() => setSelectedFolder(f)}
                    >
                      {f.label}
                    </Pill>
                  ) : (
                    []
                  );
                })}
              </Group>
            </Grid.Col>
          </Grid>
        )}
      </Flex>

      {secret && (
        <Flex direction='column' gap='sm'>
          <Group>
            <FaClock size={18} />
            <Text c='gray'>
              {t('fields.lastUpdated.title')}: {dateTimeFormatOptions.format(secret.lastUpdated)}
            </Text>
          </Group>
          <Group>
            <FaClock size={18} />
            <Text c='gray'>
              {t('fields.created.title')}: {dateTimeFormatOptions.format(secret.created)}
            </Text>
          </Group>
        </Flex>
      )}
    </>
  );

  const getEditorButtonsLayout = () => (
    <>
      <Button color={'green'} onClick={handleSave}>
        {t('buttons.save')}
      </Button>
      <Button variant={'outline'} onClick={handleEditToggle}>
        {t('buttons.cancel')}
      </Button>
    </>
  );

  const getButtonsLayout = () => (
    <>
      <Button onClick={handleEditToggle}>{t('buttons.edit')}</Button>
      <Button color='red' onClick={openSubmitModal}>
        {t('buttons.delete')}
      </Button>
    </>
  );

  return (
    <>
      <Modal
        centered
        opened={submitModalState}
        onClose={closeSubmitModal}
        size='sm'
        title={t('modals.submitDelete.title')}
        withCloseButton={false}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Group mt='lg'>
          <Button variant='filled' onClick={closeSubmitModal}>
            {t('modals.submitDelete.buttons.cancel')}
          </Button>
          <Button
            color='red'
            variant={'outline'}
            onClick={async () => {
              await props.delete();
              closeSubmitModal();
            }}
          >
            {t('modals.submitDelete.buttons.delete')}
          </Button>
        </Group>
      </Modal>

      {isEditing ? getEditorLayout() : getLayout()}

      <Group mt='lg'>{isEditing ? getEditorButtonsLayout() : getButtonsLayout()}</Group>
    </>
  );
};
