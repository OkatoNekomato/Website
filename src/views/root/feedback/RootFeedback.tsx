import {
  Button,
  Container,
  Group,
  Loader,
  SimpleGrid,
  Textarea,
  TextInput,
  Title,
  Paper,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { customFetch } from '../../../api';
import { useTranslation } from 'react-i18next';
import validator from 'validator';
import { sendErrorNotification, sendSuccessNotification } from '../../../shared';
import { useState } from 'react';
import { selectEnvVars, useAppSelector } from '../../../stores';

export function RootFeedback() {
  const { t } = useTranslation('root');
  const { envs } = useAppSelector(selectEnvVars);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? t('feedback.validation.name') : null),
      email: (value) => (!validator.isEmail(value) ? t('feedback.validation.email') : null),
      subject: (value) => (value.trim() === '' ? t('feedback.validation.subject') : null),
      message: (value) => (value.trim() === '' ? t('feedback.validation.message') : null),
    },
  });

  const handleSubmit = async () => {
    setLoading(true);
    const { email, name, subject, message } = form.values;

    const response = await customFetch(
      `${envs?.API_SERVER_URL}/email/send`,
      JSON.stringify({ from: email, name, subject, message }),
      'POST',
      t,
    );

    if (!response || !response.ok) {
      sendErrorNotification(t('feedback.send.error'));
      console.error(response?.statusText);
      setLoading(false);
      return;
    }

    sendSuccessNotification(t('feedback.send.successfully'));
    form.reset();
    setLoading(false);
  };

  const inputStyles = {
    input: {
      backgroundColor: '#1a1a1f',
      color: '#fff',
      border: '1px solid #333',
    },
    label: {
      color: '#fff',
      fontWeight: 500,
    },
    placeholder: {
      color: '#aaa',
    },
  };

  return (
    <Container size='sm' py='xl'>
      <Paper
        shadow='lg'
        radius='md'
        p='xl'
        style={{
          background: 'rgba(15,15,18,0.85)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Title order={2} ta='center' mb='lg' style={{ color: '#fff' }}>
            {t('feedback.title')}
          </Title>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing='md'>
            <TextInput
              label={t('feedback.fields.name.label')}
              placeholder={t('feedback.fields.name.placeholder')}
              variant='filled'
              styles={inputStyles}
              {...form.getInputProps('name')}
            />
            <TextInput
              label={t('feedback.fields.email.label')}
              placeholder={t('feedback.fields.email.placeholder')}
              type='email'
              variant='filled'
              styles={inputStyles}
              {...form.getInputProps('email')}
            />
          </SimpleGrid>

          <TextInput
            mt='md'
            label={t('feedback.fields.subject.label')}
            placeholder={t('feedback.fields.subject.placeholder')}
            variant='filled'
            styles={inputStyles}
            {...form.getInputProps('subject')}
          />
          <Textarea
            mt='md'
            label={t('feedback.fields.message.label')}
            placeholder={t('feedback.fields.message.placeholder')}
            autosize
            minRows={5}
            maxRows={10}
            variant='filled'
            styles={inputStyles}
            {...form.getInputProps('message')}
          />

          <Group justify='center' mt='xl'>
            <Button
              type='submit'
              size='md'
              radius='md'
              disabled={loading}
              styles={{
                root: {
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  '&:hover': { backgroundColor: '#2563eb' },
                },
              }}
            >
              {t('feedback.send.button')}
              {loading && <Loader size={20} color='white' ml='sm' />}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}
