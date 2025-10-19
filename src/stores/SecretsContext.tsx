import { createContext, ReactNode, useContext, useEffect, useMemo, useRef } from 'react';
import { TFolder, TSecret, TSecretFile } from '../types';
import { useGoogleDrive } from './GoogleDriveContext.tsx';
import { Id, toast } from 'react-toastify';
import { customFetch, uploadSecretFile } from '../api';
import { decrypt, encrypt, mergeData, SECRET_FILE_VERSION } from '../shared';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext.tsx';
import { applyMigrations } from '../migrations';
import { useAppDispatch, useAppSelector } from './hooks.ts';
import {
  selectAuth,
  selectEnvVars,
  selectSecrets,
  setFileHash,
  setFilteredSecrets,
  setFolders,
  setSecretPassword,
  setSecrets,
  setSelectedFolder,
  setSelectedSecret,
} from './index.ts';

export interface SecretsContextType {
  filteredSecrets: TSecret[] | null;
  selectedSecret: TSecret | null;
  selectedFolder: TFolder | null;
  fileHash: string;
  fetchSecrets: (masterPassword: string) => Promise<void>;
  deleteSecret: (secret: TSecret) => Promise<void>;
  setSecrets: (secrets: TSecret[] | null) => void;
  setFilteredSecrets: (secrets: TSecret[] | null) => void;
  setFileHash: (hash: string) => void;
  setFolders: (folders: TFolder[]) => void;
  setSelectedFolder: (folder: TFolder | null) => void;
  setSelectedSecret: (secret: TSecret | null) => void;
}

const SecretsContext = createContext<SecretsContextType>(null!);

interface SecretsProps {
  children: ReactNode;
}

