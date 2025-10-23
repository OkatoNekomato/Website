import { useTranslation } from 'react-i18next';
import {
  Box,
  Center,
  Title,
  Stack,
  Paper,
  SimpleGrid,
  Divider,
  ScrollArea,
  Space,
} from '@mantine/core';
import {
  Footer,
  LanguageSelector,
  PasswordEditor,
  PrimaryHeader,
  TimeFormatSelector,
  PRFEditor,
} from '../../../../components';
import { MfaManager } from './MfaManager';
import { InactiveMinutesEditor } from './InactiveMinutesEditor';
import { EmailVerificationBanner } from './EmailVerificationBanner';

export const Settings = (): JSX.Element => {
  const { t } = useTranslation('settings');

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#0d0d10',
        color: '#f2f2f2',
      }}
    >
      <PrimaryHeader />

      <ScrollArea
        style={{
          flex: '1 0 auto',
          padding: '4rem 1.5rem',
          scrollBehavior: 'smooth',
        }}
      >
        <Center>
          <Box style={{ width: '100%', maxWidth: 1200 }}>
            <Title
              order={2}
              ta='center'
              mb='3rem'
              style={{
                color: '#e7e7ea',
                fontWeight: 700,
                letterSpacing: '0.02em',
                fontSize: '2rem',
              }}
            >
              {t('main.header')}
            </Title>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing='3rem' verticalSpacing='3rem'>
              <Paper
                p='xl'
                radius='md'
                style={{
                  backgroundColor: '#18181b',
                  border: '1px solid #2c2c2f',
                  boxShadow: '0 0 25px rgba(59,130,246,0.06)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <Stack gap='lg'>
                  <Title
                    order={4}
                    style={{
                      color: '#f0f0f0',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {t('main.securitySection')}
                  </Title>

                  <MfaManager />
                  <EmailVerificationBanner />

                  <Divider
                    color='rgba(255,255,255,0.1)'
                    label={t('main.session')}
                    labelPosition='center'
                    mt='xs'
                  />

                  <InactiveMinutesEditor />
                </Stack>
              </Paper>

              <Paper
                p='xl'
                radius='md'
                style={{
                  backgroundColor: '#18181b',
                  border: '1px solid #2a2a2e',
                  boxShadow: '0 0 25px rgba(59,130,246,0.05)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <Stack gap='lg'>
                  <Title
                    order={4}
                    style={{
                      color: '#f0f0f0',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {t('main.personalization')}
                  </Title>

                  <PasswordEditor />
                  <PRFEditor />

                  <Center mt='sm'>
                    <LanguageSelector settings />
                  </Center>

                  <Divider
                    color='rgba(255,255,255,0.1)'
                    label={t('main.display')}
                    labelPosition='center'
                    mt='sm'
                  />

                  <Center mt='sm'>
                    <TimeFormatSelector />
                  </Center>
                </Stack>
              </Paper>
            </SimpleGrid>

            <Space h='4rem' />
          </Box>
        </Center>
      </ScrollArea>

      <Footer />
    </Box>
  );
};
