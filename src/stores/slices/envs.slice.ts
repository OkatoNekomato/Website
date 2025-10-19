import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TEnvVars } from '../../types';
import { RootState } from '../store.ts';

type TEnvVarsStore = {
  envs: TEnvVars | undefined;
  loading: boolean;
  error: string | null;
};

const initialState: TEnvVarsStore = {
  envs: undefined,
  loading: false,
  error: null,
};

export const fetchEnvs = createAsyncThunk('envVars/fetchEnvs', async (_, { rejectWithValue }) => {
  try {
    const environment = import.meta.env.VITE_APP_STAGE ?? 'development';
    const response = await fetch(`${import.meta.env.VITE_ENVS_VARS_URL}/${environment}.json`);
    if (!response.ok) throw new Error('Network error');
    return await response.json();
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

const envVarsSlice = createSlice({
  name: 'envVars',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnvs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnvs.fulfilled, (state, action) => {
        state.loading = false;
        state.envs = action.payload;
      })
      .addCase(fetchEnvs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const envVarsReducer = envVarsSlice.reducer;
export const selectEnvVars = (state: RootState) => state.envVars;
