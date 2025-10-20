import { customFetch } from "./customFetch.ts";
import { TFunction } from "i18next";
import { TEnvVars } from "../types";
import { sendErrorNotification, sendSuccessNotification } from "../shared/notifications.ts";

export async function sendPasswordRecoveryCode(
    email: string,
    t: TFunction,
    envs?: TEnvVars
): Promise<Response | null> {
    const body = JSON.stringify({ email: email.trim().toLowerCase() });

    try {
        const response = await customFetch(
            `${envs?.API_SERVER_URL}/email/sendPasswordRecoveryCode`,
            body,
            "POST",
            t
        );

        if (!response) {
            return null;
        }

        if (response.ok) return response;

        switch (response.status) {
            case 404:
                sendErrorNotification(t("notifications:accountNotFound"));
                break;
            case 400:
                sendErrorNotification(t("notifications:invalidEmail"));
                break;
            case 429:
                sendErrorNotification(t("notifications:tooManyRequests"));
                break;
            default:
                sendErrorNotification(t("notifications:serverError"));
                break;
        }

        return null;
    } catch (err) {
        return null;
    }
}

export async function sendEmailVerificationCode(
    email: string,
    envs: TEnvVars | undefined,
    t: TFunction
) {
    if (!envs?.API_SERVER_URL || !email) return null;

    try {
        const res = await customFetch(
            `${envs.API_SERVER_URL}/email/sendEmailVerificationCode`,
            JSON.stringify({ email }),
            "POST",
            t
        );

        if (res?.ok) {
            sendSuccessNotification(t("verify.codeSent"));
        } else {
            sendErrorNotification(t("notifications:failedError"));
        }

        return res;
    } catch {
        sendErrorNotification(t("notifications:serverUnavailable"));
        return null;
    }
}

export async function sendEmailVerification(
    code: string,
    envs: TEnvVars | undefined,
    t: TFunction
) {
    if (!envs?.API_SERVER_URL || !code) return null;

    try {
        const res = await customFetch(
            `${envs.API_SERVER_URL}/auth/verifyEmail`,
            JSON.stringify({ code }),
            "POST",
            t
        );

        if (res?.ok) {
            sendSuccessNotification(t("verify.success"));
        } else if (res?.status === 400) {
            sendErrorNotification(t("verify.invalidCode"));
        } else {
            sendErrorNotification(t("notifications:failedError"));
        }

        return res;
    } catch {
        sendErrorNotification(t("notifications:serverUnavailable"));
        return null;
    }
}