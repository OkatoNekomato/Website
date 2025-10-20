"use client";

import { useState, useRef, useMemo, FormEvent, useEffect } from "react";
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Anchor,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import validator from "validator";
import passwordValidator from "password-validator";
import Logo from "../../components/Logo";
import {
  ROUTER_PATH,
  getTimeFormatByLocalization,
  sendSuccessNotification,
} from "../../shared";
import { signUp } from "../../api";
import { selectEnvVars, useAppSelector } from "../../stores";

export default function SignUp() {
  const { t, i18n } = useTranslation("auth");
  const navigate = useNavigate();
  const { envs } = useAppSelector(selectEnvVars);
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  const passwordSchema = useMemo(
    () =>
      new passwordValidator()
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
        .spaces(),
    []
  );

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirm: "",
    },
    validateInputOnChange: true,
    validate: {
      name: (v) => (v.trim().length < 4 ? t("signUp.fields.name.tooLittle") : null),
      email: (v) => (validator.isEmail(v) ? null : t("signUp.fields.email.invalid")),
      password: (v) =>
        passwordSchema.validate(v) ? null : t("signUp.fields.password.invalid"),
      confirm: (v, values) =>
        v !== values.password ? t("signUp.fields.confirmPassword.invalid") : null,
    },
  });

  useEffect(() => {
    const tId = setTimeout(() => usernameRef.current?.focus(), 200);
    return () => clearTimeout(tId);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.validate().hasErrors) return;

    setLoading(true);
    const { name, email, password } = form.values;

    try {
      const response = await signUp(
        name,
        email,
        password,
        i18n.language,
        getTimeFormatByLocalization(i18n.language) ?? false,
        envs,
        t
      );

      if (!response?.ok) return;

      sendSuccessNotification(t("notifications:successful"));
      localStorage.setItem("last_email", email);
      navigate(ROUTER_PATH.SIGN_IN, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      w={420}
      mx="auto"
      mt={100}
      p="2rem"
      radius="lg"
      shadow="xl"
      style={{
        background: "linear-gradient(180deg, #141417 0%, #18181b 100%)",
        border: "1px solid #2c2f33",
        color: "#e5e5e5",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Logo size={90} mb="md" />

      <Title
        order={2}
        ta="center"
        mb="xs"
        style={{ color: "#f1f1f1", fontWeight: 700, letterSpacing: "0.02em" }}
      >
        {t("signUp.title")}
      </Title>
      <Text ta="center" size="sm" mb="xl" c="gray.5">
        {t("signUp.desc")}
      </Text>

      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <TextInput
            ref={usernameRef}
            label={t("signUp.fields.name.title")}
            placeholder="John Doe"
            variant="filled"
            radius="sm"
            withAsterisk
            {...form.getInputProps("name")}
            styles={{
              input: {
                backgroundColor: "#1e1f23",
                borderColor: "#2c2f33",
                "&:focus": { borderColor: "#3b82f6" },
              },
              label: { color: "#cfcfcf" },
            }}
          />

          <TextInput
            label={t("signUp.fields.email.title")}
            placeholder="you@mail.com"
            variant="filled"
            radius="sm"
            withAsterisk
            {...form.getInputProps("email")}
            styles={{
              input: {
                backgroundColor: "#1e1f23",
                borderColor: "#2c2f33",
                "&:focus": { borderColor: "#3b82f6" },
              },
              label: { color: "#cfcfcf" },
            }}
          />

          <PasswordInput
            label={t("signUp.fields.password.title")}
            placeholder="••••••••"
            variant="filled"
            radius="sm"
            withAsterisk
            {...form.getInputProps("password")}
            styles={{
              input: {
                backgroundColor: "#1e1f23",
                borderColor: "#2c2f33",
                "&:focus": { borderColor: "#3b82f6" },
              },
              label: { color: "#cfcfcf" },
            }}
          />

          <PasswordInput
            label={t("signUp.fields.confirmPassword.title")}
            placeholder="••••••••"
            variant="filled"
            radius="sm"
            withAsterisk
            {...form.getInputProps("confirm")}
            styles={{
              input: {
                backgroundColor: "#1e1f23",
                borderColor: "#2c2f33",
                "&:focus": { borderColor: "#3b82f6" },
              },
              label: { color: "#cfcfcf" },
            }}
          />

          <Button
            type="submit"
            fullWidth
            mt="md"
            radius="sm"
            loading={loading}
            disabled={!form.isValid()}
            styles={{
              root: {
                backgroundColor: "#2563eb",
                fontWeight: 600,
                letterSpacing: "0.02em",
                transition: "background-color 0.15s ease, opacity 0.15s ease",
                "&:hover": { backgroundColor: "#1d4ed8" },
                "&[data-disabled]": {
                  backgroundColor: "#1e40af",
                  opacity: 0.6,
                  cursor: "not-allowed",
                },
              },
              label: { color: "#fff" },
            }}
          >
            {t("signUp.title")}
          </Button>
        </Stack>
      </form>

      <Divider
        my="xl"
        color="rgba(255,255,255,0.1)"
        labelPosition="center"
      />

      <Text ta="center" size="sm" c="gray.5">
        {t("signUp.alreadyHaveAccount")}{" "}
        <Anchor
          size="sm"
          c="blue.4"
          onClick={() => navigate(ROUTER_PATH.SIGN_IN, { replace: true })}
          style={{
            cursor: "pointer",
            fontWeight: 500,
            transition: "color 0.15s ease",
          }}
        >
          {t("signIn.title")}
        </Anchor>
      </Text>
    </Paper>
  );
}
