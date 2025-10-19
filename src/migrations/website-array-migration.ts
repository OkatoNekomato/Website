import { TSecretFile } from '../types';
import { getProperty } from '../shared';

export function websiteArrayMigration(secretFile: TSecretFile): TSecretFile {
  secretFile.secrets = secretFile.secrets.map((secret) => {
    const rawWebsite = (secret as any).website;
    if (rawWebsite === undefined) {
      return secret;
    }

    if (typeof rawWebsite === 'string') {
      const arr = rawWebsite.trim() !== '' ? [rawWebsite] : [];
      return {
        ...secret,
        website: getProperty<string[]>(arr),
      };
    }

    if (
      typeof rawWebsite === 'object' &&
      rawWebsite.value !== undefined &&
      typeof rawWebsite.value === 'string'
    ) {
      const v: string = (rawWebsite as any).value;
      const arr = v.trim() !== '' ? [v] : [];
      return {
        ...secret,
        website: getProperty<string[]>(arr),
      };
    }

    return secret;
  });

  return secretFile;
}
