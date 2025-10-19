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

      if (!response || !response.ok) {
        return;
      }

      sendSuccessNotification(t("notifications:successful"));
      localStorage.setItem("last_email", email);
      navigate(ROUTER_PATH.SIGN_IN, { replace: true });
    } catch (err) {
      // sendErrorNotification(t("notifications:unknownError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      w={420}
      mx="auto"
      mt={100}
      p="xl"
      radius="lg"
      shadow="lg"
      style={{
        background: "linear-gradient(180deg, #141414 0%, #1b1b1b 100%)",
        color: "#e0e0e0",
        borderColor: "#2c2c2c",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Logo size={100} />

      <Title order={2} ta="center" mb="xs" c="gray.1">
        {t("signUp.title")}
      </Title>
      <Text ta="center" size="sm" mb="lg" c="dimmed">
        {t("signUp.desc")}
      </Text>

      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            ref={usernameRef}
            label={t("signUp.fields.name.title")}
            placeholder="John Doe"
            variant="filled"
            radius="sm"
            withAsterisk
            {...form.getInputProps("name")}
          />

          <TextInput
            label={t("signUp.fields.email.title")}
            placeholder="you@mail.com"
            variant="filled"
            radius="sm"
            withAsterisk
            {...form.getInputProps("email")}
          />

          <PasswordInput
            label={t("signUp.fields.password.title")}
            placeholder="******"
            variant="filled"
            radius="sm"
            withAsterisk
            {...form.getInputProps("password")}
          />

          <PasswordInput
            label={t("signUp.fields.confirmPassword.title")}
            placeholder="******"
            variant="filled"
            radius="sm"
            withAsterisk
            {...form.getInputProps("confirm")}
          />

          <Button
            type="submit"
            fullWidth
            mt="sm"
            radius="sm"
            loading={loading}
            disabled={!form.isValid()}
          >
            {t("signUp.title")}
          </Button>
        </Stack>
      </form>

      <Text ta="center" size="sm" mt="lg" c="gray.5">
        {t("signUp.alreadyHaveAccount")}{" "}
        <Anchor
          size="sm"
          c="blue.4"
          onClick={() => navigate(ROUTER_PATH.SIGN_IN, { replace: true })}
          style={{ cursor: "pointer" }}
        >
          {t("signIn.title")}
        </Anchor>
      </Text>
    </Paper>
  );
}
