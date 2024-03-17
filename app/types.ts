export interface Server {
    host: string;
    port: number;
    user: string;
    password?: string;
    key?: string;
    keyPassphrase?: string;
    name?: string;
}