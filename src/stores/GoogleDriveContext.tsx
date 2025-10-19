import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { getGoogleDriveState } from '../api';
import { useAppDispatch, useAppSelector } from './hooks.ts';
import {
  selectEnvVars,
  selectGoogleDrive,
  setGoogleDriveEmail,
  setGoogleDriveState,
  setGoogleDriveStateFetched,
} from './slices';
import { useAuth } from './AuthContext.tsx';

export interface GoogleDriveContextType {
  googleDriveState: boolean;
  googleDriveStateFetched: boolean;
  googleDriveEmail: string;
  doesGoogleDriveConnected: () => boolean;
  fetchGoogleDriveState: () => void;
}

const GoogleDriveContext = createContext<GoogleDriveContextType>(null!);

interface GoogleDriveProviderProps {
  children: ReactNode;
}

export const GoogleDriveProvider = ({ children }: GoogleDriveProviderProps) => {
  const { t } = useTranslation();
  const { envs } = useAppSelector(selectEnvVars);
  const authContext = useAuth();
  const googleDrive = useAppSelector(selectGoogleDrive);
  const dispatch = useAppDispatch();

  const fetchGoogleDriveState = async () => {
    const email = await getGoogleDriveState(envs, t, authContext);
    if (!email) {
      dispatch(setGoogleDriveState(false));
      dispatch(setGoogleDriveStateFetched(true));
      return;
    }
    dispatch(setGoogleDriveState(true));
    dispatch(setGoogleDriveEmail(email));
    dispatch(setGoogleDriveStateFetched(true));
  };

  const doesGoogleDriveConnected = (): boolean =>
    googleDrive.googleDriveState && googleDrive?.googleDriveStateFetched;

  const contextValue = useMemo(
    () => ({
      envs,
      googleDriveState: googleDrive.googleDriveState,
      googleDriveStateFetched: googleDrive?.googleDriveStateFetched,
      googleDriveEmail: googleDrive.googleDriveEmail,
      doesGoogleDriveConnected,
      fetchGoogleDriveState,
    }),
    [
      envs,
      googleDrive?.googleDriveState,
      googleDrive?.googleDriveStateFetched,
      googleDrive?.googleDriveEmail,
    ],
  );

  return (
    <GoogleDriveContext.Provider value={contextValue}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        {children}
      </GoogleOAuthProvider>
    </GoogleDriveContext.Provider>
  );
};

export const useGoogleDrive = () => {
  return useContext(GoogleDriveContext);
};
