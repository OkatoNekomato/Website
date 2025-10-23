import { Anchor, Container, Group, Text } from '@mantine/core';
import { FaLinkedin, FaTelegramPlane } from 'react-icons/fa';
import { IoLogoGithub } from 'react-icons/io';
import { useTranslation } from 'react-i18next';
import { ROUTER_PATH } from '../../shared';
import { useNavigate } from 'react-router-dom';
import { LanguageSelector } from '../LanguageSelector.tsx';
import classes from './Footer.module.css';

const links = [
  {
    link: 'https://t.me/immortal_vault',
    icon: <FaTelegramPlane size={20} />,
  },
  {
    link: 'https://www.linkedin.com/company/immortal-vault/',
    icon: <FaLinkedin size={20} />,
  },
  {
    link: 'https://github.com/Immortal-Vault',
    icon: <IoLogoGithub size={20} />,
  },
];

export function Footer() {
  const { t } = useTranslation('root');
  const navigate = useNavigate();

  return (
    <footer className={classes.footer}>
      <Container className={classes.inner}>
        <Anchor<'a'>
          underline='never'
          c='dimmed'
          style={{ cursor: 'pointer', userSelect: 'none' }}
          onClick={() => navigate(ROUTER_PATH.PRIVACY_POLICY)}
        >
          <Text size='sm'>{t('footer.privacy')}</Text>
        </Anchor>

        <Group gap='md' justify='center' align='center'>
          {links.map(({ link, icon }) => (
            <Anchor<'a'>
              key={link}
              href={link}
              target='_blank'
              rel='noopener noreferrer'
              c='gray.4'
              style={{
                display: 'flex',
                alignItems: 'center',
                transition: 'color 120ms ease, transform 120ms ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#3b82f6';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = '';
                (e.currentTarget as HTMLElement).style.transform = '';
              }}
            >
              {icon}
            </Anchor>
          ))}
          <LanguageSelector settings={false} />
          <Text size='sm' c='dimmed'>
            {import.meta.env.VITE_WEBSITE_VERSION}
          </Text>
        </Group>
      </Container>
    </footer>
  );
}
