import { useState } from 'react';
import { Button, Card, Group, LoadingOverlay, Stack, Title } from '@mantine/core';
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
    <Card shadow='xl' padding='lg' radius='md' style={{ width: isMobile ? '80vw' : '460px' }}>
      <Stack gap='xs'>
        <LoadingOverlay
          visible={isLoading}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />

        <Title order={isMobile ? 4 : 2} style={{ textAlign: 'center' }}>
          {t('main.prf.title')}
        </Title>

        <Group justify='space-between'>
          {!secretPassword && <Title order={isMobile ? 6 : 4}>{t('main.prf.decryptOnce')}</Title>}
          {!!secretPassword &&
            (!hasPassKey ? (
              <Button fullWidth onClick={addPassKey}>
                {t('main.prf.add')}
              </Button>
            ) : (
              <Button fullWidth color='red' onClick={removePassKey}>
                {t('main.prf.delete')}
              </Button>
            ))}
        </Group>
      </Stack>
    </Card>
  );
};
