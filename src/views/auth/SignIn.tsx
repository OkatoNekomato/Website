﻿"use client";

import { useEffect, useRef, useState } from "react";
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Anchor,
  Group,
  Divider,
  Transition,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import {
  LOCAL_STORAGE,
  ROUTER_PATH,
  sendErrorNotification,
  sendSuccessNotification,
} from "../../shared";
import {
  selectEnvVars,
  selectMfa,
  setMfaEnabled,
  setTotpCode,
  useAppDispatch,
  useAppSelector,
  useAuth,
} from "../../stores";
import { signIn } from "../../api";
import { EAuthState } from "../../types";
import Logo from "../../components/Logo";

export default function SignIn() {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const { envs } = useAppSelector(selectEnvVars);
  const { authSignIn } = useAuth();
  const mfa = useAppSelector(selectMfa);
  const dispatch = useAppDispatch();
  const passwordRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [approveMode, setApproveMode] = useState(false);

  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: (v) =>
        v.trim().length === 0 ? t("signIn.fields.emailOrUsername.canNotBeEmpty") : null,
      password: (v) =>
        v.trim().length === 0 ? t("signIn.fields.password.canNotBeEmpty") : null,
    },
  });

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE.LAST_EMAIL);
    if (saved) {
      form.setFieldValue("email", saved);
      setApproveMode(true);
      setTimeout(() => passwordRef.current?.focus(), 200);
    }
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    if (form.validate().hasErrors) return;
    if (mfaRequired && (!mfa.totpCode || mfa.totpCode.length !== 6)) {
      sendErrorNotification(t("notifications:incorrectMfaCode"));
      return;
    }

    setLoading(true);
    try {
      const response = await signIn(values.email, values.password, mfa.totpCode, envs, t);
      if (!response) return;

      if (response === EAuthState.MfaRequired) {
        setMfaRequired(true);
        dispatch(setMfaEnabled(true));
        return;
      }

      const jsonResponse = await (response as Response).json();
      localStorage.setItem(LOCAL_STORAGE.LAST_EMAIL, values.email);

      sendSuccessNotification(t("notifications:successful"));
      authSignIn(
        jsonResponse.user.email,
        jsonResponse.username,
        jsonResponse.localization,
        jsonResponse.is12Hours,
        jsonResponse.inactiveMinutes
      );
      navigate(ROUTER_PATH.MENU, { replace: true });
    } catch {
      sendErrorNotification(t("notifications:unknownError"));
    } finally {
      setLoading(false);
    }
  };

  const resetEmail = () => {
    localStorage.removeItem(LOCAL_STORAGE.LAST_EMAIL);
    form.setFieldValue("email", "");
    setApproveMode(false);
  };

  return (
    <Paper
      w={420}
      mx="auto"
      mt={100}
      p="xl"
      radius="lg"
      shadow="xl"
      withBorder
      style={{
        background: "linear-gradient(180deg, #141414 0%, #1b1b1b 100%)",
        color: "#e0e0e0",
        borderColor: "#2c2c2c",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Stack align="center" mb="xl">
        <Logo size={100} />
        <Title order={2} ta="center" c="gray.1">
          {t("signIn.title")}
        </Title>
        <Text ta="center" size="sm" c="dimmed">
          {approveMode
            ? t("signIn.exists", { user: form.values.email })
            : t("signIn.desc")}
        </Text>
      </Stack>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <Transition mounted={!approveMode} transition="fade" duration={200} timingFunction="ease">
            {(styles) => (
              <div style={styles}>
                {!approveMode && (
                  <TextInput
                    label={t("signIn.fields.emailOrUsername.title")}
                    placeholder="you@mail.com"
                    variant="filled"
                    radius="sm"
                    withAsterisk
                    {...form.getInputProps("email")}
                  />
                )}
              </div>
            )}
          </Transition>

          <PasswordInput
            ref={passwordRef}
            label={t("signIn.fields.password.title")}
            placeholder="******"
            variant="filled"
            radius="sm"
            withAsterisk
            {...form.getInputProps("password")}
          />

          <Transition mounted={mfaRequired} transition="fade" duration={200}>
            {(styles) => (
              <div style={styles}>
                {mfaRequired && (
                  <TextInput
                    label={t("auth:mfa.totpLabel")}
                    placeholder={t("auth:mfa.totpPlaceholder")}
                    variant="filled"
                    radius="sm"
                    value={mfa.totpCode ?? ""}
                    onChange={(e) => {
                      if (e.currentTarget.value.length > 6) return;
                      dispatch(setTotpCode(e.currentTarget.value));
                    }}
                  />
                )}
              </div>
            )}
          </Transition>
          <Group gap={4} mt={4}>
            {approveMode ? (
              <>
                <Text span size="sm" c="gray.5" style={{ userSelect: "none" }}>
                  {t("signIn.anotherAccount")}&nbsp;
                </Text>
                <Anchor
                  size="sm"
                  c="blue.4"
                  style={{ cursor: "pointer", textDecoration: "none" }}
                  onClick={resetEmail}
                >
                  {t("signOut.title")}
                </Anchor>
              </>
            ) : (
              <>
                <Text span size="sm" c="gray.5" style={{ userSelect: "none" }}>
                  {t("signIn.doNotHaveAccount")}&nbsp;
                </Text>
                <Anchor
                  size="sm"
                  c="blue.4"
                  style={{ cursor: "pointer", textDecoration: "none" }}
                  onClick={() => navigate(ROUTER_PATH.SIGN_UP, { replace: true })}
                >
                  {t("signUp.title")}
                </Anchor>
              </>
            )}
          </Group>

          <Divider my="xs" color="gray.8" />

          <Button
            type="submit"
            fullWidth
            mt="sm"
            radius="sm"
            loading={loading}
            disabled={!form.isValid()}
          >
            {t("signIn.title")}
          </Button>
        </Stack>
      </form>

      <Text ta="center" size="sm" mt="lg" c="gray.5">
        <Anchor
          size="sm"
          c="blue.4"
          onClick={() => navigate(ROUTER_PATH.FORGOT, { replace: true })}
          style={{ cursor: "pointer" }}
        >
          {t("signIn.forgotPassword")}
        </Anchor>
      </Text>
    </Paper>
  );
}
