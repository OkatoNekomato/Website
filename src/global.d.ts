import { authenticator } from 'otplib';

declare global {
  interface Window {
    otplib: {
      authenticator: typeof authenticator;
    };
  }
}
