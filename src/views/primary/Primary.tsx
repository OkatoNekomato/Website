import { useEffect } from 'react';
import { ROUTER_PATH, sendNotification } from '../../shared';
import { useTranslation } from 'react-i18next';
import { Footer, PrimaryHeader, Secret } from '../../components';
import { Container, Drawer, Grid, ScrollArea, Text, Paper, Box } from '@mantine/core';
import { Secrets } from './subviews';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Folders } from './subviews/folders';
import {
  selectAuth,
  selectSecrets,
  setSecretPassword,
  useAppDispatch,
  useAppSelector,
  useAuth,
  useGoogleDrive,
  useSecrets,
} from '../../stores';
import { useNavigate } from 'react-router-dom';

export function Primary() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { t } = useTranslation('views');
  const {
    selectedSecret,
    selectedFolder,
    setSelectedSecret,
    setSelectedFolder,
    deleteSecret,
    fetchSecrets,
  } = useSecrets();

  const { secrets } = useAppSelector(selectSecrets);
  const { openSecretPasswordModal } = useAuth();
  const { secretPasswordModalState } = useAppSelector(selectAuth);
  const { doesGoogleDriveConnected, googleDriveStateFetched } = useGoogleDrive();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [foldersDrawerState, { close: closeFoldersDrawer, open: openFoldersDrawer }] =
    useDisclosure(false);
  const [secretsDrawerState, { close: closeSecretsDrawer }] = useDisclosure(false);

  const submit = (masterPassword: string): void => {
    if (secrets) {
      return;
    }

    dispatch(setSecretPassword(masterPassword));
    fetchSecrets(masterPassword);
  };

  const close = (): void => {
    navigate(ROUTER_PATH.MENU_VAULT);
  };

  useEffect(() => {
    if (!googleDriveStateFetched) {
      return;
    }

    if (!doesGoogleDriveConnected()) {
      navigate(ROUTER_PATH.MENU_VAULT);
      sendNotification(t('notifications:needConnectVault'));
      return;
    }

    if (!(secrets === null && !secretPasswordModalState)) {
      return;
    }

    openSecretPasswordModal(submit, close);
  }, [secrets, googleDriveStateFetched]);

  const getSecretSection = () => (
    <>
      {selectedSecret ? (
        <Secret
          sourceSecret={selectedSecret}
          delete={async () => {
            closeFoldersDrawer();
            setSelectedSecret(null);
            await deleteSecret(selectedSecret);
          }}
        />
      ) : (
        <Paper
          p="xl"
          radius="lg"
          style={{
            background: 'rgba(30, 30, 35, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(70, 70, 80, 0.3)',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text c="dimmed" size="lg" ta="center" fw={500}>
            {t('secrets:unselectedSecretPlaceholder')}
          </Text>
        </Paper>
      )}
    </>
  );

  const getMobileLayout = () => (
    <>
      <ScrollArea h={'calc(100vh - 200px)'} type="always" scrollbars="y" offsetScrollbars>
        <Folders
          allElementsButtonClick={() => {
            openFoldersDrawer();
          }}
        />
      </ScrollArea>
      <Drawer
        opened={!!selectedFolder || foldersDrawerState}
        onClose={() => {
          closeFoldersDrawer();
          setSelectedSecret(null);
          setSelectedFolder(null);
        }}
        position="bottom"
        size="100%"
        styles={{
          content: {
            background: '#18181b',
          },
          header: {
            background: 'transparent',
          },
        }}
      >
        <Secrets />
      </Drawer>
      <Drawer
        opened={!!selectedSecret || secretsDrawerState}
        onClose={() => {
          closeSecretsDrawer();
          setSelectedSecret(null);
          setSelectedFolder(null);
        }}
        position="bottom"
        size="100%"
        styles={{
          content: {
            background: '#18181b',
          },
          header: {
            background: 'transparent',
          },
        }}
      >
        {getSecretSection()}
      </Drawer>
    </>
  );

  const getLayout = () => (
    <Grid gutter="lg">
      <Grid.Col span={2}>
        <Paper
          p="lg"
          radius="lg"
          style={{
            background: 'rgba(30, 30, 35, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(70, 70, 80, 0.3)',
            height: 'calc(100vh - 180px)',
          }}
        >
          <ScrollArea h={'100%'} type="auto" scrollbars="y" offsetScrollbars>
            <Folders />
          </ScrollArea>
        </Paper>
      </Grid.Col>
      <Grid.Col span={4}>
        <Paper
          p="lg"
          radius="lg"
          style={{
            background: 'rgba(30, 30, 35, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(70, 70, 80, 0.3)',
            height: 'calc(100vh - 180px)',
          }}
        >
          <ScrollArea h={'100%'} type="auto" scrollbars="y" offsetScrollbars>
            <Secrets />
          </ScrollArea>
        </Paper>
      </Grid.Col>
      <Grid.Col span={6}>
        <Box>{getSecretSection()}</Box>
      </Grid.Col>
    </Grid>
  );

  const getContent = () => {
    return isMobile ? getMobileLayout() : getLayout();
  };

  return (
    <>
      <PrimaryHeader />
      <Container fluid px="xl" py="lg">
        {getContent()}
      </Container>
      <Footer />
    </>
  );
}