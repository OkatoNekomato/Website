import { useState } from "react";
import { Loader, Select } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useDisclosure } from "@mantine/hooks";
import { ELanguage } from "../types";
import { sendSuccessNotification } from "../shared";
import { selectAuth, selectEnvVars, useAppSelector, useAuth } from "../stores";
import { changeLanguage } from "../api";

export const LanguageSelector = ({ settings }: { settings: boolean }) => {
  const { t, i18n } = useTranslation("settings");
  const { envs } = useAppSelector(selectEnvVars);
  const { authEmail } = useAppSelector(selectAuth);
  const auth = useAuth();

  const [language, setLanguage] = useState<ELanguage>(
    (i18n.language as ELanguage) || "en"
  );
  const [loading, { open: startLoading, close: stopLoading }] =
    useDisclosure(false);

  const languages = [
    { value: "ru", label: "Русский" },
    { value: "en", label: "English" },
  ];

  const selectLanguage = async (newLang: string | null) => {
    if (!newLang || newLang === language) return;
    startLoading();

    try {
      await i18n.changeLanguage(newLang);
      setLanguage(newLang as ELanguage);

      if (authEmail) {
        const response = await changeLanguage(newLang, envs, t, auth);
        if (!response?.ok) throw new Error("Language update failed");
      }

      sendSuccessNotification(
        t("notifications:languageChanged", {
          language: languages.find((lng) => lng.value === newLang)?.label,
        })
      );
    } catch (err) {
      console.error(err);
    } finally {
      stopLoading();
    }
  };

  return (
    <div style={{ flex: '1 0 auto' }}>
      <LoadingOverlay
        visible={loaderVisible}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'blue' }}
      />

      <Select
        label={props.settings && t('main.language.title')}
        placeholder={t('main.language.placeholder')}
        nothingFoundMessage={t('main.language.nothingFound')}
        value={language}
        data={languages}
        onChange={selectLanguage}
        checkIconPosition='right'
        style={{
          width: props.settings ? '15rem' : '8rem',
        }}
      />
    </div>
  );
};