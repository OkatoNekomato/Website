import { TSecretFile } from '../types';
import { getProperty } from '../shared';

export function foldersMigration(secretFile: TSecretFile): TSecretFile {
  for (const secret of secretFile.secrets) {
    if (secret.folders) {
      continue;
    }

    secret.folders = getProperty([]);
  }

  return secretFile;
}
