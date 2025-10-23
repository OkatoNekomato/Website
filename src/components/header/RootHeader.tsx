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
import { useNavigate } from 'react-router-dom';
import { ROUTER_PATH, sendSuccessNotification } from '../../shared';
import { useTranslation } from 'react-i18next';
import { selectAuth, useAppSelector, useAuth } from '../../stores';
import { EAuthState } from '../../types';
import { ProfileAvatarWithMenu } from '../ProfileAvatarWithMenu.tsx';
import classes from './RootHeader.module.css';

export function RootHeader() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const { t } = useTranslation('root');
  const { authState } = useAppSelector(selectAuth);
  const { authSignOut } = useAuth();

  const headerBg = 'rgba(12, 12, 14, 0.9)';
  const borderColor = 'rgba(255, 255, 255, 0.06)';
  const accent = '#3b82f6';

  return (
    <Box
      pb={40}
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
            <Group>
              <Image
                src='/logo.svg'
                h={isMobile ? 30 : 40}
                w={isMobile ? 30 : 40}
                alt='Immortal Vault'
                style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.4))' }}
              />
              <Title
                order={isMobile ? 4 : 2}
                style={{
                  color: 'white',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  textShadow: '0 0 10px rgba(59,130,246,0.3)',
                }}
              >
                Immortal Vault
              </Title>
            </Group>

            <Group visibleFrom='sm'>
              {authState === EAuthState.Deauthorized && (
                <>
                  <Button
                    variant='outline'
                    color={accent}
                    onClick={() => navigate(ROUTER_PATH.SIGN_IN)}
                  >
                    {t('header.signIn')}
                  </Button>
                  <Button color={accent} onClick={() => navigate(ROUTER_PATH.SIGN_UP)}>
                    {t('header.signUp')}
                  </Button>
                </>
              )}
              {authState === EAuthState.Authorized && <ProfileAvatarWithMenu />}
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
          <Divider mb='lg' color={borderColor} />

          <Group justify='center' grow pb='xl' px='md'>
            {authState === EAuthState.Deauthorized && (
              <>
                <Button
                  variant='outline'
                  color={accent}
                  onClick={() => navigate(ROUTER_PATH.SIGN_IN)}
                >
                  {t('header.signIn')}
                </Button>
                <Button color={accent} onClick={() => navigate(ROUTER_PATH.SIGN_UP)}>
                  {t('header.signUp')}
                </Button>
              </>
            )}
            {authState === EAuthState.Authorized && (
              <Flex direction='column' gap='md'>
                <Button variant='light' color={accent} onClick={() => navigate(ROUTER_PATH.MENU)}>
                  {t('header.menu')}
                </Button>
                <Button
                  variant='light'
                  color={accent}
                  onClick={() => navigate(ROUTER_PATH.MENU_SETTINGS)}
                >
                  {t('header.settings')}
                </Button>
                <Button
                  variant='light'
                  color={accent}
                  onClick={() => navigate(ROUTER_PATH.MENU_VAULT)}
                >
                  {t('header.vault')}
                </Button>
                <Button
                  variant='light'
                  color='red'
                  onClick={() => {
                    authSignOut(false);
                    sendSuccessNotification(t('auth:signOut:successful'));
                  }}
                >
                  {t('header.exit')}
                </Button>
              </Flex>
            )}
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
