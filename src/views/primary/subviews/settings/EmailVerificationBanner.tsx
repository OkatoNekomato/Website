import { useTranslation } from 'react-i18next';
import { Paper, Text, Group, Button, TextInput, Transition, Stack, ThemeIcon } from '@mantine/core';
import { useState } from 'react';
import { sendEmailVerificationCode, sendEmailVerification } from '../../../../api/gmail';
import { IconMail, IconMailCheck, IconAlertCircle } from '@tabler/icons-react';
import { useAppSelector, selectAuth, selectEnvVars } from '../../../../stores';

export function EmailVerificationBanner() {
  const { t } = useTranslation('auth');
  const { envs } = useAppSelector(selectEnvVars);
  const { isEmailVerified, authEmail } = useAppSelector(selectAuth);

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');

  const handleSendCode = async () => {
    setLoading(true);
    try {
      const res = await sendEmailVerificationCode(authEmail, envs, t);
      if (res?.ok) setSent(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) return;
    setLoading(true);
    try {
      const res = await sendEmailVerification(code, envs, t);
      if (res?.ok) {
        setSent(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition mounted transition='fade' duration={300} timingFunction='ease'>
      {(styles) => (
        <Paper
          style={{
            ...styles,
            backgroundColor: '#141418',
            border: isEmailVerified
              ? '1px solid rgba(0,122,255,0.25)'
              : '1px solid rgba(0,122,255,0.35)',
            padding: '1.25rem',
            borderRadius: '0.75rem',
            boxShadow: '0 0 20px rgba(0,122,255,0.08)',
            color: '#f2f3f5',
          }}
        >
          <Group align='center' gap='sm' mb='sm'>
            <ThemeIcon
              size={36}
              radius='xl'
              variant='light'
              color='blue'
              style={{
                backgroundColor: 'rgba(0,122,255,0.15)',
              }}
            >
              {isEmailVerified ? <IconMailCheck size={18} /> : <IconAlertCircle size={18} />}
            </ThemeIcon>

            <Stack gap={0}>
              <Text fw={600} size='sm'>
                {isEmailVerified ? t('verify.doneTitle') : t('verify.title')}
              </Text>
              <Text size='xs' c='dimmed'>
                {isEmailVerified
                  ? t('verify.doneDesc')
                  : sent
                    ? t('verify.enterCode')
                    : t('verify.notice')}
              </Text>
            </Stack>
          </Group>

          {!isEmailVerified && (
            <Stack gap='sm' mt='xs'>
              {!sent ? (
                <Button
                  fullWidth
                  onClick={handleSendCode}
                  loading={loading}
                  color='blue'
                  leftSection={<IconMail size={16} />}
                >
                  {t('verify.resend')}
                </Button>
              ) : (
                <>
                  <TextInput
                    placeholder={t('verify.codePlaceholder')}
                    value={code}
                    onChange={(e) => setCode(e.currentTarget.value)}
                    size='sm'
                    styles={{
                      input: {
                        textAlign: 'center',
                        letterSpacing: '0.25em',
                        backgroundColor: '#0f0f12',
                        borderColor: '#2a2a2e',
                        color: '#fff',
                      },
                    }}
                  />
                  <Group grow>
                    <Button
                      onClick={handleVerifyCode}
                      loading={loading}
                      color='blue'
                      disabled={!code}
                    >
                      {t('verify.verify')}
                    </Button>
                    <Button
                      variant='light'
                      color='gray'
                      onClick={() => {
                        setSent(false);
                        setCode('');
                      }}
                    >
                      {t('verify.cancel') || 'Отмена'}
                    </Button>
                  </Group>
                </>
              )}
            </Stack>
          )}
        </Paper>
      )}
    </Transition>
  );
}
