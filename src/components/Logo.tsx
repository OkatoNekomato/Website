import { Image } from '@mantine/core';

interface LogoProps {
  size?: number | string;
  mb?: string | number;
}

export default function Logo({ size = 100, mb = '1.5rem' }: LogoProps) {
  return (
    <Image
      src='/logo.svg'
      alt='Immortal Vault'
      draggable={false}
      style={{
        display: 'block',
        marginInline: 'auto',
        marginBottom: mb,
        width: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        objectFit: 'contain',
        userSelect: 'none',
        filter: 'drop-shadow(0 0 6px rgba(160, 160, 255, 0.25))',
        transition: 'transform 0.2s ease',
      }}
    />
  );
}
