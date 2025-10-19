import { TSecretFile } from '../types';
import { getProperty, mapValuesToSecretProperties } from '../shared';

export function propertyTimeMigration(secretFile: TSecretFile): TSecretFile {
  for (const folder of secretFile.folders) {
    if (folder && folder.created) continue;
    folder.created = Date.now();
  }

  secretFile.secrets = secretFile.secrets.map((secret) => {
    const {
      label = '',
      username = '',
      email = '',
      password = '',
      website = '',
      phone = '',
      notes = '',
      mfa = '',
    } = secret as any;

    const mappedProperties = mapValuesToSecretProperties({
      label,
      username,
      email,
      password,
      phone,
      notes,
      mfa,
    });

    const websiteArray: string[] =
      typeof website === 'string' ? [website] : Array.isArray(website) ? website : [];

    return {
      ...secret,
      ...mappedProperties,
      website: getProperty<string[]>(websiteArray),
    };
  });

  return secretFile;
}
