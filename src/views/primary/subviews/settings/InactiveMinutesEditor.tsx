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
    <Card shadow='xl' padding='lg' radius='md' style={{ width: isMobile ? '80vw' : '460px' }}>
      <form onSubmit={handleSave}>
        <Stack gap={'xs'}>
          <Title order={isMobile ? 4 : 2} style={{ textAlign: 'center' }}>
            {t('main.inactiveMinutes.title')}
          </Title>

          <Title order={6} style={{ textAlign: 'center' }}>
            {t('main.inactiveMinutes.description')}
          </Title>

          {!isEditing ? (
            <Text>{t('main.inactiveMinutes.currentValue', { minutes: inactiveMinutes })}</Text>
          ) : (
            <TextInput
              label={t('main.inactiveMinutes.placeholder')}
              value={tempValue}
              type='number'
              min={1}
              max={9999}
              onChange={(event) => {
                const value = Number(event.currentTarget.value);
                if (value < 2 || value > 9999) {
                  return;
                }

                setTempValue(value);
              }}
              disabled={!isEditing}
            />
          )}

          <Group justify='space-between'>
            {!isEditing ? (
              <Button fullWidth onClick={() => setIsEditing(true)}>
                {t('main.inactiveMinutes.editButton')}
              </Button>
            ) : (
              <>
                <Button fullWidth type={'submit'} color='green'>
                  {t('main.inactiveMinutes.saveButton')}
                </Button>
                <Button fullWidth color='red' onClick={handleCancel}>
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
