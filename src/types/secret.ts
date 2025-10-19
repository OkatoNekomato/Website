import { TSecretProperty } from './secret-property.type.ts';

export type TSecret = {
  id: string;
  folders: TSecretProperty<string[]>;
  label: TSecretProperty;
  username?: TSecretProperty;
  email?: TSecretProperty;
  password?: TSecretProperty;
  website?: TSecretProperty<string[]>;
  phone?: TSecretProperty;
  notes?: TSecretProperty;
  mfa?: TSecretProperty;
  lastUpdated: number;
  created: number;
};
