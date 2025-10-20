import { FormEvent, useState } from 'react';
import { Button, Card, Group, LoadingOverlay, Stack, TextInput, Title, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@mantine/hooks';
import passwordValidator from 'password-validator';
import { sendErrorNotification } from '../shared';
import { selectAuth, selectEnvVars, useAppSelector, useAuth } from '../stores';
import { changePassword } from '../api';
import { PasswordInputWithCapsLock } from './PasswordInputWithCapsLock.tsx';

export const PasswordEditor = (): JSX.Element => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const auth = useAuth();
  const { envs } = useAppSelector(selectEnvVars);
  const { isMfaEnabled } = useAppSelector(selectAuth);

  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string): string | null => {
    const schema = new passwordValidator();
    schema
      .is()
      .min(8)
      .is()
      .max(100)
      .has()
      .uppercase()
      .has()
      .lowercase()
      .has()
      .digits(2)
      .has()
      .not()
      .spaces();

    return schema.validate(password) ? null : t('settings:main.password.invalid');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPwd !== confirmPwd) {
      sendErrorNotification(t('notifications:passwordsDoNotMatch'));
      setIsLoading(false);
      return;
    }

    const passwordError = validatePassword(newPwd);
    if (passwordError) {
      sendErrorNotification(passwordError);
      setIsLoading(false);
      return;
    }

    if (isMfaEnabled && totpCode.length !== 6) {
      sendErrorNotification(t('notifications:requiredMfa'));
      setIsLoading(false);
      return;
    }

    const response = await changePassword(oldPwd, newPwd, totpCode || null, envs, t, auth).catch(
      () => setIsLoading(false),
    );

    if (!response) {
      setIsLoading(false);
      return;
    }

    if (response.ok) {
      setIsEditing(false);
      resetForm();
    }

    setIsLoading(false);
  };

  const resetForm = () => {
    setOldPwd('');
    setNewPwd('');
    setConfirmPwd('');
    setTotpCode('');
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  return (
    <Card
      shadow="xl"
      padding="xl"
      radius="lg"
      withBorder
      style={{
        height: '100%',
        minHeight: '240px',
        background: 'rgba(30, 30, 35, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(70, 70, 80, 0.3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack gap="lg" style={{ flex: 1, justifyContent: 'space-between' }}>
          <LoadingOverlay
            visible={isLoading}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
          />

          <div>
            <Title order={isMobile ? 4 : 2} style={{ textAlign: 'center' }} c="gray.0" mb="md">
              {t('settings:main.password.title')}
            </Title>

            {!isEditing ? (
              <Text size="sm" style={{ textAlign: 'center' }} c="dimmed" mt="lg">
                {t('settings:main.password.description')}
              </Text>
            ) : (
              <Stack gap="md" mt="md">
                <PasswordInputWithCapsLock
                  label={t('settings:main.password.oldPassword')}
                  value={oldPwd}
                  onChange={(e) => setOldPwd(e.currentTarget.value)}
                  required
                />

                <PasswordInputWithCapsLock
                  label={t('settings:main.password.newPassword')}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.currentTarget.value)}
                  error={newPwd && validatePassword(newPwd)}
                  required
                />

                <PasswordInputWithCapsLock
                  label={t('settings:main.password.confirmPassword')}
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.currentTarget.value)}
                  error={
                    confirmPwd && newPwd !== confirmPwd ? t('settings:main.password.mismatch') : null
                  }
                  required
                />

                {isMfaEnabled && (
                  <TextInput
                    label={t('settings:main.password.totpCode')}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.currentTarget.value)}
                    required
                    error={
                      totpCode && totpCode.length !== 6 ? t('auth:mfa.validateInstruction') : null
                    }
                    placeholder='123456'
                  />
                )}
              </Stack>
            )}
          </div>

          <Group gap="md">
            {!isEditing ? (
              <Button fullWidth radius="md" size="md" onClick={() => setIsEditing(true)}>
                {t('settings:main.password.editButton')}
              </Button>
            ) : (
              <>
                <Button fullWidth type='submit' radius="md" size="md" color='green' variant="light">
                  {t('settings:main.password.saveButton')}
                </Button>
                <Button fullWidth radius="md" size="md" color='red' variant="light" onClick={handleCancel}>
                  {t('settings:main.password.cancelButton')}
                </Button>
              </>
            )}
          </Group>
        </Stack>
      </form>
    </Card>
  );
};