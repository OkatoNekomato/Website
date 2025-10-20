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
        <div>
          <Title order={isMobile ? 4 : 2} style={{ textAlign: 'center' }} c="gray.0" mb="md">
            {t('mfa.managerTitle')}
          </Title>

          <Group justify="center" mt="lg">
            <Text size="md" c="gray.3" fw={500}>
              {t('mfa.statusTitle')}:{' '}
            </Text>
            <Badge
              color={isMfaEnabled ? 'green' : 'red'}
              variant="light"
              size="lg"
              radius="md"
              style={{
                textTransform: 'none',
                fontSize: '14px',
                padding: '8px 16px',
              }}
            >
              {isMfaEnabled ? t('mfa.enabled') : t('mfa.disabled')}
            </Badge>
          </Group>
        </div>

        <Button
          fullWidth
          radius="md"
          size="md"
          color={isMfaEnabled ? 'red' : 'blue'}
          variant={isMfaEnabled ? 'light' : 'filled'}
          onClick={async () => {
            if (isMfaEnabled) {
              openMfaModalWithState(EMfaModalState.DISABLE, async (totpCode) => {
                if (totpCode) {
                  await handleDisableMfa(totpCode);
                }
              });
            } else {
              await handleSetupMfa();
            }
          }}
        >
          {isMfaEnabled ? t('mfa.disableMfaButton') : t('mfa.enableMfaButton')}
        </Button>
      </Stack>
    </Card>
  );
};