import { TEnvVars } from '../types';
import { TFunction } from 'i18next';
import { customFetch } from './customFetch.ts';
import { sendErrorNotification } from '../shared';
import { ensureAuthorized } from './ensureAuthorized.ts';
import { AuthContextType } from '../stores';

export async function getGoogleDriveState(
  envs: TEnvVars | undefined,
  t: TFunction,
  context: AuthContextType,
): Promise<string | null> {
  const response = await customFetch(`${envs?.API_SERVER_URL}/auth/google`, null, 'GET', t);

  if (!response) {
    return null;
  }

  if (response.ok) {
    return (await response.json()).email;
  }

  if (!(await ensureAuthorized(response, context))) {
    return null;
  }

  switch (response.status) {
    case 404: {
      return null;
    }
    default: {
      sendErrorNotification(t('notifications:failedError'));
      return null;
    }
  }
}

export async function uploadSecretFile(
  content: string,
  hash: string,
  envs: TEnvVars | undefined,
  t: TFunction,
  context: AuthContextType,
): Promise<string | null> {
  const response = await customFetch(
    `${envs?.API_SERVER_URL}/googleDrive/secretFile`,
    JSON.stringify({ content, hash }),
    'POST',
    t,
  );

  if (!response) {
    return null;
  }

  if (response.ok) {
    return await response.text();
  }

  if (!(await ensureAuthorized(response, context))) {
    return null;
  }

  switch (response.status) {
    case 404: {
      sendErrorNotification(t('notifications:userNotFound'));
      return null;
    }
    case 409: {
      throw new Error(await response.text());
    }
    default: {
      sendErrorNotification(t('notifications:failedError'));
      return null;
    }
  }
}
