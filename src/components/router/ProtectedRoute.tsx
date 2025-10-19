import { Navigate } from 'react-router-dom';
import { selectAuth, useAppSelector } from '../../stores';
import { EAuthState } from '../../types';
import { ReactNode } from 'react';
import { ROUTER_PATH } from '../../shared';
import { LoadingOverlay } from '@mantine/core';

export const ProtectedRoute = (props: { children: ReactNode }) => {
  const { authState } = useAppSelector(selectAuth);

  if (authState === EAuthState.Unknown) {
    return (
      <LoadingOverlay
        visible={true}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'blue' }}
      />
    );
  }

  if (authState !== EAuthState.Authorized) {
    return <Navigate to={ROUTER_PATH.SIGN_IN} />;
  }

  return props.children;
};
