import { createTheme, MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { ToastContainer, Zoom } from 'react-toastify';
import { ErrorBoundary } from './components';
import { useMediaQuery } from '@mantine/hooks';
import { AuthProvider, GoogleDriveProvider, MfaProvider, SecretsProvider, store } from './stores';
import { AppRouter } from './AppRouter.tsx';

const theme = createTheme({
  components: {
    TextInput: {
      defaultProps: {
        autoComplete: 'off',
        'data-1p-ignore': 'true',
        'data-lpignore': 'true',
        'data-protonpass-ignore': 'true',
        'data-bwignore': 'true',
        'data-enignore': 'true',
        'data-enpass-ignore': 'true',
      },
    },
    Input: {
      defaultProps: {
        autoComplete: 'off',
        'data-1p-ignore': 'true',
        'data-lpignore': 'true',
        'data-protonpass-ignore': 'true',
        'data-bwignore': 'true',
        'data-enignore': 'true',
        'data-enpass-ignore': 'true',
      },
    },
    PasswordInput: {
      defaultProps: {
        autoComplete: 'off',
        'data-1p-ignore': 'true',
        'data-lpignore': 'true',
        'data-protonpass-ignore': 'true',
        'data-bwignore': 'true',
        'data-enignore': 'true',
        'data-enpass-ignore': 'true',
      },
    },
    Select: {
      defaultProps: {
        autoComplete: 'off',
        'data-1p-ignore': 'true',
        'data-lpignore': 'true',
        'data-protonpass-ignore': 'true',
        'data-bwignore': 'true',
        'data-enignore': 'true',
        'data-enpass-ignore': 'true',
      },
    },
  },
});

export default function App() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <MantineProvider theme={theme} defaultColorScheme={'dark'}>
      <ErrorBoundary>
        <ToastContainer
          position={isMobile ? 'bottom-center' : 'bottom-right'}
          autoClose={2500}
          limit={3}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          draggable
          theme='dark'
          transition={Zoom}
          pauseOnFocusLoss={false}
          pauseOnHover={false}
        />
        <Provider store={store}>
          <AuthProvider>
            <GoogleDriveProvider>
              <SecretsProvider>
                <MfaProvider>
                  <AppRouter />
                </MfaProvider>
              </SecretsProvider>
            </GoogleDriveProvider>
          </AuthProvider>
        </Provider>
      </ErrorBoundary>
    </MantineProvider>
  );
}
