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
      withBorder
      radius='md'
      p='xl'
      style={{
        backgroundColor: '#141416',
        border: '1px solid #2c2c2f',
        boxShadow: '0 0 20px rgba(0,122,255,0.08)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <Stack align='stretch' gap='md'>
        <Title
          order={isMobile ? 4 : 3}
          ta='center'
          style={{
            color: '#f2f2f2',
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          {t('mfa.managerTitle')}
        </Title>

        <Group justify='space-between' align='center'>
          <Text size='sm' c='dimmed'>
            {t('mfa.statusTitle')}
          </Text>
          <Badge color={isMfaEnabled ? 'blue' : 'gray'} variant='light' radius='sm'>
            {isMfaEnabled ? t('mfa.enabled') : t('mfa.disabled')}
          </Badge>
        </Group>

        <Text
          size='sm'
          c='gray.5'
          mt={-4}
          style={{
            textAlign: 'center',
            fontWeight: 400,
            opacity: 0.8,
          }}
        >
          {isMfaEnabled ? t('mfa.enabledDescription') : t('mfa.disabledDescription')}
        </Text>

        <Button
          fullWidth
          size='md'
          radius='sm'
          mt='sm'
          variant='filled'
          color='blue'
          onClick={async () => {
            if (isMfaEnabled) {
              openMfaModalWithState(EMfaModalState.DISABLE, async (totpCode) => {
                if (totpCode) await handleDisableMfa(totpCode);
              });
            } else {
              await handleSetupMfa();
            }
          }}
          style={{
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          {isMfaEnabled ? t('mfa.disableMfaButton') : t('mfa.enableMfaButton')}
        </Button>
      </Stack>
    </Card>
  );
};
