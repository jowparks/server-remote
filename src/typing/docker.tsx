export interface DockerContainer {
  Command?: string;
  CreatedAt?: Date;
  ID?: string;
  Image?: string;
  Labels?: Record<string, string>;
  LocalVolumes?: number;
  Mounts?: string[];
  Names?: string;
  Networks?: string[];
  Ports?: Record<string, string>;
  RunningFor?: string;
  Size?: { actual: number; virtual: number };
  State?: string;
  Status?: string;
}

export const DockerPsCommand = `docker ps -a --format '{"ID": "{{.ID}}", "Name": "{{.Names}}", "Status": "{{.Status}}", "State": "{{.State}}", "Image": "{{.Image}}"}'`;
export interface DockerPs {
  ID: string;
  Image: string;
  Name: string;
  Status: string;
  State: string;
}
