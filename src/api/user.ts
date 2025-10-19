import { customFetch } from './customFetch.ts';
import { TFunction } from 'i18next';
import { TEnvVars } from '../types';
import { sendErrorNotification, sendSuccessNotification } from '../shared';
import { AuthContextType } from '../stores';
import { ensureAuthorized } from './ensureAuthorized.ts';

export async function changeLanguage(
  language: string,
  envs: TEnvVars | undefined,
  t: TFunction,
  context: AuthContextType,
): Promise<Response | null> {
  const response = await customFetch(
    `${envs?.API_SERVER_URL}/user/changeLanguage`,
    JSON.stringify({ language }),
    'POST',
    t,
  );

  if (!response) {
    return null;
  }

  if (response.ok) {
    return response;
  }

  if (!(await ensureAuthorized(response, context))) {
    return null;
  }

  switch (response.status) {
    case 404: {
      sendErrorNotification(t('notifications:userNotFound'));
      return null;
    }
    default: {
      sendErrorNotification(t('notifications:failedError'));
      console.error(await response.text());
      return null;
    }
  }
}

export async function changeTimeFormat(
  Is12HoursFormat: boolean,
  envs: TEnvVars | undefined,
  t: TFunction,
  context: AuthContextType,
): Promise<Response | null> {
  const response = await customFetch(
    `${envs?.API_SERVER_URL}/user/changeTimeFormat`,
    JSON.stringify({ Is12HoursFormat }),
    'POST',
    t,
  );

  if (!response) {
    return null;
  }

  if (response.ok) {
    return response;
  }

  if (!(await ensureAuthorized(response, context))) {
    return null;
  }

  switch (response.status) {
    case 404: {
      sendErrorNotification(t('notifications:userNotFound'));
      return null;
    }
    default: {
      sendErrorNotification(t('notifications:failedError'));
      console.error(await response.text());
      return null;
    }
  }
}

export async function changeInactiveMinutes(
  inactiveMinutes: number,
  envs: TEnvVars | undefined,
  t: TFunction,
  context: AuthContextType,
): Promise<Response | null> {
  const response = await customFetch(
    `${envs?.API_SERVER_URL}/user/changeInactiveMinutes`,
    JSON.stringify({ inactiveMinutes }),
    'POST',
    t,
  );

  if (!response) {
    return null;
  }

  if (response.ok) {
    sendSuccessNotification(t('notifications:inactiveValueChanged'));
    return response;
  }

  if (!(await ensureAuthorized(response, context))) {
    return null;
  }

  switch (response.status) {
    case 404: {
      sendErrorNotification(t('notifications:userNotFound'));
      return null;
    }
    case 400: {
      const error = await response.text();

      if (error === 'INACTIVE_MINUTES_INCORRECT') {
        sendErrorNotification(t('notifications:inactiveValueIncorrect'));
      }

      return null;
    }
    default: {
      sendErrorNotification(t('notifications:failedError'));
      console.error(await response.text());
      return null;
    }
  }
}

export async function changePassword(
  oldPassword: string,
  newPassword: string,
  totpCode: string | null,
  envs: TEnvVars | undefined,
  t: TFunction,
  context: AuthContextType,
): Promise<Response | null> {
  const response = await customFetch(
    `${envs?.API_SERVER_URL}/user/changePassword`,
    JSON.stringify({ oldPassword, newPassword, totpCode }),
    'POST',
    t,
  );

  if (!response) {
    return null;
  }

  if (response.ok) {
    sendSuccessNotification(t('notifications:passwordChanged'));
    return response;
  }

  if (!(await ensureAuthorized(response, context))) {
    return null;
  }

  switch (response.status) {
    case 404: {
      sendErrorNotification(t('notifications:userNotFound'));
      return null;
    }
    case 400: {
      const error = await response.text();

      if (error === 'MFA') {
        sendErrorNotification(t('notifications:requiredMfa'));
      } else if (error === 'INVALID_MFA') {
        sendErrorNotification(t('notifications:incorrectMfaCode'));
      } else if (error === 'INVALID_PASSWORD') {
        sendErrorNotification(t('passwordsDoNotMatch'));
      } else if (error === 'SAME_PASSWORD') {
        sendErrorNotification(t('passwordsAreSame'));
      }

      return null;
    }
    default: {
      sendErrorNotification(t('notifications:failedError'));
      console.error(await response.text());
      return null;
    }
  }
}
