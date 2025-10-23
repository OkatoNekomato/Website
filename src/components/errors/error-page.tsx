import { Box, Button, Center, Container, Image, Paper, Stack, Text, Title } from '@mantine/core';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ROUTER_PATH } from '../../shared';

interface ErrorPageProps {
  error?: string;
}

export const ErrorPage: FC<ErrorPageProps> = ({ error }) => {
  const { t } = useTranslation('errorBoundary');
  const navigate = useNavigate();

  return (
    <Container size='sm' px='md'>
      <Center style={{ height: '100vh' }}>
        <Paper
          radius='md'
          p='xl'
          withBorder
          style={{
            background: 'rgba(20,20,24,0.8)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            textAlign: 'center',
            width: '100%',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}
        >
          <Stack align='center' gap='md'>
            <Image src='/error.png' w={180} alt='error-smile' />
            <Title order={2} c='gray.0'>
              {t('title')}
            </Title>

            <Text c='dimmed' size='lg'>
              {t(error ? 'message.boundary' : 'message.router')}
            </Text>

            {error && (
              <Box
                mt='sm'
                p='sm'
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 8,
                  maxWidth: 360,
                  wordBreak: 'break-word',
                }}
              >
                <Text c='red.4' size='sm'>
                  {t('error', { error })}
                </Text>
              </Box>
            )}

            <Button mt='lg' color='blue' variant='light' onClick={() => navigate(ROUTER_PATH.ROOT)}>
              {t('backHome')}
            </Button>
          </Stack>
        </Paper>
      </Center>
    </Container>
  );
};
