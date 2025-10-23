import { useState } from 'react';
import { Button, Card, Group, LoadingOverlay, Stack, Text, Title } from '@mantine/core';
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
    if (!secretPassword) return;
    setIsLoading(true);

    try {
      const response = await getChallenge(envs, t);
      if (!response?.ok) throw new Error('Failed to get challenge');
      const { challenge } = await response.json();

      const registration = await client.register({
        challenge,
        user: authUsername || authEmail || 'user',
        userVerification: 'required',
        domain: window.location.hostname,
      });

      const encrypted = await encrypt(secretPassword, registration.rawId);
      localStorage.setItem(LOCAL_STORAGE.PASSKEY, encrypted);
      setHasPassKey(true);
    } catch (error) {
      console.error('WebAuthn registration failed:', error);
      alert(`Error: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const removePassKey = () => {
    localStorage.removeItem(LOCAL_STORAGE.PASSKEY);
    setHasPassKey(false);
  };

  return (
    <Card
      withBorder
      radius='md'
      p='xl'
      style={{
        backgroundColor: '#141416',
        border: '1px solid #2c2c2f',
        boxShadow: '0 0 20px rgba(0, 102, 255, 0.08)',
        width: isMobile ? '90vw' : 460,
        margin: '0 auto',
      }}
    >
      <Stack gap='md' align='stretch'>
        <LoadingOverlay
          visible={isLoading}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />

        <Title
          order={isMobile ? 4 : 3}
          ta='center'
          style={{
            color: '#f2f2f2',
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          {t('main.prf.title')}
        </Title>

        {!secretPassword ? (
          <Text ta='center' c='gray.5' size='sm' style={{ opacity: 0.8 }}>
            {t('main.prf.decryptOnce')}
          </Text>
        ) : (
          <Group grow mt='sm'>
            {!hasPassKey ? (
              <Button fullWidth color='blue' radius='sm' onClick={addPassKey}>
                {t('main.prf.add')}
              </Button>
            ) : (
              <Button fullWidth color='red' radius='sm' onClick={removePassKey}>
                {t('main.prf.delete')}
              </Button>
            )}
          </Group>
        )}
      </Stack>
    </Card>
  );
};
