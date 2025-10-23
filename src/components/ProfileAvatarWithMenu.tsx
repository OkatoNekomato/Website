import { FC, forwardRef } from 'react';
import {
  Avatar,
  Button,
  Group,
  Menu,
  Modal,
  rem,
  UnstyledButton,
  Text,
  Divider,
} from '@mantine/core';
import { ROUTER_PATH, sendNotification, sendSuccessNotification } from '../shared';
import { useNavigate } from 'react-router-dom';
import { MdOutlineSettings } from 'react-icons/md';
import { TiCloudStorage } from 'react-icons/ti';
import { ImExit } from 'react-icons/im';
import { BsPersonCircle } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import { selectAuth, useAppSelector, useAuth, useGoogleDrive, useSecrets } from '../stores';
import { useDisclosure } from '@mantine/hooks';

// eslint-disable-next-line react/display-name
const ProfileButton = forwardRef<HTMLButtonElement>(({ ...others }, ref) => {
  return (
    <UnstyledButton ref={ref} {...others}>
      <Avatar
        variant='transparent'
        radius='xl'
        size='lg'
        color='rgba(59,130,246,1)'
        style={{
          backgroundColor: 'transparent',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
      />
    </UnstyledButton>
  );
});

const elementsData = [
  {
    id: 'menu',
    title: 'header.menu',
    link: ROUTER_PATH.MENU,
    icon: <BsPersonCircle style={{ width: rem(20), height: rem(20) }} />,
  },
  {
    id: 'settings',
    title: 'header.settings',
    link: ROUTER_PATH.MENU_SETTINGS,
    icon: <MdOutlineSettings style={{ width: rem(20), height: rem(20) }} />,
  },
  {
    id: 'vault',
    title: 'header.vault',
    link: ROUTER_PATH.MENU_VAULT,
    icon: <TiCloudStorage style={{ width: rem(20), height: rem(20) }} />,
  },
];

export const ProfileAvatarWithMenu: FC = () => {
  const [exitModalState, { open: openExitModal, close: closeExitModal }] = useDisclosure(false);
  const navigate = useNavigate();
  const { t } = useTranslation('root');
  const { authUsername } = useAppSelector(selectAuth);
  const { authSignOut } = useAuth();
  const { setSecrets, setSelectedSecret, setSelectedFolder } = useSecrets();
  const { doesGoogleDriveConnected } = useGoogleDrive();

  const elements = elementsData.map((element) => (
    <Menu.Item
      key={element.id}
      leftSection={element.icon}
      onClick={() => {
        if (element.id === 'menu' && !doesGoogleDriveConnected()) {
          navigate(ROUTER_PATH.MENU_VAULT);
          sendNotification(t('notifications:needConnectVault'));
          return;
        }
        if (element.link) navigate(element.link);
      }}
      style={{
        fontSize: '0.95rem',
        color: '#e5e7eb',
        transition: 'background-color 0.15s ease',
      }}
    >
      {t(element.title)}
    </Menu.Item>
  ));

  return (
    <Menu
      withArrow
      trigger='click-hover'
      position='bottom-end'
      transitionProps={{ transition: 'pop', duration: 100 }}
      shadow='md'
      radius='md'
    >
      <Modal
        centered
        opened={exitModalState}
        onClose={closeExitModal}
        size='auto'
        title={t('modals.logout.title')}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        styles={{
          header: { borderBottom: '1px solid #1f2937' },
          title: { fontWeight: 600, color: '#f3f4f6' },
          content: { backgroundColor: '#18181b', color: '#e5e7eb' },
        }}
      >
        <Group mt='lg' justify='end'>
          <Button
            variant='default'
            color='gray'
            onClick={closeExitModal}
            styles={{
              root: {
                backgroundColor: '#1e293b',
                color: '#f1f5f9',
                border: 'none',
                '&:hover': { backgroundColor: '#334155' },
              },
            }}
          >
            {t('modals.logout.buttons.cancel')}
          </Button>
          <Button
            variant='filled'
            color='red'
            onClick={async () => {
              await authSignOut(false);
              setSecrets(null);
              setSelectedSecret(null);
              setSelectedFolder(null);
              sendSuccessNotification(t('auth:signOut:successful'));
            }}
            styles={{
              root: {
                backgroundColor: '#ef4444',
                '&:hover': { backgroundColor: '#dc2626' },
              },
            }}
          >
            {t('modals.logout.buttons.submit')}
          </Button>
        </Group>
      </Modal>

      <Menu.Target>
        <ProfileButton />
      </Menu.Target>

      <Menu.Dropdown
        style={{
          backgroundColor: '#18181b',
          border: '1px solid #2a2a2e',
          minWidth: rem(200),
        }}
      >
        <Menu.Label>
          <Text fw={600} size='sm' color='#93c5fd'>
            {authUsername}
          </Text>
        </Menu.Label>
        {elements}
        <Divider color='rgba(255,255,255,0.1)' my='sm' />
        <Menu.Item
          color='red'
          leftSection={<ImExit style={{ width: rem(18), height: rem(18) }} />}
          onClick={openExitModal}
          style={{ fontWeight: 500 }}
        >
          {t('header.exit')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
