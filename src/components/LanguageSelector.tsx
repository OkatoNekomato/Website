import { LoadingOverlay, Select } from '@mantine/core';
import { ELanguage } from '../types';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { sendSuccessNotification } from '../shared';
import { selectAuth, selectEnvVars, useAppSelector, useAuth } from '../stores';
import { changeLanguage } from '../api';

export const LanguageSelector = (props: { settings: boolean }) => {
  const [language, setLanguage] = useState<ELanguage | null>(null);
  const languages = [
    { value: 'ru', label: 'Русский' },
    { value: 'en', label: 'English' },
  ];

  const [loaderVisible, setLoaderState] = useDisclosure(false);
  const { t, i18n } = useTranslation('settings');
  const { envs } = useAppSelector(selectEnvVars);
  const { authEmail } = useAppSelector(selectAuth);
  const authContext = useAuth();

  const selectLanguage = async (newLanguage: string | null) => {
    if (!newLanguage) {
      return;
    }

    setLoaderState.open();
    setLanguage(newLanguage as ELanguage);
    await i18n.changeLanguage(newLanguage ?? 'en');

    if (authEmail) {
      const response = await changeLanguage(newLanguage, envs, t, authContext);
      if (!response) {
        setLoaderState.close();
        return;
      }
    }

    setLoaderState.close();
    sendSuccessNotification(
      t('notifications:languageChanged', {
        language: languages.find((lng) => lng.value === newLanguage)?.label,
      }),
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <LoadingOverlay
        visible={loaderVisible}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'blue' }}
      />

      <Select
        label={props.settings ? null : t('main.language.title')}
        placeholder={t('main.language.placeholder')}
        nothingFoundMessage={t('main.language.nothingFound')}
        value={language ?? i18n.language}
        data={languages}
        onChange={selectLanguage}
        checkIconPosition='right'
        size="md"
        radius="md"
        variant="filled"
        styles={{
          input: {
            background: 'rgba(40, 40, 50, 0.5)',
            border: '1px solid rgba(70, 70, 80, 0.3)',
            color: '#e4e4e7',
            '&:focus': {
              border: '1px solid rgba(100, 149, 237, 0.5)',
            },
          },
          label: {
            color: '#a1a1aa',
            marginBottom: '8px',
          },
        }}
      />
    </div>
  );
};