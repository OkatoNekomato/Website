import { Badge, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { EMfaModalState, selectAuth, useAppSelector, useMfa } from '../../../../stores';
import { useMediaQuery } from '@mantine/hooks';

export const MfaManager = (): JSX.Element => {
  const { t } = useTranslation('auth');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isMfaEnabled } = useAppSelector(selectAuth);
  const { handleSetupMfa, handleDisableMfa, openMfaModalWithState } = useMfa();

  return (
    <Card shadow='xl' padding='lg' radius='md' style={{ width: isMobile ? '80vw' : '460px' }}>
      <Stack gap={'xs'}>
        <Title order={isMobile ? 4 : 2} style={{ textAlign: 'center' }}>
          {t('mfa.managerTitle')}
        </Title>

        <Group style={{ textAlign: isMobile ? 'center' : 'left' }}>
          <Text size='lg' w={500}>
            {t('mfa.statusTitle')}:{' '}
            <Badge color={isMfaEnabled ? 'green' : 'red'}>
              <Text size='sm'>{isMfaEnabled ? t('mfa.enabled') : t('mfa.disabled')}</Text>
            </Badge>
          </Text>
        </Group>

        {!isMfaEnabled ? (
          <Button
            fullWidth
            onClick={async () => {
              await handleSetupMfa();
            }}
          >
            {t('mfa.enableMfaButton')}
          </Button>
        ) : (
          <>
            <Button
              fullWidth
              color='red'
              onClick={() => {
                openMfaModalWithState(EMfaModalState.DISABLE, async (totpCode) => {
                  if (totpCode) {
                    await handleDisableMfa(totpCode);
                  }
                });
              }}
            >
              {t('mfa.disableMfaButton')}
            </Button>
          </>
        )}
      </Stack>
    </Card>
  );
};
