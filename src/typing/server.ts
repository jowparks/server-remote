export interface Server {
  host: string;
  port: number;
  user: string;
  password?: string;
  key?: string;
  name?: string;
}

export function hostname(server: Server) {
  return `${server.user}@${server.host}:${server.port}`;
}
