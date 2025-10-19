import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store.ts';
import { EMfaModalState } from '../MfaContext.tsx';

type TMfaStore = {
  isMfaModalOpen: boolean;
  totpCode: string | null;
  mfaQrCode: string | null;
  recoveryCodes: string[] | null;
  modalState: EMfaModalState;
};

const initialState: TMfaStore = {
  isMfaModalOpen: false,
  totpCode: null,
  mfaQrCode: null,
  recoveryCodes: null,
  modalState: EMfaModalState.NONE,
};

const mfaSlice = createSlice({
  name: 'mfa',
  initialState,
  reducers: {
    setTotpCode: (state, action: PayloadAction<string | null>) => {
      state.totpCode = action.payload;
    },
    setMfaQrCode: (state, action: PayloadAction<string | null>) => {
      state.mfaQrCode = action.payload;
    },
    setRecoveryCodes: (state, action: PayloadAction<string[] | null>) => {
      state.recoveryCodes = action.payload;
    },
    setModalState: (state, action: PayloadAction<EMfaModalState>) => {
      state.modalState = action.payload;
    },
    openMfaModal: (state) => {
      state.isMfaModalOpen = true;
    },
    closeMfaModal: (state) => {
      state.isMfaModalOpen = false;
    },
  },
});

export const {
  setTotpCode,
  setMfaQrCode,
  setRecoveryCodes,
  setModalState,
  openMfaModal,
  closeMfaModal,
} = mfaSlice.actions;

export const selectMfa = (state: RootState): TMfaStore => state.mfa;

export const mfaReducer = mfaSlice.reducer;
