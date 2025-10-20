import { FormEvent, useState } from 'react';
import { Button, Card, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@mantine/hooks';
import {
  selectAuth,
  selectEnvVars,
  setInactiveMinutes,
  useAppDispatch,
  useAppSelector,
  useAuth,
} from '../../../../stores';
import { changeInactiveMinutes } from '../../../../api';

export const InactiveMinutesEditor = (): JSX.Element => {
  const { t } = useTranslation('settings');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { inactiveMinutes } = useAppSelector(selectAuth);
  const { envs } = useAppSelector(selectEnvVars);
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const [tempValue, setTempValue] = useState(inactiveMinutes);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!(await changeInactiveMinutes(tempValue, envs, t, auth))) {
      return;
    }

    dispatch(setInactiveMinutes(tempValue));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(inactiveMinutes);
    setIsEditing(false);
  };

  return (
    <Card
      shadow="xl"
      padding="xl"
      radius="lg"
      withBorder
      style={{
        height: '100%',
        minHeight: '240px',
        background: 'rgba(30, 30, 35, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(70, 70, 80, 0.3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <form onSubmit={handleSave} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack gap="lg" style={{ flex: 1, justifyContent: 'space-between' }}>
          <div>
            <Title order={isMobile ? 4 : 2} style={{ textAlign: 'center' }} c="gray.0" mb="md">
              {t('main.inactiveMinutes.title')}
            </Title>

            <Text size="sm" style={{ textAlign: 'center' }} c="dimmed" mb="lg">
              {t('main.inactiveMinutes.description')}
            </Text>

            {!isEditing ? (
              <Text size="lg" ta="center" c="gray.1" fw={500}>
                {t('main.inactiveMinutes.currentValue', { minutes: inactiveMinutes })}
              </Text>
            ) : (
              <TextInput
                label={t('main.inactiveMinutes.placeholder')}
                value={tempValue}
                type="number"
                min={2}
                max={9999}
                variant="filled"
                radius="md"
                size="md"
                onChange={(event) => {
                  const value = Number(event.currentTarget.value);
                  if (value < 2 || value > 9999) {
                    return;
                  }
                  setTempValue(value);
                }}
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
            )}
          </div>

          <Group gap="md">
            {!isEditing ? (
              <Button fullWidth radius="md" size="md" onClick={() => setIsEditing(true)}>
                {t('main.inactiveMinutes.editButton')}
              </Button>
            ) : (
              <>
                <Button fullWidth radius="md" size="md" type="submit" color="green" variant="light">
                  {t('main.inactiveMinutes.saveButton')}
                </Button>
                <Button fullWidth radius="md" size="md" color="red" variant="light" onClick={handleCancel}>
                  {t('main.inactiveMinutes.cancelButton')}
                </Button>
              </>
            )}
          </Group>
        </Stack>
      </form>
    </Card>
  );
};