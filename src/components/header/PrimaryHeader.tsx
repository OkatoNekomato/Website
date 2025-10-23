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

  const headerBg = 'rgba(12, 12, 14, 0.9)';
  const borderColor = 'rgba(255, 255, 255, 0.06)';
  const accent = '#3b82f6';

  return (
    <Box
      mb='xl'
      style={{
        background: headerBg,
      }}
    >
      {!drawerOpened && (
        <header
          className={classes.header}
          style={{
            background: headerBg,
            borderBottom: `1px solid ${borderColor}`,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          }}
        >
          <Group justify='space-between' h='100%'>
            <Group style={{ cursor: 'pointer' }} onClick={() => navigate(ROUTER_PATH.ROOT)}>
              <Image
                src='/logo.svg'
                h={isMobile ? 30 : 40}
                w={isMobile ? 30 : 40}
                alt='Immortal Vault'
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.4))',
                  cursor: 'pointer',
                }}
              />
              <Title
                order={isMobile ? 4 : 2}
                style={{
                  color: 'white',
                  fontWeight: 700,
                  textShadow: '0 0 10px rgba(59,130,246,0.3)',
                }}
              >
                Immortal Vault
              </Title>
            </Group>

            <Group visibleFrom='sm'>
              <ProfileAvatarWithMenu />
            </Group>

            <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom='sm' color='white' />
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
        overlayProps={{ backgroundOpacity: 0.5, blur: 6 }}
        styles={{
          content: {
            background: 'rgba(14,14,18,0.95)',
            borderLeft: `1px solid ${borderColor}`,
          },
        }}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx='-md'>
          <Divider mb='xl' color={borderColor} />

          <Group justify='center' grow pb='xl' px='md'>
            <Flex direction='column' gap='md'>
              <Button
                fullWidth
                variant='light'
                color={accent}
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
                variant='light'
                color={accent}
                onClick={() => navigate(ROUTER_PATH.MENU_SETTINGS)}
              >
                {t('header.settings')}
              </Button>

              <Button
                fullWidth
                variant='light'
                color={accent}
                onClick={() => navigate(ROUTER_PATH.MENU_VAULT)}
              >
                {t('header.vault')}
              </Button>

              <Button
                fullWidth
                variant='light'
                color='red'
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
