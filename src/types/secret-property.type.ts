export type TSecretProperty<T = string> = {
  value: T;
  lastUpdated: number;
  created: number;
};
