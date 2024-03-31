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
