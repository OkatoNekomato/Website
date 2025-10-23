import { useState } from 'react';
import { Loader, Select } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useDisclosure } from '@mantine/hooks';
import { ELanguage } from '../types';
import { sendSuccessNotification } from '../shared';
import { selectAuth, selectEnvVars, useAppSelector, useAuth } from '../stores';
import { changeLanguage } from '../api';

export const LanguageSelector = ({ settings }: { settings: boolean }) => {
  const { t, i18n } = useTranslation('settings');
  const { envs } = useAppSelector(selectEnvVars);
  const { authEmail } = useAppSelector(selectAuth);
  const auth = useAuth();

  const [language, setLanguage] = useState<ELanguage>((i18n.language as ELanguage) || 'en');
  const [loading, { open: startLoading, close: stopLoading }] = useDisclosure(false);

  const languages = [
    { value: 'ru', label: 'Русский' },
    { value: 'en', label: 'English' },
  ];

  const selectLanguage = async (newLang: string | null) => {
    if (!newLang || newLang === language) return;
    startLoading();

    try {
      await i18n.changeLanguage(newLang);
      setLanguage(newLang as ELanguage);

      if (authEmail) {
        const response = await changeLanguage(newLang, envs, t, auth);
        if (!response?.ok) throw new Error('Language update failed');
      }

      sendSuccessNotification(
        t('notifications:languageChanged', {
          language: languages.find((lng) => lng.value === newLang)?.label,
        }),
      );
    } catch (err) {
      console.error(err);
    } finally {
      stopLoading();
    }
  };

  return (
    <Select
      label={settings ? t('main.language.title') : undefined}
      placeholder={t('main.language.placeholder')}
      data={languages}
      value={language}
      onChange={selectLanguage}
      checkIconPosition='right'
      rightSection={loading ? <Loader size={18} color='blue' /> : undefined}
      disabled={loading}
      styles={{
        input: {
          backgroundColor: '#1A1B1E',
          color: '#E0E0E0',
          borderColor: '#2C2E33',
          transition: 'border-color 150ms ease',
          '&:focus': { borderColor: '#3B82F6' },
        },
        dropdown: {
          backgroundColor: '#1A1B1E',
          borderColor: '#2C2E33',
        },
        label: { color: '#C0C0C0' },
      }}
      style={{
        width: settings ? '15rem' : '8rem',
      }}
    />
  );
};
