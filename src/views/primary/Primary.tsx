import { useEffect } from 'react';
import { Container, Grid, Paper, ScrollArea } from '@mantine/core';
import { PrimaryHeader, Footer } from '../../components';
import { useMediaQuery } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ROUTER_PATH, sendNotification } from '../../shared';
import {
  useSecrets,
  useAuth,
  useGoogleDrive,
  setSecretPassword,
  selectAuth,
  selectSecrets,
  useAppSelector,
  useAppDispatch,
} from '../../stores';
import { Folders } from './subviews/folders';
import { Secrets } from './subviews/secrets';

export function Primary() {
  const { t } = useTranslation('views');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();

  const { secrets } = useAppSelector(selectSecrets);
  const { secretPasswordModalState } = useAppSelector(selectAuth);
  const { openSecretPasswordModal } = useAuth();
  const { doesGoogleDriveConnected, googleDriveStateFetched } = useGoogleDrive();
  const { fetchSecrets } = useSecrets();
  const dispatch = useAppDispatch();

  const submit = (password: string) => {
    if (secrets) return;
    dispatch(setSecretPassword(password));
    fetchSecrets(password);
  };

  useEffect(() => {
    if (!googleDriveStateFetched) return;
    if (!doesGoogleDriveConnected()) {
      navigate(ROUTER_PATH.MENU_VAULT);
      sendNotification(t('notifications:needConnectVault'));
      return;
    }
    if (!(secrets === null && !secretPasswordModalState)) return;
    openSecretPasswordModal(submit, () => navigate(ROUTER_PATH.MENU_VAULT));
  }, [googleDriveStateFetched, secrets]);

  const Block = ({ children }: { children: React.ReactNode }) => (
    <Paper
      p='lg'
      radius='md'
      withBorder
      style={{
        background: 'rgba(18,18,20,0.75)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(10px)',
        height: 'calc(100vh - 180px)',
        overflow: 'hidden',
      }}
    >
      <ScrollArea h='100%' scrollbarSize={6} offsetScrollbars>
        {children}
      </ScrollArea>
    </Paper>
  );

  if (isMobile) return null;

  return (
    <>
      <PrimaryHeader />
      <Container
        fluid
        px='xl'
        py='lg'
        style={{
          background: '#0b0b0d',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Grid gutter='xl'>
          <Grid.Col span={2}>
            <Block>
              <Folders />
            </Block>
          </Grid.Col>
          <Grid.Col span={10}>
            <Block>
              <Secrets />
            </Block>
          </Grid.Col>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}
