import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store.ts';

type TGoogleDriveStore = {
  googleDriveState: boolean;
  googleDriveEmail: string;
  googleDriveStateFetched: boolean;
};

const initialState: TGoogleDriveStore = {
  googleDriveState: false,
  googleDriveEmail: '',
  googleDriveStateFetched: false,
};

const googleDriveSlice = createSlice({
  name: 'googleDrive',
  initialState,
  reducers: {
    setGoogleDriveState: (state, action: PayloadAction<boolean>) => {
      state.googleDriveState = action.payload;
    },
    setGoogleDriveEmail: (state, action: PayloadAction<string>) => {
      state.googleDriveEmail = action.payload;
    },
    setGoogleDriveStateFetched: (state, action: PayloadAction<boolean>) => {
      state.googleDriveStateFetched = action.payload;
    },
  },
});

export const { setGoogleDriveState, setGoogleDriveEmail, setGoogleDriveStateFetched } =
  googleDriveSlice.actions;

export const googleDriveReducer = googleDriveSlice.reducer;

export const selectGoogleDrive = (state: RootState): TGoogleDriveStore => state.googleDrive;
