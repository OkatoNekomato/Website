import { Flex, LoadingOverlay, Switch, Title } from '@mantine/core';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
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
  const [loaderVisible, setLoaderState] = useDisclosure(false);
  const { t } = useTranslation('settings');
  const { envs } = useAppSelector(selectEnvVars);
  const auth = useAppSelector(selectAuth);
  const authContext = useAuth();
  const dispatch = useAppDispatch();
  const [is12Hours, setIs12Hours] = useState<boolean>(auth.is12HoursFormat);

  const selectIs12Hours = async (is12Hours: boolean) => {
    setLoaderState.open();

    setIs12Hours(is12Hours);
    dispatch(setIs12HoursFormat(is12Hours));

    const response = await changeTimeFormat(is12Hours, envs, t, authContext);
    if (!response) {
      setLoaderState.close();
      return;
    }

    setLoaderState.close();
    sendSuccessNotification(
      t('notifications:timeFormatChanged', {
        timeFormat: is12Hours ? 12 : 24,
      }),
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <LoadingOverlay
        visible={loaderVisible}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'blue' }}
      />

      <Flex direction={'column'} justify={'center'} align={'center'} gap={'md'}>
        <Title order={4} c="gray.2">
          {t('main.timeFormat.title')}
        </Title>
        <Switch
          size='xl'
          color='blue'
          onLabel="12"
          offLabel="24"
          checked={is12Hours}
          onChange={async (event) => {
            await selectIs12Hours(event.target.checked);
          }}
          styles={{
            track: {
              background: is12Hours ? 'rgba(100, 149, 237, 0.3)' : 'rgba(70, 70, 80, 0.5)',
              border: '1px solid rgba(70, 70, 80, 0.3)',
            },
          }}
        />
      </Flex>
    </div>
  );
};