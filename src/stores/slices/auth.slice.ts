import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EAuthState } from '../../types';
import { RootState } from '../store.ts';

type TAuthStore = {
  authState: EAuthState;
  isMfaEnabled: boolean;
  authEmail: string;
  authUsername: string;
  secretPassword: string;
  secretPasswordModalState: boolean;
  is12HoursFormat: boolean;
  inactiveMinutes: number;
};

const initialState: TAuthStore = {
  authState: EAuthState.Unknown,
  isMfaEnabled: false,
  authEmail: '',
  authUsername: '',
  secretPassword: '',
  secretPasswordModalState: false,
  is12HoursFormat: false,
  inactiveMinutes: 10,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthState: (state, action: PayloadAction<EAuthState>) => {
      state.authState = action.payload;
    },
    setMfaEnabled: (state, action: PayloadAction<boolean>) => {
      state.isMfaEnabled = action.payload;
    },
    setAuthEmail: (state, action: PayloadAction<string>) => {
      state.authEmail = action.payload;
    },
    setAuthUsername: (state, action: PayloadAction<string>) => {
      state.authUsername = action.payload;
    },
    setSecretPassword: (state, action: PayloadAction<string>) => {
      state.secretPassword = action.payload;
    },
    openSecretPasswordModal: (state) => {
      state.secretPasswordModalState = true;
    },
    closeSecretPasswordModal: (state) => {
      state.secretPasswordModalState = false;
    },
    setIs12HoursFormat: (state, action: PayloadAction<boolean>) => {
      state.is12HoursFormat = action.payload;
    },
    setInactiveMinutes: (state, action: PayloadAction<number>) => {
      if (action.payload < 0 || action.payload > 9999) {
        return;
      }

      state.inactiveMinutes = action.payload;
    },
  },
});

export const {
  setAuthState,
  setMfaEnabled,
  setAuthEmail,
  setAuthUsername,
  setSecretPassword,
  openSecretPasswordModal,
  closeSecretPasswordModal,
  setIs12HoursFormat,
  setInactiveMinutes,
} = authSlice.actions;

export const selectAuth = (state: RootState): TAuthStore => state.auth;

export const authReducer = authSlice.reducer;
