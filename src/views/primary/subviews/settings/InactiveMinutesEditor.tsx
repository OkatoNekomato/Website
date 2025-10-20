import { FormEvent, useState } from "react";
import {
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@mantine/hooks";
import {
  selectAuth,
  selectEnvVars,
  setInactiveMinutes,
  useAppDispatch,
  useAppSelector,
  useAuth,
} from "../../../../stores";
import { changeInactiveMinutes } from "../../../../api";

export const InactiveMinutesEditor = (): JSX.Element => {
  const { t } = useTranslation("settings");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { inactiveMinutes } = useAppSelector(selectAuth);
  const { envs } = useAppSelector(selectEnvVars);
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const [tempValue, setTempValue] = useState(inactiveMinutes);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!(await changeInactiveMinutes(tempValue, envs, t, auth))) return;
    dispatch(setInactiveMinutes(tempValue));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(inactiveMinutes);
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
      <form onSubmit={handleSave}>
        <Stack gap="md">
          <Title
            order={isMobile ? 4 : 3}
            ta="center"
            style={{
              color: "#f2f2f2",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            {t("main.inactiveMinutes.title")}
          </Title>

          <Text
            size="sm"
            ta="center"
            c="gray.5"
            style={{ opacity: 0.8, lineHeight: 1.4 }}
          >
            {t("main.inactiveMinutes.description")}
          </Text>

          {!isEditing ? (
            <Text
              ta="center"
              size="sm"
              c="gray.3"
              style={{ fontWeight: 500 }}
            >
              {t("main.inactiveMinutes.currentValue", {
                minutes: inactiveMinutes,
              })}
            </Text>
          ) : (
            <TextInput
              type="number"
              value={tempValue}
              onChange={(e) => {
                const value = Number(e.currentTarget.value);
                if (value < 1 || value > 9999) return;
                setTempValue(value);
              }}
              size="md"
              min={1}
              max={9999}
              radius="sm"
              styles={{
                input: {
                  backgroundColor: "#1b1c1f",
                  borderColor: "#2d2e32",
                  color: "#f2f2f2",
                  textAlign: "center",
                  fontWeight: 500,
                },
              }}
            />
          )}

          <Group grow>
            {!isEditing ? (
              <Button
                fullWidth
                color="blue"
                radius="sm"
                onClick={() => setIsEditing(true)}
              >
                {t("main.inactiveMinutes.editButton")}
              </Button>
            ) : (
              <>
                <Button
                  type="submit"
                  color="blue"
                  radius="sm"
                  fullWidth
                >
                  {t("main.inactiveMinutes.saveButton")}
                </Button>
                <Button
                  onClick={handleCancel}
                  color="gray"
                  radius="sm"
                  variant="light"
                  fullWidth
                >
                  {t("main.inactiveMinutes.cancelButton")}
                </Button>
              </>
            )}
          </Group>
        </Stack>
      </form>
    </Card>
  );
};
