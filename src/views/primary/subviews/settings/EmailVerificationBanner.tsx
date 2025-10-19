import { selectAuth, selectEnvVars, useAppSelector } from "../../../../stores";
import { useTranslation } from "react-i18next";
import { Button, Text, TextInput, Stack, Group, Alert, ThemeIcon } from "@mantine/core";
import { useState } from "react";
import { sendEmailVerificationCode, sendEmailVerification } from "../../../../api/gmail";
import { IconMail, IconMailCheck, IconAlertCircle } from "@tabler/icons-react";

export function EmailVerificationBanner() {
  const { t } = useTranslation("auth");
  const { envs } = useAppSelector(selectEnvVars);
  const { isEmailVerified, authEmail } = useAppSelector(selectAuth);

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");

  if (isEmailVerified) return null;

  const handleSendCode = async () => {
    setLoading(true);
    try {
      const res = await sendEmailVerificationCode(authEmail, envs, t);
      if (res?.ok) setSent(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) return;
    setLoading(true);
    try {
      const res = await sendEmailVerification(code, envs, t);
      if (res?.ok) {
        setSent(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Alert
      variant="light"
      color="orange"
      radius="md"
      icon={<IconAlertCircle size={20} />}
      styles={{
        root: {
          border: '2px solid var(--mantine-color-orange-3)',
        },
      }}
    >
      <Stack gap="md">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={40} radius="xl" variant="light" color="orange">
            {sent ? <IconMailCheck size={20} /> : <IconMail size={20} />}
          </ThemeIcon>
          <div style={{ flex: 1 }}>
            <Text fw={600} size="sm" c="orange.9">
              {t("verify.title")}
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              {sent ? t("verify.enterCode") : t("verify.notice")}
            </Text>
          </div>
        </Group>

        {!sent ? (
          <Button
            fullWidth
            onClick={handleSendCode}
            loading={loading}
            color="orange"
            leftSection={<IconMail size={16} />}
          >
            {t("verify.resend")}
          </Button>
        ) : (
          <Stack gap="sm">
            <TextInput
              placeholder={t("verify.codePlaceholder")}
              value={code}
              onChange={(e) => setCode(e.currentTarget.value)}
              size="sm"
              styles={{
                input: {
                  textAlign: 'center',
                  letterSpacing: '0.25em',
                  fontWeight: 500,
                }
              }}
            />
            <Group grow gap="xs">
              <Button
                onClick={handleVerifyCode}
                loading={loading}
                color="orange"
                disabled={!code}
              >
                {t("verify.verify")}
              </Button>
              <Button
                onClick={() => {
                  setSent(false);
                  setCode("");
                }}
                variant="light"
                color="gray"
              >
                {t("verify.cancel") || "Отмена"}
              </Button>
            </Group>
          </Stack>
        )}
      </Stack>
    </Alert>
  );
}