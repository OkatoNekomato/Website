import { TSecretFile } from '../types';
import { getCurrentSecretTimeProperty } from '../shared';

export function mfaMigration(secretFile: TSecretFile): TSecretFile {
  for (const secret of secretFile.secrets) {
    if (secret.mfa?.value) {
      continue;
    }

    secret.mfa = { value: '', ...getCurrentSecretTimeProperty() };
  }

  return secretFile;
}
