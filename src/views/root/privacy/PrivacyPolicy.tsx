import { Container, Text, Divider, Title, Stack } from '@mantine/core';
import { Footer, RootHeader } from '../../../components';
import { useTranslation } from 'react-i18next';
import { ScrollRestoration } from 'react-router-dom';

const sections = [
  'general_provisions',
  'interpretation_and_definitions',
  'collecting_and_using_your_personal_data',
  'tracking_technologies_and_cookies',
  'use_of_your_personal_data',
  'retention_of_your_personal_data',
  'transfer_of_your_personal_data',
  'delete_your_personal_data',
  'disclosure_of_your_personal_data',
  'security_of_your_personal_data',
  'childrens_privacy',
  'links_to_other_websites',
  'changes_to_this_privacy_policy',
  'contact_us',
];

export function PrivacyPolicy() {
  const { t } = useTranslation('privacyPolicy');

  return (
    <>
      <RootHeader />
      <Container size='xl' my='xl'>
        <Stack gap='sm'>
          <Title order={1}>{t('header')}</Title>
          <Divider />
          <Title order={2}>{t('last_updated')}</Title>
          <Divider />
        </Stack>

        <Stack mt='xl'>
          {sections.map((key, i) => {
            const section = t(key, { returnObjects: true }) as {
              title: string;
              items?: string[];
            };

            return (
              <section key={key}>
                <Title order={2} mb='xs'>
                  {i + 1}. {section.title}
                </Title>
                {section.items && (
                  <ol style={{ paddingLeft: '1.5rem' }}>
                    {section.items.map((text, j) => (
                      <li key={j}>
                        <Text size='lg'>{text}</Text>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            );
          })}
        </Stack>
      </Container>
      <Footer />
      <ScrollRestoration />
    </>
  );
}
