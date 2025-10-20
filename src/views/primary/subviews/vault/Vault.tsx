import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Image,
  LoadingOverlay,
  Modal,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Space,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useGoogleLogin } from "@react-oauth/google";
import { signInGoogle, signOutGoogle, uploadSecretFile } from "../../../../api";
import {
  EMfaModalState,
  selectAuth,
  selectEnvVars,
  setGoogleDriveEmail,
  setGoogleDriveState,
  useAppDispatch,
  useAppSelector,
  useAuth,
  useGoogleDrive,
  useMfa,
  useSecrets,
} from "../../../../stores";
import { encrypt, SECRET_FILE_VERSION } from "../../../../shared";
import { TSecretFile } from "../../../../types";
import {
  Footer,
  PasswordInputWithCapsLock,
  PrimaryHeader,
} from "../../../../components";

export const Vault = (): JSX.Element => {
  const [loading, { open: showLoading, close: hideLoading }] = useDisclosure(false);
  const [secretPassword, setSecretPassword] = useState("");
  const [secretPasswordModal, { open: openSecretPasswordModal, close: closeSecretPasswordModal }] =
    useDisclosure(false);
  const [keepDataModal, { open: openKeepDataModal, close: closeKeepDataModal }] =
    useDisclosure(false);

  const { t } = useTranslation("vault");
  const { envs } = useAppSelector(selectEnvVars);
  const dispatch = useAppDispatch();
  const { openMfaModalWithState, handleValidateMfa } = useMfa();
  const { isMfaEnabled } = useAppSelector(selectAuth);
  const authContext = useAuth();
  const { googleDriveState, googleDriveEmail } = useGoogleDrive();
  const { setFileHash } = useSecrets();

  const signOutWithMfa = async (code: string) => {
    if (await handleValidateMfa(code)) openKeepDataModal();
  };

  const signOutGoogleButton = async (keepData: boolean) => {
    showLoading();
    try {
      const res = await signOutGoogle(keepData, envs, t, authContext);
      if (res) {
        dispatch(setGoogleDriveState(false));
        dispatch(setGoogleDriveEmail(""));
      }
    } finally {
      hideLoading();
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    scope: envs?.GOOGLE_DRIVE_SCOPES,
    redirect_uri: envs?.GOOGLE_REDIRECT_URI,
    onSuccess: async (codeResponse) => {
      showLoading();
      try {
        const res = await signInGoogle(codeResponse.code, envs, t, authContext);
        if (!res) return;
        const json = await res.json();
        const { hasSecretFile, email = "" } = json;

        if (!hasSecretFile) {
          if (!secretPassword) {
            openSecretPasswordModal();
            return;
          }
          const file: TSecretFile = { version: SECRET_FILE_VERSION, folders: [], secrets: [] };
          const encrypted = await encrypt(JSON.stringify(file), secretPassword);
          const hash = await uploadSecretFile(encrypted, "", envs, t, authContext);
          if (!hash) return;
          setFileHash(hash);
        }

        dispatch(setGoogleDriveState(true));
        dispatch(setGoogleDriveEmail(email));
      } finally {
        hideLoading();
      }
    },
    onError: () => hideLoading(),
  });

  const GoogleDriveCard = () => (
    <Box
      p="lg"
      style={{
        backgroundColor: "#18181b",
        border: "1px solid #2c2c2f",
        borderRadius: 10,
        maxWidth: 400,
        margin: "0 auto",
      }}
    >
      <Stack align="center" gap="md">
        <Image src="/google.svg" h={64} w={64} alt="Google Drive" />
        <Divider color="rgba(255,255,255,0.08)" label={t("main.googleDrive")} />
        <Group justify="space-between" w="100%">
          <Text fw={500}>Google Drive</Text>
          <Badge color={googleDriveState ? "green" : "red"}>
            {googleDriveState
              ? t("states.connected", { email: googleDriveEmail })
              : t("states.disconnected")}
          </Badge>
        </Group>
        <Button
          fullWidth
          color="blue"
          radius="md"
          onClick={() =>
            googleDriveState
              ? isMfaEnabled
                ? openMfaModalWithState(EMfaModalState.VALIDATE, signOutWithMfa)
                : openKeepDataModal()
              : openSecretPasswordModal()
          }
        >
          {googleDriveState ? t("google.signOut") : t("google.signIn")}
        </Button>
      </Stack>
    </Box>
  );


  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#0d0d10",
        color: "#f2f2f2",
      }}
    >
      <PrimaryHeader />

      <ScrollArea style={{ flex: 1, padding: "4rem 1.5rem" }}>
        <Center>
          <Box w="100%" maw={960}>
            <Title order={2} ta="center" mb="3rem">
              {t("title")}
            </Title>
            <SimpleGrid cols={1}>
              <GoogleDriveCard />
            </SimpleGrid>
            <Space h="4rem" />
          </Box>
        </Center>
      </ScrollArea>

      <Footer />

      <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />

      <Modal opened={keepDataModal} onClose={closeKeepDataModal} title={t("modals.keepData.title")}>
        <Group mt="xl" justify="end">
          <Button color="blue" onClick={() => { signOutGoogleButton(false); closeKeepDataModal(); }}>
            {t("modals.keepData.buttons.remove")}
          </Button>
          <Button color="blue" onClick={() => { signOutGoogleButton(true); closeKeepDataModal(); }}>
            {t("modals.keepData.buttons.keep")}
          </Button>
        </Group>
      </Modal>

      <Modal opened={secretPasswordModal} onClose={closeSecretPasswordModal} title={t("modals.masterPassword.title")}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            closeSecretPasswordModal();
            googleLogin();
          }}
        >
          <PasswordInputWithCapsLock
            isModal
            value={secretPassword}
            onChange={(e) => setSecretPassword(e.target.value)}
          />
          <Group mt="xl" justify="end">
            <Button color="blue" type="submit" disabled={!secretPassword}>
              {t("modals.masterPassword.buttons.submit")}
            </Button>
          </Group>
        </form>
      </Modal>
    </Box>
  );
};
