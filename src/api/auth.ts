import { customFetch } from './customFetch.ts';
import { TFunction } from 'i18next';
import { EAuthState, TEnvVars } from '../types';
import { sendErrorNotification } from '../shared';
import { ensureAuthorized } from './ensureAuthorized.ts';
import { AuthContextType } from '../stores';

export async function signIn(
  email: string,
  password: string,
  mfaCode: string | null | undefined,
  envs: TEnvVars | undefined,
  t: TFunction,
): Promise<Response | EAuthState | null> {
  const response = await customFetch(
    `${envs?.API_SERVER_URL}/auth/signIn`,
    JSON.stringify({ email: email.toLowerCase(), password, mfaCode }),
    'POST',
    t,
  );

  if (!response) {
    return null;
  }

  if (response.ok) {
    return response;
  }

  switch (response.status) {
    case 400: {
      const error = await response.text();

      if (error === 'MFA') {
        sendErrorNotification(t('notifications:requiredMfa'));
      } else if (error === 'INVALID_MFA') {
        sendErrorNotification(t('notifications:incorrectMfaCode'));
      }

      return EAuthState.MfaRequired;
    }
    case 404: {
      sendErrorNotification(t('notifications:incorrectLoginOrPassword'));
      return null;
    }
    case 409: {
      sendErrorNotification(t('notifications:incorrectLoginOrPassword'));
      return null;
    }
    default: {
      sendErrorNotification(t('notifications:failedError'));
      return null;
    }
  }
}

export async function signUp(
  username: string,
  email: string,
  password: string,
  language: string,
  is12HoursFormat: boolean,
  envs: TEnvVars | undefined,
  t: TFunction,
): Promise<Response | null> {
  const response = await customFetch(
    `${envs?.API_SERVER_URL}/auth/signUp`,
    JSON.stringify({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      language,
      is12HoursFormat,
    }),
    'POST',
    t,
  );

  if (!response) {
    return null;
  }

  if (response.ok) {
    return response;
  }

  switch (response.status) {
    case 303: {
      sendErrorNotification(t('notifications:userAlreadyExists'));
      return null;
    }
    default: {
      sendErrorNotification(t('notifications:failedError'));
      return null;
    }
  }
}

export async function signOut(envs: TEnvVars | undefined, t: TFunction): Promise<Response | null> {
  return customFetch(`${envs?.API_SERVER_URL}/auth/signOut`, null, 'POST', t);
}

export async function signInGoogle(
  code: string,
  envs: TEnvVars | undefined,
  t: TFunction,
  context: AuthContextType,
): Promise<Response | null> {
  const response = await customFetch(
    `${envs?.API_SERVER_URL}/auth/signIn/google`,
    JSON.stringify({ code }),
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
      return null;
    }
  }
}

export async function signOutGoogle(
  keepData: boolean,
  envs: TEnvVars | undefined,
  t: TFunction,
  context: AuthContextType,
): Promise<Response | null> {
  const response = await customFetch(
    `${envs?.API_SERVER_URL}/auth/signOut/google`,
    JSON.stringify({ keepData }),
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
      return null;
    }
  }
}

export async function getChallenge(
  envs: TEnvVars | undefined,
  t: TFunction,
): Promise<Response | null> {
  const response = await customFetch(`${envs?.API_SERVER_URL}/auth/challenge`, null, 'GET', t);

  if (!response) {
    return null;
  }

  if (response.ok) {
    return response;
  }

  switch (response.status) {
    case 404: {
      sendErrorNotification(t('notifications:userNotFound'));
      return null;
    }
    default: {
      sendErrorNotification(t('notifications:failedError'));
      return null;
    }
  }
}

export async function resetPassword(
  code: string,
  password: string,
  t: TFunction,
  envs?: TEnvVars,
): Promise<Response | null> {
  const body = JSON.stringify({ code: code.trim(), password });

  try {
    const response = await customFetch(
      `${envs?.API_SERVER_URL}/auth/resetPassword`,
      body,
      'POST',
      t,
    );

    if (!response) {
      return null;
    }

    if (response.ok) return response;

    switch (response.status) {
      case 400:
        sendErrorNotification(t('notifications:invalidCode'));
        break;
      case 401:
        sendErrorNotification(t('notifications:unauthorized'));
        break;
      case 404:
        sendErrorNotification(t('notifications:userNotFound'));
        break;
      case 429:
        sendErrorNotification(t('notifications:tooManyRequests'));
        break;
      default:
        sendErrorNotification(t('notifications:failedError'));
        break;
    }

    return null;
  } catch (err) {
    return null;
  }
}
