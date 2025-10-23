import {
  Card,
  Container,
  rem,
  SimpleGrid,
  Text,
  Title,
  useMantineTheme,
  Flex,
} from '@mantine/core';
import classes from './RootFeatures.module.css';
import { FaLock } from 'react-icons/fa';
import { GrLanguage } from 'react-icons/gr';
import { MdOutlineDevices } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

const featuresData = [
  {
    title: 'features.elements.1.title',
    description: 'features.elements.1.description',
    icon: FaLock,
  },
  {
    title: 'features.elements.2.title',
    description: 'features.elements.2.description',
    icon: MdOutlineDevices,
  },
  {
    title: 'features.elements.3.title',
    description: 'features.elements.3.description',
    icon: GrLanguage,
  },
];

export function RootFeature() {
  const theme = useMantineTheme();
  const { t } = useTranslation('root');

  return (
    <Container size='lg' pb='xl'>
      <Title order={2} className={classes.title} ta='center'>
        {t('features.title')}
      </Title>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing='xl' mt='xl'>
        {featuresData.map(({ title, description, icon: Icon }) => (
          <Card
            key={title}
            shadow='sm'
            radius='md'
            className={classes.card}
            style={{
              backgroundColor: '#0b0b0d',
            }}
            padding='xl'
            withBorder
          >
            <Flex direction='column' align='center' justify='center' h='100%' gap='sm'>
              <Icon style={{ width: rem(48), height: rem(48) }} color={theme.colors.blue[6]} />
              <Text fz='lg' fw={600} ta='center' className={classes.cardTitle}>
                {t(title)}
              </Text>
              <Text fz='sm' c='dimmed' ta='center'>
                {t(description)}
              </Text>
            </Flex>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
