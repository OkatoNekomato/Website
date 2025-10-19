import { sendErrorNotification } from '../shared';
import { TFunction } from 'i18next';

export const customFetch = async (
  url: string,
  body: BodyInit | null | undefined,
  method: string,
  t: TFunction,
): Promise<Response | null> => {
  try {
    const response = await fetch(url, {
      method,
      body,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Client-Version': import.meta.env.VITE_WEBSITE_VERSION,
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
      cache: 'no-store',
    });

    if (response.status === 426) {
      sendErrorNotification(t('notifications:outdatedClient'));
      return null;
    }

    return response;
  } catch (error) {
    sendErrorNotification(t('notifications:serverNotResponding'));
    return null;
  }
};
