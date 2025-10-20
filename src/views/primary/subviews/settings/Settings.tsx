import { useTranslation } from 'react-i18next';
import { Box, Center, Title, Stack, Container, Grid, Card } from '@mantine/core';
import {
  Footer,
  LanguageSelector,
  PasswordEditor,
  PrimaryHeader,
  TimeFormatSelector,
  PRFEditor,
} from '../../../../components';
import { MfaManager } from './MfaManager.tsx';
import { InactiveMinutesEditor } from './InactiveMinutesEditor.tsx';
import { EmailVerificationBanner } from './EmailVerificationBanner.tsx';
import { useAppSelector, selectAuth } from '../../../../stores';
import { useMediaQuery } from '@mantine/hooks';

export const Settings = (): JSX.Element => {
  const { t } = useTranslation('settings');
  const { isEmailVerified } = useAppSelector(selectAuth);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PrimaryHeader />

      <Box style={{ flex: '1 0 auto', padding: isMobile ? '1rem' : '2rem 1rem' }}>
        <Container size='xl'>
          <Center>
            <Box style={{ width: '100%', maxWidth: 1200 }}>
              <Title order={1} ta='center' mb='xl' c='gray.0'>
                {t('main.header')}
              </Title>

              {!isEmailVerified && (
                <Box mb='xl'>
                  <EmailVerificationBanner />
                </Box>
              )}

              <Stack gap='xl'>
                <Grid gutter='xl'>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <MfaManager />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <PRFEditor />
                  </Grid.Col>
                </Grid>

                <Grid gutter='xl'>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <PasswordEditor />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <InactiveMinutesEditor />
                  </Grid.Col>
                </Grid>

                <Grid gutter='xl'>
                  <Grid.Col span={12}>
                    <Center>
                      <Card
                        shadow="xl"
                        padding="xl"
                        radius="lg"
                        withBorder
                        style={{
                          width: isMobile ? '90vw' : '100%',
                          maxWidth: 1200,
                          background: 'rgba(30, 30, 35, 0.6)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(70, 70, 80, 0.3)',
                        }}
                      >
                        <Stack gap="xl">
                          <Title order={isMobile ? 4 : 2} style={{ textAlign: 'center' }} c="gray.0">
                            Preferences
                          </Title>

                          <Grid gutter="xl">
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                              <Stack gap="md" align="center">
                                <Title order={4} c="gray.2" ta="center">
                                  {t('main.language.title')}
                                </Title>
                                <Box style={{ width: '100%', maxWidth: 280 }}>
                                  <LanguageSelector settings={false} />
                                </Box>
                              </Stack>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                              <Stack gap="md" align="center">
                                <TimeFormatSelector />
                              </Stack>
                            </Grid.Col>
                          </Grid>
                        </Stack>
                      </Card>
                    </Center>
                  </Grid.Col>
                </Grid>
              </Stack>
            </Box>
          </Center>
        </Container>
      </Box>

      <Footer />
    </div>
  );
};