import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import {
  closeMfaModal,
  openMfaModal,
  selectAuth,
  selectEnvVars,
  selectMfa,
  setMfaEnabled,
  setMfaQrCode,
  setModalState,
  setRecoveryCodes,
  setTotpCode,
  useAppDispatch,
  useAppSelector,
} from './';
import {
  Button,
  Center,
  Divider,
  Grid,
  Group,
  Image,
  Modal,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { disableMfa, enableMfa, setupMfa, validateMfa } from '../api';
import { useTranslation } from 'react-i18next';
import { QRCodeToDataURLOptions, toDataURL } from 'qrcode';
import { sendErrorNotification } from '../shared';
import { getCopyButton } from '../components';

export enum EMfaModalState {
  SETUP = 'setup',
  ENABLE = 'enable',
  DISABLE = 'disable',
  VALIDATE = 'validate',
  NONE = 'none',
}

export interface MfaContextType {
  openMfaModalWithState: (
    state: EMfaModalState,
    submitCallback?: (data: string) => void,
    closeCallback?: () => void,
  ) => void;
  handleSetupMfa: () => Promise<void>;
  handleEnableMfa: (totpCode: string) => Promise<void>;
  handleDisableMfa: (totpCode: string) => Promise<void>;
  handleValidateMfa: (totpCode: string) => Promise<boolean>;
}

const MfaContext = createContext<MfaContextType>(null!);

interface IMfaProviderProps {
  children: ReactNode;
}

export const MfaProvider = ({ children }: IMfaProviderProps) => {
  const { t } = useTranslation('auth');
  const { envs } = useAppSelector(selectEnvVars);
  const mfa = useAppSelector(selectMfa);
  const { authEmail } = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [modalSubmitCallback, setModalSubmit] = useState<((data: string | null) => void) | null>(
    null,
  );
  const [modalCloseCallback, setModalClose] = useState<(() => void) | null>(null);

  const openMfaModalWithState = (
    state: EMfaModalState,
    submitCallback?: (data: string) => void,
    closeCallback?: () => void,
  ) => {
    setModalSubmit(() => submitCallback || null);
    setModalClose(() => closeCallback || null);
    dispatch(setModalState(state));
    dispatch(setTotpCode(null));
    dispatch(setRecoveryCodes(null));
    dispatch(openMfaModal());
  };

  const handleSetupMfa = async (): Promise<void> => {
    try {
      const secret = await setupMfa(envs, t);
      if (!secret) {
        return;
      }

      setMfaSecret(secret);
      const identifier = authEmail;
      const otpAuthUrl = `otpauth://totp/${encodeURIComponent(import.meta.env.VITE_APP_NAME)}:${identifier}?secret=${secret}&issuer=${encodeURIComponent(import.meta.env.VITE_APP_NAME)}`;
      const opts: QRCodeToDataURLOptions = {
        errorCorrectionLevel: 'H',
        type: 'image/jpeg',
        margin: 1,
        color: {
          dark: '#dcdcdc',
          light: '#242424',
        },
      };

      const qr = await toDataURL(otpAuthUrl, opts);
      dispatch(setMfaQrCode(qr));

      openMfaModalWithState(EMfaModalState.SETUP, async (code) => {
        if (!code) {
          return sendErrorNotification(t('notifications:incorrectMfaCode'));
        }

        const result = await enableMfa(code, envs, t);
        if (!result) {
          return;
        }

        dispatch(setRecoveryCodes(result));
        dispatch(setMfaEnabled(true));
        dispatch(setModalState(EMfaModalState.ENABLE));
      });
    } catch (error) {
      console.error('Error during MFA setup:', error);
    }
  };

  const handleEnableMfa = async (totpCode: string): Promise<void> => {
    const codes = await enableMfa(totpCode, envs, t);
    if (codes) {
      dispatch(setRecoveryCodes(codes));
      dispatch(closeMfaModal());
    }
  };

  const handleDisableMfa = async (totpCode: string): Promise<void> => {
    const result = await disableMfa(totpCode, envs, t);
    if (!result) return;

    dispatch(setMfaQrCode(null));
    setMfaEnabled(false);
    dispatch(setRecoveryCodes(null));
    dispatch(closeMfaModal());
  };

  const handleValidateMfa = async (totpCode: string): Promise<boolean> => {
    const result = await validateMfa(totpCode, envs, t);
    if (!result) return false;

    dispatch(setTotpCode(null));
    dispatch(closeMfaModal());
    return true;
  };

  const contextValue = useMemo(
    () => ({
      envs,
      authEmail,
      openMfaModalWithState,
      handleSetupMfa,
      handleEnableMfa,
      handleDisableMfa,
      handleValidateMfa,
    }),
    [envs, authEmail],
  );

  return (
    <MfaContext.Provider value={contextValue}>
      {children}
      <Modal
        opened={mfa.isMfaModalOpen}
        onClose={() => {
          dispatch(closeMfaModal());
          dispatch(setTotpCode(null));
        }}
        title={t(`mfa.modalTitle.${mfa.modalState}`)}
        centered
      >
        <form>
          <Group align={'center'} justify='center'>
            {mfa.modalState === EMfaModalState.SETUP && mfa.mfaQrCode && (
              <Stack>
                <Text>{t('mfa.scanQrCode')}</Text>
                <Center>
                  <Image h={192} w={192} src={mfa.mfaQrCode} alt={t('mfa.qrCodeAlt')} />
                </Center>
                <Divider />
              </Stack>
            )}
            {(mfa.modalState === EMfaModalState.SETUP ||
              mfa.modalState === EMfaModalState.DISABLE ||
              mfa.modalState === EMfaModalState.VALIDATE) && (
              <Stack>
                <Text>{t(`mfa.${mfa.modalState}Instruction`)}</Text>
                {mfa.modalState === EMfaModalState.SETUP && mfa && (
                  <>
                    <Group>
                      <Text>{mfaSecret}</Text>
                      {getCopyButton(mfaSecret ?? '', t)}
                    </Group>
                    <Divider />
                  </>
                )}
                <TextInput
                  value={mfa.totpCode ?? ''}
                  maxLength={6}
                  onChange={(e) => dispatch(setTotpCode(e.currentTarget.value))}
                  placeholder={t('mfa.totpPlaceholder')}
                  label={t('mfa.totpLabel')}
                />
                <Group mt='xl' justify={'end'}>
                  <Button
                    variant={'outline'}
                    color={'red'}
                    onClick={() => {
                      modalCloseCallback?.();
                      dispatch(closeMfaModal());
                    }}
                  >
                    {t('mfa.cancelButton')}
                  </Button>
                  <Button
                    type='submit'
                    disabled={!mfa.totpCode || mfa.totpCode.length !== 6}
                    onClick={(e) => {
                      e.preventDefault();
                      setMfaSecret(null);
                      modalSubmitCallback?.(mfa.totpCode);
                    }}
                  >
                    {t('mfa.submitButton')}
                  </Button>
                </Group>
              </Stack>
            )}
            {mfa.modalState === EMfaModalState.ENABLE && mfa.recoveryCodes && (
              <Stack>
                <Text>{t('mfa.recoveryCodesInstruction')}</Text>
                <Grid>
                  {mfa.recoveryCodes.map((code, index) => (
                    <Grid.Col key={index} span={6}>
                      <Text>{code}</Text>
                    </Grid.Col>
                  ))}
                </Grid>
                <Group mt='xl' justify={'end'}>
                  <Button
                    onClick={() => {
                      if (!mfa.recoveryCodes) {
                        return;
                      }

                      const blob = new Blob([mfa.recoveryCodes.join('\n')], { type: 'text/plain' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = 'recovery_codes.txt';
                      link.click();
                      URL.revokeObjectURL(link.href);
                    }}
                  >
                    {t('mfa.downloadButton')}
                  </Button>
                  <Button
                    type='submit'
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch(closeMfaModal());
                    }}
                  >
                    {t('mfa.confirmButton')}
                  </Button>
                </Group>
              </Stack>
            )}
          </Group>
        </form>
      </Modal>
    </MfaContext.Provider>
  );
};

export const useMfa = (): MfaContextType => {
  const context = useContext(MfaContext);
  if (!context) throw new Error('useMfa must be used within an MfaProvider');
  return context;
};
