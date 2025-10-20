import { useState } from 'react';
import { Button, Card, LoadingOverlay, Stack, Title, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@mantine/hooks';
import { encrypt, LOCAL_STORAGE } from '../shared';
import { selectAuth, selectEnvVars, useAppSelector, useAuth } from '../stores';
import { client } from '@passwordless-id/webauthn';
import { getChallenge } from '../api';

export const PRFEditor = (): JSX.Element => {
  const { t } = useTranslation('settings');
  const { envs } = useAppSelector(selectEnvVars);
  const { secretPassword, authUsername, authEmail } = useAppSelector(selectAuth);
  const { hasPassKey, setHasPassKey } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [isLoading, setIsLoading] = useState(false);

  const addPassKey = async () => {
    setIsLoading(true);
    const response = await getChallenge(envs, t);
    if (!response) {
      setIsLoading(false);
      return;
    }

    const challenge = (await response.json()).challenge as string;
    setIsLoading(false);

    try {
      const registration = await client.register({
        challenge,
        user: authUsername ?? authEmail,
        userVerification: 'required',
        domain: window.location.hostname,
      });

      const authenticatorData = registration.rawId;
      localStorage.setItem(LOCAL_STORAGE.PASSKEY, await encrypt(secretPassword, authenticatorData));
      setHasPassKey(true);
    } catch (error) {
      console.error('WebAuthn error: ', error);
      if (isMobile) {
        alert(`WebAuthn error: ${error}`);
      }
    }
  };

  const removePassKey = async () => {
    localStorage.removeItem(LOCAL_STORAGE.PASSKEY);
    setHasPassKey(false);
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
      <Stack gap="lg" style={{ flex: 1, justifyContent: 'space-between' }}>
        <LoadingOverlay
          visible={isLoading}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />

        <div>
          <Title order={isMobile ? 4 : 2} style={{ textAlign: 'center' }} c="gray.0" mb="md">
            {t('main.prf.title')}
          </Title>

          {!secretPassword && (
            <Text size="sm" style={{ textAlign: 'center' }} c="dimmed" mt="lg">
              {t('main.prf.decryptOnce')}
            </Text>
          )}
        </div>

        {!!secretPassword && (
          <Button
            fullWidth
            radius="md"
            size="md"
            color={hasPassKey ? 'red' : 'blue'}
            variant={hasPassKey ? 'light' : 'filled'}
            onClick={hasPassKey ? removePassKey : addPassKey}
          >
            {hasPassKey ? t('main.prf.delete') : t('main.prf.add')}
          </Button>
        )}
      </Stack>
    </Card>
  );
};