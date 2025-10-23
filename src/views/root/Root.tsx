import { RootHeader, Footer } from '../../components';
import { RootFeature } from './features/RootFeatures.tsx';
import { RootFaq } from './faq/RootFaq.tsx';
import { RootHero } from './hero/RootHero.tsx';
import { RootFeedback } from './feedback/RootFeedback.tsx';
import { Divider, Stack } from '@mantine/core';

export default function Root() {
  return (
    <Stack
      gap={0}
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#0b0b0d',
        color: '#fff',
        flexDirection: 'column',
      }}
    >
      <RootHeader />
      <Stack
        flex={1}
        gap='xl'
        style={{
          flex: '1 0 auto',
          backgroundColor: '#0b0b0d',
          color: '#fff',
        }}
      >
        <RootHero />
        <Divider w='90%' mx='auto' />
        <RootFeature />
        <Divider w='90%' mx='auto' />
        <RootFaq />
        <Divider w='90%' mx='auto' />
        <RootFeedback />
      </Stack>
      <Footer />
    </Stack>
  );
}
