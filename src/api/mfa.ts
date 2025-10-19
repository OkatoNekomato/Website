import { customFetch } from './customFetch';
import { TFunction } from 'i18next';
import { TEnvVars } from '../types';
import { sendErrorNotification, sendSuccessNotification } from '../shared';

export async function setupMfa(envs: TEnvVars | undefined, t: TFunction): Promise<string | null> {
  const response = await customFetch(`${envs?.API_SERVER_URL}/mfa/setup`, null, 'POST', t);

  if (!response) {
    return null;
  }

  if (response.ok) {
    const data = await response.json();
    return data.mfa;
  }

  switch (response.status) {
    case 400: {
      sendErrorNotification(t('notifications:setupMfaFailed'));
      return null;
    }
    default: {
      sendErrorNotification(t('notifications:failedError'));
      return null;
    }
  }
}

export async function enableMfa(
  totpCode: string,
  envs: TEnvVars | undefined,
  t: TFunction,
): Promise<string[] | null> {
  const response = await customFetch(
    `${envs?.API_SERVER_URL}/mfa/enable`,
    JSON.stringify({ totpCode }),
    'POST',
    t,
  );

  if (!response) {
    return null;
  }

  if (response.ok) {
    const data = await response.json();
    sendSuccessNotification(t('notifications:enableMfaSuccess'));
    return data.recoveryCodes;
  }

  switch (response.status) {
    case 400: {
      sendErrorNotification(t('notifications:invalidTotpCode'));
      return null;
    }
    case 404: {
      sendErrorNotification(t('notifications:mfaSetupNotFound'));
      return null;
    }
    default: {
      sendErrorNotification(t('notifications:failedError'));
      return null;
    }
  }
}

export async function disableMfa(
  totpCode: string,
  envs: TEnvVars | undefined,
  t: TFunction,
): Promise<boolean> {
  const response = await customFetch(
    `${envs?.API_SERVER_URL}/mfa/disable`,
    JSON.stringify({ totpCode }),
    'POST',
    t,
  );

  if (!response) {
    return false;
  }

  if (response.ok) {
    sendSuccessNotification(t('notifications:disableMfaSuccess'));
    return true;
  }

  switch (response.status) {
    case 400: {
      sendErrorNotification(t('notifications:invalidCredentialsOrTotpCode'));
      return false;
    }
    case 403: {
      sendErrorNotification(t('notifications:mfaDisableForbidden'));
      return false;
    }
    default: {
      sendErrorNotification(t('notifications:failedError'));
      return false;
    }
  }
}

export async function validateMfa(
  totpCode: string,
  envs: TEnvVars | undefined,
  t: TFunction,
): Promise<boolean> {
  const response = await customFetch(
    `${envs?.API_SERVER_URL}/mfa/validate`,
    JSON.stringify({ totpCode }),
    'POST',
    t,
  );

  if (!response) {
    return false;
  }

  if (response.ok) {
    sendSuccessNotification(t('notifications:validateMfaSuccess'));
    return true;
  }

  switch (response.status) {
    case 400: {
      sendErrorNotification(t('notifications:invalidTotpCode'));
      return false;
    }
    default: {
      sendErrorNotification(t('notifications:failedError'));
      return false;
    }
  }
}
