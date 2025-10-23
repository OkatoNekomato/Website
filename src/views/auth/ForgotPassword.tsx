'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Anchor,
  Center,
  Transition,
  Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { selectEnvVars, useAppSelector } from '../../stores';
import { sendPasswordRecoveryCode } from '../../api/gmail';
import {
  sendErrorNotification,
  sendSuccessNotification,
  FORGOT_PASSWORD_COOLDOWN,
  ROUTER_PATH,
} from '../../shared';
import Logo from '../../components/Logo';
import { resetPassword } from '../../api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const { envs } = useAppSelector(selectEnvVars);

  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [cooldown, setCooldown] = useState(0);
  const [sentTo, setSentTo] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const requestForm = useForm({
    initialValues: { email: '' },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : t('forgot.fields.email.invalid')),
    },
  });

  const codeForm = useForm({
    initialValues: { code: '' },
    validate: {
      code: (v) => (v.trim().length < 4 ? t('forgot.fields.code.tooShort') : null),
    },
  });

  const resetForm = useForm({
    initialValues: { password: '', confirm: '' },
    validate: {
      password: (v) => (v.length < 8 ? t('forgot.fields.password.tooShort') : null),
      confirm: (v, values) => (v !== values.password ? t('forgot.fields.password.mismatch') : null),
    },
  });

  useEffect(() => {
    const saved = localStorage.getItem('forgot_cooldown');
    if (saved) {
      const diff = Math.max(0, FORGOT_PASSWORD_COOLDOWN - (Date.now() - +saved) / 1000);
      if (diff > 0) setCooldown(Math.ceil(diff));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendCode = async (values: typeof requestForm.values) => {
    setLoading(true);
    try {
      const res = await sendPasswordRecoveryCode(values.email, t, envs);
      if (!res) return;

      if (res.ok) {
        sendSuccessNotification(t('notifications.codeSent'));
        setSentTo(values.email);
        setStep('verify');
        setCooldown(FORGOT_PASSWORD_COOLDOWN);
        localStorage.setItem('forgot_cooldown', Date.now().toString());
      } else {
        sendErrorNotification(t('forgot.notifications.codeError'));
      }
    } catch {
      sendErrorNotification(t('notifications:serverUnavailable'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (values: typeof codeForm.values) => {
    const enteredCode = values.code.trim();

    setLoading(true);
    try {
      const res = await resetPassword(enteredCode, '', t, envs);

      if (res && res.status === 400) {
        sendErrorNotification(t('forgot.notifications.invalidCode'));
        return;
      }

      setCode(enteredCode);
      setStep('reset');
      sendSuccessNotification(t('forgot.notifications.codeVerified'));
    } catch {
      sendErrorNotification(t('notifications:serverUnavailable'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values: typeof resetForm.values) => {
    setLoading(true);
    try {
      const res = await resetPassword(code, values.password, t, envs);
      if (!res) return;

      if (res.ok) {
        sendSuccessNotification(t('forgot.notifications.passwordChanged'));
        localStorage.removeItem('forgot_cooldown');
        navigate(ROUTER_PATH.SIGN_IN, { replace: true });
      } else if (res.status === 400) {
        sendErrorNotification(t('forgot.notifications.invalidCode'));
      } else {
        sendErrorNotification(t('forgot.notifications.resetError'));
      }
    } catch {
      sendErrorNotification(t('notifications:serverUnavailable'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ref = step === 'request' ? emailRef : step === 'verify' ? codeRef : passwordRef;
    const tmr = setTimeout(() => ref.current?.focus(), 250);
    return () => clearTimeout(tmr);
  }, [step]);

  return (
    <Center>
      <Paper
        w={420}
        mt={100}
        p='2rem'
        radius='lg'
        shadow='xl'
        style={{
          background: 'linear-gradient(180deg, #141417 0%, #18181b 100%)',
          border: '1px solid #2c2f33',
          color: '#e5e5e5',
          overflow: 'hidden',
        }}
      >
        <Stack align='center' mb='xl'>
          <Logo size={90} mb='md' />
          <Title order={2} ta='center' style={{ color: '#f1f1f1', fontWeight: 700 }}>
            {t(`forgot.titles.${step}`)}
          </Title>
          <Text ta='center' size='sm' c='gray.5'>
            {t(`forgot.descriptions.${step}`, { email: sentTo })}
          </Text>
        </Stack>

        <Transition mounted={mounted} transition='fade' duration={250}>
          {(styles) => (
            <div style={styles}>
              {step === 'request' && (
                <form onSubmit={requestForm.onSubmit(handleSendCode)}>
                  <Stack>
                    <TextInput
                      ref={emailRef}
                      label={t('forgot.fields.email.label')}
                      placeholder='you@mail.com'
                      variant='filled'
                      radius='sm'
                      withAsterisk
                      {...requestForm.getInputProps('email')}
                      styles={{
                        input: {
                          backgroundColor: '#1e1f23',
                          borderColor: '#2c2f33',
                          '&:focus': { borderColor: '#3b82f6' },
                        },
                        label: { color: '#cfcfcf' },
                      }}
                    />
                    <Button
                      type='submit'
                      fullWidth
                      mt='sm'
                      radius='sm'
                      loading={loading}
                      disabled={cooldown > 0}
                      styles={{
                        root: {
                          backgroundColor: '#3b82f6',
                          '&:hover': { backgroundColor: '#2563eb' },
                          '&[data-disabled]': {
                            backgroundColor: '#1e40af',
                            opacity: 0.6,
                          },
                        },
                      }}
                    >
                      {cooldown > 0
                        ? t('forgot.buttons.resend', { seconds: cooldown })
                        : t('forgot.buttons.send')}
                    </Button>
                  </Stack>
                </form>
              )}

              {step === 'verify' && (
                <form onSubmit={codeForm.onSubmit(handleVerifyCode)}>
                  <Stack>
                    <TextInput
                      ref={codeRef}
                      label={t('forgot.fields.code.label')}
                      placeholder={t('forgot.fields.code.placeholder')}
                      variant='filled'
                      radius='sm'
                      withAsterisk
                      {...codeForm.getInputProps('code')}
                      styles={{
                        input: {
                          backgroundColor: '#1e1f23',
                          borderColor: '#2c2f33',
                          '&:focus': { borderColor: '#3b82f6' },
                        },
                        label: { color: '#cfcfcf' },
                      }}
                    />
                    <Button
                      type='submit'
                      fullWidth
                      mt='sm'
                      radius='sm'
                      loading={loading}
                      disabled={!codeForm.isValid()}
                      styles={{
                        root: {
                          backgroundColor: '#3b82f6',
                          '&:hover': { backgroundColor: '#2563eb' },
                        },
                      }}
                    >
                      {t('forgot.buttons.verify')}
                    </Button>
                  </Stack>
                </form>
              )}

              {step === 'reset' && (
                <form onSubmit={resetForm.onSubmit(handleResetPassword)}>
                  <Stack>
                    <PasswordInput
                      ref={passwordRef}
                      label={t('forgot.fields.password.label')}
                      placeholder='••••••••'
                      variant='filled'
                      radius='sm'
                      withAsterisk
                      {...resetForm.getInputProps('password')}
                      styles={{
                        input: {
                          backgroundColor: '#1e1f23',
                          borderColor: '#2c2f33',
                          '&:focus': { borderColor: '#3b82f6' },
                        },
                        label: { color: '#cfcfcf' },
                      }}
                    />
                    <PasswordInput
                      label={t('forgot.fields.confirm.label')}
                      placeholder='••••••••'
                      variant='filled'
                      radius='sm'
                      withAsterisk
                      {...resetForm.getInputProps('confirm')}
                      styles={{
                        input: {
                          backgroundColor: '#1e1f23',
                          borderColor: '#2c2f33',
                          '&:focus': { borderColor: '#3b82f6' },
                        },
                        label: { color: '#cfcfcf' },
                      }}
                    />
                    <Button
                      type='submit'
                      fullWidth
                      mt='sm'
                      radius='sm'
                      loading={loading}
                      disabled={!resetForm.isValid()}
                      styles={{
                        root: {
                          backgroundColor: '#3b82f6',
                          '&:hover': { backgroundColor: '#2563eb' },
                        },
                      }}
                    >
                      {t('forgot.buttons.save')}
                    </Button>
                  </Stack>
                </form>
              )}
            </div>
          )}
        </Transition>

        <Divider my='xl' color='rgba(255,255,255,0.1)' />

        <Text ta='center' size='sm' c='gray.5'>
          {t('forgot.backToSignIn')}{' '}
          <Anchor
            size='sm'
            c='blue.4'
            onClick={() => navigate(ROUTER_PATH.SIGN_IN, { replace: true })}
            style={{
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'color 0.15s ease',
            }}
          >
            {t('forgot.signInLink')}
          </Anchor>
        </Text>
      </Paper>
    </Center>
  );
}
