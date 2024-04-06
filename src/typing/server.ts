export interface Server {
  host: string;
  port: number;
  user: string;
  password?: string;
  key?: string;
  publicKey?: string;
  keyPassphrase?: string;
  name?: string;
}
