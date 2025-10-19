import { configureStore } from '@reduxjs/toolkit';
import { authReducer, envVarsReducer, googleDriveReducer, mfaReducer, secretsReducer } from './';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    secrets: secretsReducer,
    envVars: envVarsReducer,
    googleDrive: googleDriveReducer,
    mfa: mfaReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
