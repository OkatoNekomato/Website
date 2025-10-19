﻿import {
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
import validator from 'validator';
import passwordValidator from 'password-validator';
import { useNavigate } from 'react-router-dom';
import {
  getTimeFormatByLocalization,
  ROUTER_PATH,
  sendErrorNotification,
  sendSuccessNotification,
} from '../../shared';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { signUp } from '../../api';
import { selectEnvVars, useAppSelector } from '../../stores';
import { FormEvent } from 'react';
import { PasswordInputWithCapsLock } from '../../components';

export default function SignUp() {
  const { t, i18n } = useTranslation('auth');
  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },

    validate: {
      name: (val) => (val.length < 4 ? 'signUp.fields.name.tooLittle' : null),
      email: (val) => (validator.isEmail(val) ? null : 'signUp.fields.email.invalid'),
      password: (val) => {
        const schema = new passwordValidator();
        schema
          .is()
          .min(8) // Minimum length 8
          .is()
          .max(100) // Maximum length 100
          .has()
          .uppercase() // Must have uppercase letters
          .has()
          .lowercase() // Must have lowercase letters
          .has()
          .digits(2) // Must have at least 2 digits
          .has()
          .not()
          .spaces(); // Should not have spaces

        return !schema.validate(val) ? 'signUp.fields.password.invalid' : null;
      },
      confirmPassword: (val) => {
        if (val == form.values.password) {
          return null;
        }

        return 'signUp.fields.confirmPassword.invalid';
      },
    },
  });
  const [loaderVisible, setLoaderState] = useDisclosure(false);
  const { envs } = useAppSelector(selectEnvVars);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const signUpUser = async (e: FormEvent) => {
    e.preventDefault();
    if (form.validate().hasErrors) {
      return;
    }

    setLoaderState.open();
    const formValues = form.values;
    const username = formValues.name;
    const email = formValues.email;
    const password = formValues.password;
    const confirmPassword = formValues.confirmPassword;

    if (password !== confirmPassword) {
      sendErrorNotification(t('notifications:passwordsDoNotMatch'));
      setLoaderState.close();
      return;
    }

    const response = await signUp(
      username,
      email,
      password,
      i18n.language,
      getTimeFormatByLocalization(i18n.language) ?? false,
      envs,
      t,
    );

    if (!response || !response.ok) {
      setLoaderState.close();
      return;
    }

    sendSuccessNotification(t('notifications:successful'));
    navigate(ROUTER_PATH.SIGN_IN);
  };

  return (
    <Container size={isMobile ? 'xs' : 'sm'} mt={isMobile ? '2rem' : '3.5rem'}>
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
          marginBottom: isMobile ? '2rem' : '3rem',
        }}
        h={isMobile ? 100 : 140}
        w='auto'
        fit='contain'
        alt={'Immortal Vault'}
        onClick={() => navigate(ROUTER_PATH.ROOT)}
      />
      <Title order={1} ta='center' size={isMobile ? 'h3' : 'h1'}>
        {t('signUp.title')}
      </Title>
      <Title order={2} ta='center' mb={'xl'} size={isMobile ? 'h4' : 'h2'}>
        {t('signUp.desc')}
      </Title>

      <form onSubmit={signUpUser}>
        <Stack align={'center'} justify={'center'}>
          <TextInput
            withAsterisk
            label={t('signUp.fields.name.title')}
            placeholder={'John Doe'}
            value={form.values.name}
            error={form.errors.name && t(form.errors.name.toString())}
            onChange={(e) => form.setFieldValue('name', e.currentTarget.value)}
            radius='md'
            w={'90%'}
          />

          <TextInput
            withAsterisk
            type={'email'}
            label={t('signUp.fields.email.title')}
            placeholder={'JohnDoe@gmail.com'}
            value={form.values.email}
            onChange={(e) => form.setFieldValue('email', e.currentTarget.value)}
            error={form.errors.email && t(form.errors.email.toString())}
            radius='md'
            w={'90%'}
          />

          <PasswordInputWithCapsLock
            withAsterisk
            label={t('signUp.fields.password.title')}
            value={form.values.password}
            onChange={(e) => form.setFieldValue('password', e.currentTarget.value)}
            error={form.errors.password && t(form.errors.password.toString())}
            radius='md'
            w={'90%'}
          />

          <PasswordInputWithCapsLock
            withAsterisk
            label={t('signUp.fields.confirmPassword.title')}
            value={form.values.confirmPassword}
            onChange={(e) => form.setFieldValue('confirmPassword', e.currentTarget.value)}
            error={form.errors.confirmPassword && t(form.errors.confirmPassword.toString())}
            radius='md'
            w={'90%'}
          />

          <Group justify='space-between' w={'90%'}>
            <Anchor
              component='button'
              type='button'
              c='dimmed'
              underline={'never'}
              size={isMobile ? 'lg' : 'xl'}
              onClick={() => navigate(ROUTER_PATH.SIGN_IN)}
            >
              {t('signUp.alreadyHaveAccount')}
              &nbsp;
              <Anchor
                component='button'
                type='button'
                underline={'never'}
                c='blue'
                size={isMobile ? 'lg' : 'xl'}
              >
                {t('signIn.title')}
              </Anchor>
            </Anchor>
            <Button type='submit'>{t('signUp.title')}</Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
}
