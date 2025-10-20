import { FormEvent, useState } from "react";
import {
  Button,
  Card,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@mantine/hooks";
import passwordValidator from "password-validator";
import { sendErrorNotification } from "../shared";
import {
  selectAuth,
  selectEnvVars,
  useAppSelector,
  useAuth,
} from "../stores";
import { changePassword } from "../api";
import { PasswordInputWithCapsLock } from "./PasswordInputWithCapsLock.tsx";

export const PasswordEditor = (): JSX.Element => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const auth = useAuth();
  const { envs } = useAppSelector(selectEnvVars);
  const { isMfaEnabled } = useAppSelector(selectAuth);

  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string): string | null => {
    const schema = new passwordValidator();
    schema
      .is()
      .min(8)
      .is()
      .max(100)
      .has()
      .uppercase()
      .has()
      .lowercase()
      .has()
      .digits(2)
      .has()
      .not()
      .spaces();

    return schema.validate(password)
      ? null
      : t("settings:main.password.invalid");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPwd !== confirmPwd) {
      sendErrorNotification(t("notifications:passwordsDoNotMatch"));
      setIsLoading(false);
      return;
    }

    const passwordError = validatePassword(newPwd);
    if (passwordError) {
      sendErrorNotification(passwordError);
      setIsLoading(false);
      return;
    }

    if (isMfaEnabled && totpCode.length !== 6) {
      sendErrorNotification(t("notifications:requiredMfa"));
      setIsLoading(false);
      return;
    }

    const response = await changePassword(
      oldPwd,
      newPwd,
      totpCode || null,
      envs,
      t,
      auth
    ).catch(() => setIsLoading(false));

    if (!response) {
      setIsLoading(false);
      return;
    }

    if (response.ok) {
      setIsEditing(false);
      resetForm();
    }

    setIsLoading(false);
  };

  const resetForm = () => {
    setOldPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setTotpCode("");
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  return (
    <Card
      withBorder
      radius="md"
      p="xl"
      style={{
        backgroundColor: "#141416",
        border: "1px solid #2c2c2f",
        boxShadow: "0 0 20px rgba(0, 102, 255, 0.08)",
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <LoadingOverlay
            visible={isLoading}
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 2 }}
          />

          <Title
            order={isMobile ? 4 : 3}
            ta="center"
            style={{
              color: "#f2f2f2",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            {t("settings:main.password.title")}
          </Title>

          {!isEditing ? (
            <Text ta="center" size="sm" c="gray.5">
              {t("settings:main.password.description")}
            </Text>
          ) : (
            <>
              <PasswordInputWithCapsLock
                label={t("settings:main.password.oldPassword")}
                value={oldPwd}
                onChange={(e) => setOldPwd(e.currentTarget.value)}
                required
              />

              <PasswordInputWithCapsLock
                label={t("settings:main.password.newPassword")}
                value={newPwd}
                onChange={(e) => setNewPwd(e.currentTarget.value)}
                error={newPwd && validatePassword(newPwd)}
                required
              />

              <PasswordInputWithCapsLock
                label={t("settings:main.password.confirmPassword")}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.currentTarget.value)}
                error={
                  confirmPwd && newPwd !== confirmPwd
                    ? t("settings:main.password.mismatch")
                    : null
                }
                required
              />

              {isMfaEnabled && (
                <TextInput
                  label={t("settings:main.password.totpCode")}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.currentTarget.value)}
                  required
                  placeholder="123456"
                  styles={{
                    input: {
                      backgroundColor: "#1b1c1f",
                      borderColor: "#2d2e32",
                      color: "#f2f2f2",
                    },
                  }}
                />
              )}
            </>
          )}

          <Group grow>
            {!isEditing ? (
              <Button
                fullWidth
                color="blue"
                radius="sm"
                onClick={() => setIsEditing(true)}
              >
                {t("settings:main.password.editButton")}
              </Button>
            ) : (
              <>
                <Button type="submit" color="blue" radius="sm" fullWidth>
                  {t("settings:main.password.saveButton")}
                </Button>
                <Button
                  color="gray"
                  radius="sm"
                  variant="light"
                  fullWidth
                  onClick={handleCancel}
                >
                  {t("settings:main.password.cancelButton")}
                </Button>
              </>
            )}
          </Group>
        </Stack>
      </form>
    </Card>
  );
};
