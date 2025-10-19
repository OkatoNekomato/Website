import { useTranslation } from 'react-i18next';
import { Box, Center, SimpleGrid, Title, Stack } from '@mantine/core';
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

export const Settings = (): JSX.Element => {
  const { t } = useTranslation('settings');
  const { isEmailVerified } = useAppSelector(selectAuth);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PrimaryHeader />

      <Box style={{ flex: '1 0 auto', padding: '2rem 1rem' }}>
        <Center>
          <Box style={{ width: '100%', maxWidth: 1200 }}>
            <Title order={1} ta="center" mb="xl">
              {t('main.header')}
            </Title>

            {!isEmailVerified && (
              <Box mb="xl">
                <EmailVerificationBanner />
              </Box>
            )}

            <SimpleGrid
              cols={{ base: 1, md: 2 }}
              spacing={{ base: 'md', md: 'lg' }}
            >
              <Stack gap="lg">
                <MfaManager />
              </Stack>

              <Stack gap="lg">
                <InactiveMinutesEditor />
                <PasswordEditor />
                <PRFEditor />
                <LanguageSelector settings />
                <Center mt="xl">
                  <TimeFormatSelector />
                </Center>
              </Stack>
            </SimpleGrid>
          </Box>
        </Center>
      </Box>

      <Footer />
    </div>
  );
};