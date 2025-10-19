import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TFolder, TSecret } from '../../types';
import { RootState } from '../store.ts';

type TSecretsStore = {
  secrets: TSecret[] | null;
  filteredSecrets: TSecret[] | null;
  selectedSecret: TSecret | null;
  folders: TFolder[];
  selectedFolder: TFolder | null;
  fileHash: string;
};

const initialState: TSecretsStore = {
  secrets: null,
  filteredSecrets: null,
  selectedSecret: null,
  folders: [],
  selectedFolder: null,
  fileHash: '',
};

const secretsSlice = createSlice({
  name: 'secrets',
  initialState,
  reducers: {
    setSecrets: (state, action: PayloadAction<TSecret[] | null>) => {
      state.secrets = action.payload;
    },
    setFilteredSecrets: (state, action: PayloadAction<TSecret[] | null>) => {
      state.filteredSecrets = action.payload;
    },
    setFolders: (state, action: PayloadAction<TFolder[]>) => {
      state.folders = action.payload;
    },
    setSelectedSecret: (state, action: PayloadAction<TSecret | null>) => {
      state.selectedSecret = action.payload;
    },
    setSelectedFolder: (state, action: PayloadAction<TFolder | null>) => {
      state.selectedFolder = action.payload;
    },
    setFileHash: (state, action: PayloadAction<string>) => {
      state.fileHash = action.payload;
    },
    updateSecret: (state, action: PayloadAction<{ editedSecret: TSecret }>) => {
      const secret = state.secrets?.find((s) => s.id === action.payload.editedSecret.id);

      if (!secret) return;

      Object.entries(action.payload.editedSecret).forEach(([key, value]) => {
        if (key in secret) {
          (secret as any)[key] = value;
        }
      });

      secret.lastUpdated = Date.now();
    },
  },
});

export const {
  setSecrets,
  setFilteredSecrets,
  setFolders,
  setSelectedSecret,
  setSelectedFolder,
  setFileHash,
  updateSecret,
} = secretsSlice.actions;

export const secretsReducer = secretsSlice.reducer;

export const selectSecrets = (state: RootState): TSecretsStore => state.secrets;
