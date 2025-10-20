import { FC, forwardRef } from 'react';
import { Avatar, Button, Group, Menu, Modal, rem, UnstyledButton, Text } from '@mantine/core';
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
        variant="filled"
        radius="xl"
        size="48"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.15) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#60a5fa',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
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
    icon: (
      <BsPersonCircle
        style={{
          width: rem(18),
          height: rem(18),
        }}
      />
    ),
  },
  {
    id: 'settings',
    title: 'header.settings',
    link: ROUTER_PATH.MENU_SETTINGS,
    icon: (
      <MdOutlineSettings
        style={{
          width: rem(18),
          height: rem(18),
        }}
      />
    ),
  },
  {
    id: 'vault',
    title: 'header.vault',
    link: ROUTER_PATH.MENU_VAULT,
    icon: (
      <TiCloudStorage
        style={{
          width: rem(18),
          height: rem(18),
        }}
      />
    ),
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
      key={element.title}
      leftSection={element.icon}
      onClick={() => {
        if (element.id === 'menu') {
          if (!doesGoogleDriveConnected()) {
            navigate(ROUTER_PATH.MENU_VAULT);
            sendNotification(t('notifications:needConnectVault'));
            return;
          }
        }
        if (element.link) {
          navigate(element.link);
        }
      }}
      style={{
        borderRadius: '8px',
        padding: '10px 12px',
        transition: 'all 0.2s ease',
      }}
      styles={{
        item: {
          color: '#e4e4e7',
          '&:hover': {
            background: 'rgba(59, 130, 246, 0.1)',
          },
        },
        itemLabel: {
          fontSize: '14px',
        },
      }}
    >
      {t(element.title)}
    </Menu.Item>
  ));

  return (
    <Menu
      withArrow
      trigger="click-hover"
      keepMounted={false}
      withinPortal={false}
      trapFocus={false}
      closeDelay={20}
      defaultOpened={false}
      shadow="xl"
      styles={{
        dropdown: {
          background: 'rgba(24, 24, 27, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(70, 70, 80, 0.4)',
          padding: '8px',
        },
        arrow: {
          background: 'rgba(24, 24, 27, 0.95)',
          border: '1px solid rgba(70, 70, 80, 0.4)',
        },
        divider: {
          borderColor: 'rgba(70, 70, 80, 0.3)',
        },
      }}
    >
      <Modal
        centered={true}
        opened={exitModalState}
        onClose={closeExitModal}
        size="md"
        title={
          <Text size="lg" fw={600} c="gray.0">
            {t('modals.logout.title')}
          </Text>
        }
        closeOnClickOutside={true}
        closeOnEscape={true}
        withCloseButton={true}
        overlayProps={{
          backgroundOpacity: 0.7,
          blur: 8,
        }}
        styles={{
          content: {
            background: 'rgba(24, 24, 27, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(70, 70, 80, 0.4)',
          },
          header: {
            background: 'transparent',
          },
        }}
      >
        <Group mt="xl" justify="end">
          <Button
            variant="subtle"
            color="gray"
            radius="md"
            onClick={() => {
              closeExitModal();
            }}
          >
            {t('modals.logout.buttons.cancel')}
          </Button>
          <Button
            variant="light"
            color="red"
            radius="md"
            onClick={async () => {
              await authSignOut(false);
              setSecrets(null);
              setSelectedSecret(null);
              setSelectedFolder(null);
              sendSuccessNotification(t('auth:signOut:successful'));
            }}
          >
            {t('modals.logout.buttons.submit')}
          </Button>
        </Group>
      </Modal>
      <Menu.Target>
        <ProfileButton />
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label
          style={{
            color: '#a1a1aa',
            fontSize: '12px',
            fontWeight: 600,
            padding: '8px 12px 4px',
          }}
        >
          {authUsername}
        </Menu.Label>
        {elements}
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={
            <ImExit
              style={{
                width: rem(18),
                height: rem(18),
              }}
            />
          }
          onClick={() => {
            openExitModal();
          }}
          style={{
            borderRadius: '8px',
            padding: '10px 12px',
            transition: 'all 0.2s ease',
          }}
          styles={{
            item: {
              '&:hover': {
                background: 'rgba(239, 68, 68, 0.1)',
              },
            },
            itemLabel: {
              fontSize: '14px',
            },
          }}
        >
          {t('header.exit')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};