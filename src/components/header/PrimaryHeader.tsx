import {
  Box,
  Burger,
  Button,
  Divider,
  Drawer,
  Flex,
  Group,
  Image,
  rem,
  ScrollArea,
  Title,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import classes from './RootHeader.module.css';
import { useTranslation } from 'react-i18next';
import { ProfileAvatarWithMenu } from '../ProfileAvatarWithMenu.tsx';
import { ROUTER_PATH, sendNotification, sendSuccessNotification } from '../../shared';
import { useNavigate } from 'react-router-dom';
import { useAuth, useGoogleDrive, useSecrets } from '../../stores';

export function PrimaryHeader() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { t } = useTranslation('root');
  const { authSignOut } = useAuth();
  const { setSecrets, setSelectedSecret, setSelectedFolder } = useSecrets();
  const navigate = useNavigate();
  const { doesGoogleDriveConnected } = useGoogleDrive();

  return (
    <Box mb={'xl'}>
      {!drawerOpened && (
        <header className={classes.header}>
          <Group justify='space-between' h='100%'>
            <Group>
              <Image
                src={'/logo.svg'}
                h={isMobile ? 30 : 40}
                w={isMobile ? 30 : 40}
                alt={'Immortal Vault'}
                onClick={() => navigate(ROUTER_PATH.ROOT)}
              />
              <Title
                order={isMobile ? 4 : 2}
                style={{
                  color: 'white',
                }}
                onClick={() => navigate(ROUTER_PATH.ROOT)}
              >
                Immortal Vault
              </Title>
            </Group>

            <Group visibleFrom='sm'>
              <ProfileAvatarWithMenu />
            </Group>

            <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom='sm' />
          </Group>
        </header>
      )}

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size='100%'
        padding='md'
        title={t('header.navigation')}
        hiddenFrom='sm'
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx='-md'>
          <Divider mb={'xl'} />

          <Group justify='center' grow pb='xl' px='md'>
            <Flex direction={'column'} gap={'md'}>
              <Button
                fullWidth
                onClick={() => {
                  if (!doesGoogleDriveConnected()) {
                    closeDrawer();
                    navigate(ROUTER_PATH.MENU_VAULT);
                    sendNotification(t('notifications:needConnectVault'));
                    return;
                  }

                  navigate(ROUTER_PATH.MENU);
                }}
              >
                {t('header.menu')}
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  navigate(ROUTER_PATH.MENU_SETTINGS);
                }}
              >
                {t('header.settings')}
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  navigate(ROUTER_PATH.MENU_VAULT);
                }}
              >
                {t('header.vault')}
              </Button>
              <Button
                fullWidth
                color={'red'}
                onClick={async () => {
                  await authSignOut(false);
                  setSecrets(null);
                  setSelectedSecret(null);
                  setSelectedFolder(null);
                  sendSuccessNotification(t('auth:signOut:successful'));
                }}
              >
                {t('header.exit')}
              </Button>
            </Flex>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}