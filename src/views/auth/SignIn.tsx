﻿import { useState } from 'react';
import {
  Anchor,
  Button,
  Container,
  Group,
  Image,
  LoadingOverlay,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import {
  LOCAL_STORAGE,
  ROUTER_PATH,
  sendErrorNotification,
  sendSuccessNotification,
} from '../../shared';
import { useTranslation } from 'react-i18next';
import {
  selectEnvVars,
  selectMfa,
  setMfaEnabled,
  setTotpCode,
  useAppDispatch,
  useAppSelector,
  useAuth,
} from '../../stores';
import { signIn } from '../../api';
import { PasswordInputWithCapsLock } from '../../components';
import { EAuthState } from '../../types';

export default function SignIn() {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { envs } = useAppSelector(selectEnvVars);
  const { authSignIn } = useAuth();
  const mfa = useAppSelector(selectMfa);
  const dispatch = useAppDispatch();

  const [loaderVisible, setLoaderState] = useDisclosure(false);
  const [mfaRequired, setMfaRequired] = useState<boolean>(false);

  const initEmail = localStorage.getItem(LOCAL_STORAGE.LAST_EMAIL);
  const isApproveMode = !!initEmail;
  const form = useForm({
    initialValues: {
      email: initEmail ?? '',
      password: '',
    },
    validate: {
      email: (val) => (val ? null : t('signIn.fields.emailOrUsername.canNotBeEmpty')),
      password: (val) => (val ? null : t('signIn.fields.password.canNotBeEmpty')),
    },
  });

  const signInUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.validate().hasErrors) {
      return;
    }

    if (mfaRequired && (!mfa.totpCode || mfa.totpCode.length === 0 || mfa.totpCode.length !== 6)) {
      sendErrorNotification(t('notifications:incorrectMfaCode'));
      return;
    }

    setLoaderState.open();
    const { email, password } = form.values;

    const response = await signIn(email, password, mfa.totpCode, envs, t);
    if (!response) {
      setLoaderState.close();
      return;
    }

    if (response === EAuthState.MfaRequired) {
      setMfaRequired(true);
      dispatch(setMfaEnabled(true));
      setLoaderState.close();
      return;
    } else if (mfa.totpCode) {
      dispatch(setTotpCode(null));
    }

    const jsonResponse = await (response as Response).json();
    localStorage.setItem(LOCAL_STORAGE.LAST_EMAIL, email);

    const localization: string = jsonResponse.localization;
    const is12Hours: boolean = jsonResponse.is12Hours;
    const inactiveMinutes: number = jsonResponse.inactiveMinutes;
    const username: string = jsonResponse.username;

    sendSuccessNotification(t('notifications:successful'));
    authSignIn(email, username, localization, is12Hours, inactiveMinutes);
    navigate(ROUTER_PATH.MENU);
    setMfaRequired(false);
  };

  const resetEmail = () => {
    localStorage.removeItem(LOCAL_STORAGE.LAST_EMAIL);
    form.setFieldValue('email', '');
  };

  return (
    <Container size={isMobile ? 'xs' : 'sm'} mt={isMobile ? '2rem' : '4rem'}>
      <LoadingOverlay
        visible={loaderVisible}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'blue' }}
      />
      <Image
        src={'/logo.svg'}
        style={{
          maxWidth: isMobile ? '80%' : 'fit-content',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginBottom: isMobile ? '1.5rem' : '3rem',
        }}
        h={isMobile ? 100 : 140}
        w='auto'
        fit='contain'
        alt={'Immortal Vault'}
        onClick={() => navigate(ROUTER_PATH.ROOT)}
      />
      <Title order={1} ta='center' size={isMobile ? 'h3' : 'h1'}>
        {t('signIn.title')}
      </Title>
      <Title order={2} ta='center' mb={'xl'} size={isMobile ? 'h4' : 'h2'}>
        {isApproveMode ? t('signIn.exists', { user: form.values.email }) : t('signIn.desc')}
      </Title>

      <form onSubmit={signInUser}>
        <Stack align={'center'} justify={'center'}>
          {!isApproveMode && (
            <TextInput
              required
              type={'text'}
              label={t('signIn.fields.emailOrUsername.title')}
              placeholder={'johndoe@gmail.com'}
              value={form.values.email}
              onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
              error={form.errors.email && t(form.errors.email.toString())}
              radius='md'
              w={'90%'}
            />
          )}

          <PasswordInputWithCapsLock
            required
            label={t('signIn.fields.password.title')}
            value={form.values.password}
            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
            error={form.errors.password && t(form.errors.password.toString())}
            radius='md'
            style={{ flex: 1 }}
            w={'90%'}
          />

          {mfaRequired && (
            <TextInput
              required
              placeholder={t('auth:mfa.totpPlaceholder')}
              label={t('auth:mfa.totpLabel')}
              value={mfa.totpCode ?? ''}
              radius='md'
              style={{ flex: 1 }}
              w={'90%'}
              onChange={(event) => {
                if (event.currentTarget.value.length > 6) {
                  return;
                }

                dispatch(setTotpCode(event.currentTarget.value));
              }}
            />
          )}

          <Group justify='space-between' w={'90%'}>
            <Anchor
              component='button'
              type='button'
              c='dimmed'
              underline={'never'}
              size={isMobile ? 'lg' : 'xl'}
              onClick={isApproveMode ? resetEmail : () => navigate(ROUTER_PATH.SIGN_UP)}
            >
              {isApproveMode ? t('signIn.anotherAccount') : t('signIn.doNotHaveAccount')}
              &nbsp;
              <Anchor
                component='button'
                type='button'
                underline={'never'}
                c='blue'
                size={isMobile ? 'lg' : 'xl'}
              >
                {isApproveMode ? t('signOut.title') : t('signUp.title')}
              </Anchor>
            </Anchor>
            <Button type='submit'>{t('signIn.title')}</Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
}