export const SecretsProvider = ({ children }: SecretsProps) => {
  const dispatch = useAppDispatch();
  const { secrets, filteredSecrets, selectedSecret, folders, selectedFolder, fileHash } =
    useAppSelector(selectSecrets);
  const { envs } = useAppSelector(selectEnvVars);
  const auth = useAppSelector(selectAuth);
  const { authState, authEmail, secretPassword, isMfaEnabled } = useAppSelector(selectAuth);
  const { googleDriveState } = useGoogleDrive();
  const { t } = useTranslation('secrets');
  const authContext = useAuth();

  const setSecretsDispatch = (secrets: TSecret[] | null) => dispatch(setSecrets(secrets));
  const setFilteredSecretsDispatch = (secrets: TSecret[] | null) =>
    dispatch(setFilteredSecrets(secrets));
  const setFileHashDispatch = (hash: string) => dispatch(setFileHash(hash));
  const setFoldersDispatch = (folders: TFolder[]) => dispatch(setFolders(folders));
  const setSelectedFolderDispatch = (folder: TFolder | null) => dispatch(setSelectedFolder(folder));
  const setSelectedSecretDispatch = (secret: TSecret | null) => dispatch(setSelectedSecret(secret));
  const prevSecretsRef = useRef(secrets);
  const prevFoldersRef = useRef(folders);

  useEffect(() => {
    if (!prevSecretsRef.current) {
      prevSecretsRef.current = secrets;
      prevFoldersRef.current = folders;
      return;
    }

    if (
      (secrets && secrets !== prevSecretsRef.current) ||
      prevFoldersRef.current.length !== folders.length
    ) {
      saveSecrets();
      prevSecretsRef.current = secrets;
      prevFoldersRef.current = folders;
    }
  }, [secrets, folders]);

  const saveSecrets = async (withNotifications = true, secretFileHash?: string): Promise<void> => {
    if (!secrets) {
      throw new Error('No secret file found.');
    }

    let notificationId: Id = '';
    if (withNotifications) {
      notificationId = toast.loading(t('data.updating'));
    }

    const secretFile: TSecretFile = {
      version: SECRET_FILE_VERSION,
      folders,
      secrets,
    };

    try {
      const hash = await uploadSecretFile(
        await encrypt(JSON.stringify(secretFile), auth.secretPassword),
        secretFileHash ? secretFileHash : fileHash,
        envs,
        t,
        authContext,
      );

      if (!hash) {
        if (withNotifications) {
          toast.error(t('data.failed'));
          toast.dismiss(notificationId);
        }
        return;
      }

      setFileHashDispatch(hash);

      toast.success(t('data.updated'));
      toast.dismiss(notificationId);
    } catch (error) {
      toast.dismiss(notificationId);

      const response = await customFetch(
        `${envs?.API_SERVER_URL}/googleDrive/secretFile`,
        null,
        'GET',
        t,
      );

      const secretFileResponse = await response?.json();
      if (!secretFileResponse) {
        if (withNotifications) {
          toast.error(t('data.fetch.failed'));
          toast.dismiss(notificationId);
        }
        return;
      }

      setFileHashDispatch(secretFileResponse.hash);
      const decryptedSecretFile = await decrypt(secretFileResponse.content, auth.secretPassword);
      const secretFileInfo = JSON.parse(decryptedSecretFile) as TSecretFile;
      const migratedSecretFile = applyMigrations(secretFileInfo);

      const mergedData = mergeData(secretFile, migratedSecretFile);
      setSecretsDispatch(mergedData.secrets);
      setFoldersDispatch(mergedData.folders);
      await saveSecrets(false, secretFileResponse.hash);
    }
  };

  const deleteSecret = async (secret: TSecret) => {
    if (!secrets) return;

    const newSecrets = secrets.filter((s) => s.id !== secret.id);
    setSecretsDispatch(newSecrets);
    setFilteredSecretsDispatch(newSecrets);
  };

  useEffect(() => {
    setFoldersDispatch([]);
  }, [googleDriveState]);

  const fetchSecrets = async (masterPassword: string) => {
    authContext.setIsFetchInProgress(true);
    const notificationId = toast.loading(t('data.fetch.inProgress'));
    try {
      const response = await customFetch(
        `${envs?.API_SERVER_URL}/googleDrive/secretFile`,
        null,
        'GET',
        t,
      );

      if (!response || !response.ok) {
        toast.error(t('data.fetch.failed'));
        toast.dismiss(notificationId);
        return;
      }

      const secretFileResponse = await response.json();
      setFileHashDispatch(secretFileResponse.hash);

      const decryptedSecretFile = await decrypt(secretFileResponse.content, masterPassword);
      const secretFileInfo = JSON.parse(decryptedSecretFile) as TSecretFile;
      const migratedSecretFile = applyMigrations(secretFileInfo);
      dispatch(setSecretPassword(masterPassword));

      setSecretsDispatch(migratedSecretFile.secrets ?? null);
      setFilteredSecretsDispatch(migratedSecretFile.secrets ?? null);
      setFoldersDispatch(migratedSecretFile.folders ?? []);
      authContext.closeSecretPasswordModal();
    } catch (e) {
      console.error(e);
      toast.error(t('incorrectMasterPassword'));
    } finally {
      toast.dismiss(notificationId);
      authContext.setIsFetchInProgress(false);
    }
  };

  const contextValue = useMemo(
    () => ({
      filteredSecrets,
      selectedSecret,
      selectedFolder,
      fileHash,
      secretPassword,
      isMfaEnabled,
      auth,
      fetchSecrets,
      saveSecrets: saveSecrets,
      deleteSecret,
      setSecrets: setSecretsDispatch,
      setFilteredSecrets: setFilteredSecretsDispatch,
      setFileHash: setFileHashDispatch,
      setFolders: setFoldersDispatch,
      setSelectedFolder: setSelectedFolderDispatch,
      setSelectedSecret: setSelectedSecretDispatch,
    }),
    [
      secrets,
      folders,
      filteredSecrets,
      selectedSecret,
      selectedFolder,
      fileHash,
      authState,
      authEmail,
      secretPassword,
      isMfaEnabled,
    ],
  );

  return <SecretsContext.Provider value={contextValue}>{children}</SecretsContext.Provider>;
};

export const useSecrets = () => {
  const context = useContext(SecretsContext);
  if (context === undefined) {
    throw new Error('useSecrets must be used within a SecretsProvider');
  }
  return context;
};
