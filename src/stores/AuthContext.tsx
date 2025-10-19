import {
  createContext,
  Dispatch,
  FormEvent,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useInterval } from '@mantine/hooks';
import { Button, Group, Modal } from '@mantine/core';
import { PasswordInputWithCapsLock } from '../components';
import { EAuthState } from '../types';
import { getChallenge, signOut } from '../api';
import { decrypt, LOCAL_STORAGE, sendNotification } from '../shared';
import { useAppDispatch, useAppSelector } from './hooks.ts';
import {
  closeSecretPasswordModal,
  openSecretPasswordModal,
  selectAuth,
  selectEnvVars,
  setAuthEmail,
  setAuthState,
  setAuthUsername,
  setGoogleDriveStateFetched,
  setInactiveMinutes,
  setIs12HoursFormat,
  setMfaEnabled,
  setSecretPassword,
} from './slices';
import { client } from '@passwordless-id/webauthn';

export interface AuthContextType {
  isFetchInProgress: boolean;
  hasPassKey: boolean;
  modalSubmitCallback: ((masterPassword: string) => void) | null;
  modalCloseCallback: (() => void) | null;
  openSecretPasswordModal: (
    submitCallback?: (masterPassword: string) => void,
    closeCallback?: () => void,
  ) => void;
  closeSecretPasswordModal: () => void;
  authSignIn: (
    email: string,
    username: string,
    localization: string,
    is12HoursFormat: boolean,
    inactiveMinutes: number,
  ) => void;
  setIsFetchInProgress: Dispatch<SetStateAction<boolean>>;
  setHasPassKey: Dispatch<SetStateAction<boolean>>;
  authSignOut: (expired: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { envs, loading } = useAppSelector(selectEnvVars);
  const { authState, authEmail, secretPasswordModalState, secretPassword, isMfaEnabled } =
    useAppSelector(selectAuth);

  const [passwordInput, setPasswordInput] = useState('');
  const [modalCloseCallback, setModalClose] = useState<(() => void) | null>(null);
  const [isFetchInProgress, setIsFetchInProgress] = useState<boolean>(false);
  const [modalSubmitCallback, setModalSubmit] = useState<((masterPassword: string) => void) | null>(
    null,
  );
  const [hasPassKey, setHasPassKey] = useState(!!localStorage.getItem(LOCAL_STORAGE.PASSKEY));
  const authPingInterval = useInterval(() => authPing(), 60000);

  useEffect(() => {
    if (!envs || loading) {
      return;
    }

    authPing();
  }, [envs, loading]);

  useEffect(() => {
    if (!authEmail) {
      return;
    }

    i18n.changeLanguage(i18n.language ?? 'en');
  }, [authEmail]);

  const authSignIn = (
    email: string,
    username: string,
    localization: string,
    is12HoursFormat: boolean,
    inactiveMinutes: number,
  ): void => {
    dispatch(setAuthState(EAuthState.Authorized));
    dispatch(setAuthEmail(email));
    dispatch(setAuthUsername(username));
    dispatch(setIs12HoursFormat(is12HoursFormat));
    dispatch(setInactiveMinutes(inactiveMinutes));
    i18n.changeLanguage(localization);
    dispatch(setGoogleDriveStateFetched(false));
  };

  const authSignOut = async (expired: boolean): Promise<void> => {
    await signOut(envs, t);
    dispatch(setAuthState(EAuthState.Deauthorized));
    dispatch(setAuthEmail(''));
    dispatch(setAuthUsername(''));
    dispatch(setSecretPassword(''));
    dispatch(setIs12HoursFormat(false));

    if (expired) {
      sendNotification(t('notifications:sessionExpired'));
    }
  };

  const authPing = () => {
    if (!localStorage.getItem(LOCAL_STORAGE.LAST_EMAIL)) {
      dispatch(setAuthState(EAuthState.Deauthorized));
      return;
    }

    if (isFetchInProgress) {
      return;
    }

    setIsFetchInProgress(true);
    fetch(`${envs?.API_SERVER_URL}/auth/ping`, {
      headers: {
        'Content-Type': 'application/json',
        'Client-Version': import.meta.env.VITE_WEBSITE_VERSION,
      },
      credentials: 'include',
      method: 'GET',
    })
      .then(async (response) => {
        if (!response || !response.ok) {
          if (authState === EAuthState.Authorized) authSignOut(true);
          else dispatch(setAuthState(EAuthState.Deauthorized));
          return;
        }
        const user = await response.json();
        dispatch(setAuthState(EAuthState.Authorized));
        dispatch(setAuthEmail(user.email));
        dispatch(setAuthUsername(user.name));
        dispatch(setInactiveMinutes(user.userSettings?.inactiveMinutes ?? 10));
        dispatch(setIs12HoursFormat(user.userSettings?.is12HoursFormat ?? false));
        dispatch(setMfaEnabled(user.mfaEnabled));
        i18n.changeLanguage(user.userSettings.language);
        setIsFetchInProgress(false);
      })
      .catch(() => {
        authSignOut(true);
      })
      .finally(() => setIsFetchInProgress(false));
  };

  useEffect(() => {
    if (authState !== EAuthState.Authorized) authPingInterval.stop();
    else authPingInterval.start();
    return authPingInterval.stop;
  }, [authState]);

  const openSecretPasswordModalWithCallback = (
    submitCallback?: (masterPassword: string) => void,
    closeCallback?: () => void,
  ) => {
    dispatch(openSecretPasswordModal());
    setModalSubmit(() => submitCallback ?? null);
    setModalClose(() => closeCallback ?? null);
  };

  const contextValue = useMemo(
    () => ({
      isFetchInProgress,
      secretPassword,
      isMfaEnabled,
      authState,
      authEmail,
      modalSubmitCallback,
      modalCloseCallback,
      secretPasswordModalState,
      hasPassKey,
      setHasPassKey,
      setIsFetchInProgress,
      openSecretPasswordModal: openSecretPasswordModalWithCallback,
      closeSecretPasswordModal: () => dispatch(closeSecretPasswordModal()),
      authSignIn,
      authSignOut,
    }),
    [
      hasPassKey,
      modalSubmitCallback,
      modalCloseCallback,
      authState,
      secretPasswordModalState,
      authEmail,
      secretPassword,
      isMfaEnabled,
    ],
  );

  const auth = (event: FormEvent) => {
    event.preventDefault();
    if (!secretPasswordModalState) {
      return;
    }
    dispatch(setSecretPassword(passwordInput));
    modalSubmitCallback?.(passwordInput);
  };

  const onPassKey = async (event: FormEvent) => {
    event.preventDefault();
    const response = await getChallenge(envs, t);
    if (!response) {
      return;
    }

    const challenge = (await response.json()).challenge as string;

    try {
      const authentication = await client.authenticate({
        challenge,
        userVerification: 'required',
        domain: window.location.hostname,
      });

      const localPassKey = localStorage.getItem(LOCAL_STORAGE.PASSKEY);
      if (!authentication || !localPassKey) {
        return;
      }

      const authenticatorData = authentication.rawId;
      const decryptedSecretPassword = await decrypt(localPassKey, authenticatorData);
      dispatch(setSecretPassword(decryptedSecretPassword));
      modalSubmitCallback?.(decryptedSecretPassword);
    } catch (error) {
      console.error('WebAuthn error: ', error);
    }
  };

  return (
    <>
      <Modal
        centered
        opened={secretPasswordModalState}
        onClose={() => dispatch(closeSecretPasswordModal())}
        size='auto'
        title={t('vault:modals.masterPassword.title')}
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <form onSubmit={auth}>
          <PasswordInputWithCapsLock
            disabled={isFetchInProgress}
            isModal
            onChange={(e) => setPasswordInput(e.target.value)}
          />

          <Group mt='xl' justify='end'>
            <Button
              onClick={() => {
                modalCloseCallback?.();
                dispatch(closeSecretPasswordModal());
              }}
            >
              {t('vault:modals.masterPassword.buttons.cancel')}
            </Button>
            <Button type='submit'>{t('vault:modals.masterPassword.buttons.submit')}</Button>
            {hasPassKey && (
              <Button onClick={onPassKey}>
                {t('vault:modals.masterPassword.buttons.passKey')}
              </Button>
            )}
          </Group>
        </form>
      </Modal>
      <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
    </>
  );
};

export const useAuth = () => useContext(AuthContext);
