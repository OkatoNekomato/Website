import { Flex, Switch, Title } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendSuccessNotification } from '../shared';
import {
  selectAuth,
  selectEnvVars,
  setIs12HoursFormat,
  useAppDispatch,
  useAppSelector,
  useAuth,
} from '../stores';
import { changeTimeFormat } from '../api';

export const TimeFormatSelector = () => {
  const { t } = useTranslation('settings');
  const { envs } = useAppSelector(selectEnvVars);
  const { is12HoursFormat } = useAppSelector(selectAuth);
  const authContext = useAuth();
  const dispatch = useAppDispatch();

  const [is12Hours, setIs12Hours] = useState(is12HoursFormat);
  const [loading, setLoading] = useState(false);

  const toggleFormat = async (checked: boolean) => {
    if (loading) return;
    setLoading(true);

    try {
      setIs12Hours(checked);
      dispatch(setIs12HoursFormat(checked));

      const response = await changeTimeFormat(checked, envs, t, authContext);
      if (!response?.ok) throw new Error('Failed to update format');

      sendSuccessNotification(
        t('notifications:timeFormatChanged', {
          timeFormat: checked ? 12 : 24,
        }),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex direction='column' align='center' gap='xs'>
      <Title order={5} c='gray.2'>
        {t('main.timeFormat.title')}
      </Title>

      <Flex align='center' gap='sm'>
        <Switch
          size='xl'
          color='blue'
          onLabel='12'
          offLabel='24'
          checked={is12Hours}
          disabled={loading}
          onChange={(e) => toggleFormat(e.currentTarget.checked)}
          styles={{
            track: {
              backgroundColor: is12Hours ? '#3B82F6' : '#2C2E33',
              borderColor: '#3B3C40',
              transition: 'background-color 0.2s ease',
            },
            thumb: {
              backgroundColor: '#fff',
            },
          }}
        />
      </Flex>
    </Flex>
  );
};
