import { FC, Suspense, useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ErrorPage, NonAuthorizedRoute, ProtectedRoute } from './components';
import { ROUTER_PATH } from './shared';
import Root from './views/root/Root.tsx';
import { PrivacyPolicy } from './views/root/privacy/PrivacyPolicy.tsx';
import SignIn from './views/auth/SignIn.tsx';
import SignUp from './views/auth/SignUp.tsx';
import { Primary, Settings, Vault } from './views/primary';
import {
  fetchEnvs,
  selectAuth,
  selectEnvVars,
  setGoogleDriveStateFetched,
  useAppDispatch,
  useAppSelector,
  useAuth,
  useGoogleDrive,
} from './stores';
import { LoadingOverlay } from '@mantine/core';
import { EAuthState } from './types';
import ForgotPassword from './views/auth/ForgotPassword.tsx';

const errorElement = <ErrorPage />;

const appRouter = createBrowserRouter([
  {
    path: ROUTER_PATH.ROOT,
    element: <Root />,
    errorElement,
  },
  {
    path: ROUTER_PATH.PRIVACY_POLICY,
    element: <PrivacyPolicy />,
    errorElement,
  },
  {
    path: ROUTER_PATH.SIGN_IN,
    element: (
      <NonAuthorizedRoute>
        <SignIn />
      </NonAuthorizedRoute>
    ),
    errorElement,
  },
  {
    path: ROUTER_PATH.SIGN_UP,
    element: (
      <NonAuthorizedRoute>
        <SignUp />
      </NonAuthorizedRoute>
    ),
    errorElement,
  },
  {
    path: ROUTER_PATH.FORGOT,
    element: (
      <NonAuthorizedRoute>
        <ForgotPassword/>
      </NonAuthorizedRoute>
    )
  },
  {
    path: ROUTER_PATH.MENU,
    element: (
      <ProtectedRoute>
        <Primary />
      </ProtectedRoute>
    ),
    errorElement,
  },
  {
    path: ROUTER_PATH.MENU_SETTINGS,
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
    errorElement,
  },
  {
    path: ROUTER_PATH.MENU_VAULT,
    element: (
      <ProtectedRoute>
        <Vault />
      </ProtectedRoute>
    ),
    errorElement,
  },
]);

export const AppRouter: FC = () => {
  const dispatch = useAppDispatch();
  const { envs, loading } = useAppSelector(selectEnvVars);
  const auth = useAppSelector(selectAuth);
  const authContext = useAuth();
  const googleDrive = useGoogleDrive();

  useEffect(() => {
    if (!envs && !loading) {
      dispatch(fetchEnvs());
      return;
    }

    if (googleDrive?.googleDriveStateFetched || !envs || auth.authState === EAuthState.Unknown) {
      return;
    }

    if (auth.authState !== EAuthState.Authorized) {
      dispatch(setGoogleDriveStateFetched(true));
      return;
    }

    dispatch(setGoogleDriveStateFetched(false));
    googleDrive?.fetchGoogleDriveState();
  }, [envs, loading, auth.authState, authContext?.isFetchInProgress]);

  if (
    !envs ||
    loading ||
    (auth.authState === EAuthState.Unknown && authContext.isFetchInProgress) ||
    (auth.authState === EAuthState.Authorized && !googleDrive?.googleDriveStateFetched)
  ) {
    return (
      <LoadingOverlay
        visible={true}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'blue' }}
      />
    );
  }

  return (
    <Suspense fallback={null}>
      <RouterProvider router={appRouter} />
    </Suspense>
  );
};
