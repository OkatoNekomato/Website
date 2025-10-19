import { TSecret, TSecretFile, TSecretProperty } from '../types';

export const encrypt = async (data: string, password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    'raw',
    await cryptoKeyFromPassword(password),
    { name: 'AES-CBC' },
    false,
    ['encrypt'],
  );

  const iv = new Uint8Array(16);
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    encoder.encode(data),
  );

  return bufferToBase64(encryptedBuffer);
};

export const decrypt = async (encryptedData: string, password: string): Promise<string> => {
  const decoder = new TextDecoder();
  const key = await window.crypto.subtle.importKey(
    'raw',
    await cryptoKeyFromPassword(password),
    { name: 'AES-CBC' },
    false,
    ['decrypt'],
  );

  const iv = new Uint8Array(16);
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    key,
    base64ToBuffer(encryptedData),
  );

  return decoder.decode(decryptedBuffer);
};

const cryptoKeyFromPassword = async (password: string): Promise<ArrayBuffer> => {
  const encoder = new TextEncoder();
  const passwordKey = encoder.encode(password);

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    passwordKey,
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );

  const salt = new Uint8Array(16);
  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-CBC', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );

  return window.crypto.subtle.exportKey('raw', key);
};

const bufferToBase64 = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export function trimText(text: string | undefined, length: number): string {
  if (!text) {
    return '';
  }

  if (text.length < length) {
    return text;
  }

  return text.slice(0, length) + '...';
}

export const getTimeFormatByLocalization = (language: string) => {
  const options = new Intl.DateTimeFormat(language, { hour: 'numeric' }).resolvedOptions();
  return options.hour12;
};

export const getCurrentSecretTimeProperty = () => {
  return {
    lastUpdated: Date.now(),
    created: Date.now(),
  };
};

export const getProperty = <T extends string | string[]>(value: T): TSecretProperty<T> => {
  return {
    value,
    ...getCurrentSecretTimeProperty(),
  };
};

export const mapValuesToSecretProperties = <T extends { [key: string]: string }>(
  values: T,
): { [K in keyof T]: TSecretProperty } => {
  const mapped = {} as { [K in keyof T]: TSecretProperty };
  for (const key in values) {
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      mapped[key] = getProperty(values[key]);
    }
  }
  return mapped;
};

export const mergeData = (local: TSecretFile, server: TSecretFile): TSecretFile => {
  // Merge folders at the file level
  const mergedFolders = [
    ...server.folders.map((serverFolder) => {
      const localFolder = local.folders.find((f) => f.id === serverFolder.id);
      if (!localFolder) return serverFolder; // New folder from server
      // Choose the folder with the more recent update
      return localFolder.lastUpdated > serverFolder.lastUpdated ? localFolder : serverFolder;
    }),
    // Add local folders that are not present on the server
    ...local.folders.filter((localFolder) => !server.folders.some((f) => f.id === localFolder.id)),
  ];

  // Helper function to merge two secrets field-by-field.
  const mergeSecret = (localSecret: TSecret, serverSecret: TSecret): TSecret => {
    // Merge the 'folders' field by comparing the max lastUpdated value in the arrays.
    const mergedFoldersForSecret =
      localSecret.folders.lastUpdated > serverSecret.folders.lastUpdated
        ? localSecret.folders
        : serverSecret.folders;

    // Start by copying the secret's base fields.
    const mergedSecret: TSecret = {
      id: localSecret.id,
      folders: mergedFoldersForSecret,
      lastUpdated: Math.max(localSecret.lastUpdated, serverSecret.lastUpdated),
      created: localSecret.created || serverSecret.created,
      // Initialize properties with dummy values; they will be overwritten below.
      label: localSecret.label,
    };

    // List of keys representing secret properties (other than id, folders, created, lastUpdated)
    const propertyKeys: (keyof Omit<
      TSecret,
      'id' | 'folders' | 'website' | 'lastUpdated' | 'created'
    >)[] = ['label', 'username', 'email', 'password', 'phone', 'notes', 'mfa'];

    // For each secret property, choose the one with the more recent update.
    propertyKeys.forEach((key) => {
      const localProp = localSecret[key];
      const serverProp = serverSecret[key];
      if (localProp && serverProp) {
        mergedSecret[key] = localProp.lastUpdated > serverProp.lastUpdated ? localProp : serverProp;
      } else if (localProp) {
        mergedSecret[key] = localProp;
      } else if (serverProp) {
        mergedSecret[key] = serverProp;
      }
      // If neither exists, the property remains undefined.
    });

    return mergedSecret;
  };

  // Merge secrets at the file level
  const mergedSecrets = [
    // For each secret that exists on the server...
    ...server.secrets.map((serverSecret) => {
      // Try to find the corresponding local secret.
      const localSecret = local.secrets.find((s) => s.id === serverSecret.id);
      // If no matching local secret exists, use the server version.
      if (!localSecret) return serverSecret;
      // Otherwise, merge the two secrets field-by-field.
      return mergeSecret(localSecret, serverSecret);
    }),
    // Add local secrets that are not present on the server.
    ...local.secrets.filter((localSecret) => !server.secrets.some((s) => s.id === localSecret.id)),
  ];

  return {
    version: server.version, // Use the server's latest version
    folders: mergedFolders,
    secrets: mergedSecrets,
  };
};
