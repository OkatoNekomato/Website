import { TSecretFile } from '../types';
import { SECRET_FILE_VERSION } from '../shared';
import { foldersMigration } from './folders-migration.ts';
import { mfaMigration } from './mfa-migration.ts';
import { propertyTimeMigration } from './property-time-migration.ts';
import { websiteArrayMigration } from './website-array-migration.ts';

export function applyMigrations(secretFile: TSecretFile): TSecretFile {
  const oldVersion = secretFile.version;

  if (oldVersion === SECRET_FILE_VERSION) {
    return secretFile;
  }

  if (secretFile.version === '0.0.1') {
    secretFile = foldersMigration(secretFile);
    secretFile.version = '0.0.2';
  }

  if (secretFile.version === '0.0.2') {
    secretFile = mfaMigration(secretFile);
    secretFile.version = '0.0.3';
  }

  if (secretFile.version === '0.0.3') {
    secretFile = propertyTimeMigration(secretFile);
    secretFile.version = '0.0.4';
  }

  if (secretFile.version === '0.0.4') {
    secretFile = websiteArrayMigration(secretFile);
    secretFile.version = '0.0.5';
  }

  return secretFile;
}
