import { Accordion, Container, Title } from '@mantine/core';
import classes from './RootFaq.module.css';
import { useTranslation } from 'react-i18next';

const faqData = [
  { title: 'faq.elements.1.question', description: 'faq.elements.1.answer' },
  { title: 'faq.elements.2.question', description: 'faq.elements.2.answer' },
  { title: 'faq.elements.3.question', description: 'faq.elements.3.answer' },
  { title: 'faq.elements.4.question', description: 'faq.elements.4.answer' },
];

export function RootFaq() {
  const { t } = useTranslation('root');

  return (
    <Container size='sm' className={classes.wrapper}>
      <Title ta='center' order={2} className={classes.title}>
        {t('faq.title')}
      </Title>

      <Accordion
        variant='separated'
        transitionDuration={200}
        styles={{
          item: {
            backgroundColor: '#0b0b0d',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '8px',
            marginBottom: '0.5rem',
          },
          control: {
            color: '#fff',
          },
          panel: {
            color: '#fff',
          },
        }}
      >
        {faqData.map(({ title, description }) => (
          <Accordion.Item key={title} className={classes.item} value={title}>
            <Accordion.Control>{t(title)}</Accordion.Control>
            <Accordion.Panel>{t(description)}</Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  );
}
