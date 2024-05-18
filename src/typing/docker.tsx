export type DockerContainer = {
  Id: string;
  Created: string;
  Path: string;
  Args: string[];
  State: {
    Status: string;
    Running: boolean;
    Paused: boolean;
    Restarting: boolean;
    OOMKilled: boolean;
    Dead: boolean;
    Pid: number;
    ExitCode: number;
    Error: string;
    StartedAt: string;
    FinishedAt: string;
  };
  Image: string;
  ResolvConfPath: string;
  HostnamePath: string;
  HostsPath: string;
  LogPath: string;
  Name: string;
  RestartCount: number;
  Driver: string;
  Platform: string;
  MountLabel: string;
  ProcessLabel: string;
  AppArmorProfile: string;
  ExecIDs: null;
  HostConfig: {
    Binds: string[];
    ContainerIDFile: string;
    LogConfig: {
      Type: string;
      Config: {};
    };
    NetworkMode: string;
    PortBindings: {
      [key: string]: {
        HostIp: string;
        HostPort: string;
      }[];
    };
    RestartPolicy: {
      Name: string;
      MaximumRetryCount: number;
    };
    AutoRemove: boolean;
    VolumeDriver: string;
    VolumesFrom: null;
    ConsoleSize: number[];
    CapAdd: null;
    CapDrop: null;
    CgroupnsMode: string;
    Dns: any[];
    DnsOptions: any[];
    DnsSearch: any[];
    ExtraHosts: null;
    GroupAdd: null;
    IpcMode: string;
    Cgroup: string;
    Links: null;
    OomScoreAdj: number;
    PidMode: string;
    Privileged: boolean;
    PublishAllPorts: boolean;
    ReadonlyRootfs: boolean;
    SecurityOpt: null;
    UTSMode: string;
    UsernsMode: string;
    ShmSize: number;
    Runtime: string;
    Isolation: string;
    CpuShares: number;
    Memory: number;
    NanoCpus: number;
    CgroupParent: string;
    BlkioWeight: number;
    BlkioWeightDevice: any[];
    BlkioDeviceReadBps: any[];
    BlkioDeviceWriteBps: any[];
    BlkioDeviceReadIOps: any[];
    BlkioDeviceWriteIOps: any[];
    CpuPeriod: number;
    CpuQuota: number;
    CpuRealtimePeriod: number;
    CpuRealtimeRuntime: number;
    CpusetCpus: string;
    CpusetMems: string;
    Devices: any[];
    DeviceCgroupRules: null;
    DeviceRequests: null;
    MemoryReservation: number;
    MemorySwap: number;
    MemorySwappiness: null;
    OomKillDisable: null;
    PidsLimit: null;
    Ulimits: any[];
    CpuCount: number;
    CpuPercent: number;
    IOMaximumIOps: number;
    IOMaximumBandwidth: number;
    MaskedPaths: string[];
    ReadonlyPaths: string[];
  };
  GraphDriver: {
    Data: {
      LowerDir: string;
      MergedDir: string;
      UpperDir: string;
      WorkDir: string;
    };
    Name: string;
  };
  Mounts: {
    Type: string;
    Name: string;
    Source: string;
    Destination: string;
    Driver: string;
    Mode: string;
    RW: boolean;
    Propagation: string;
  }[];
  Config: {
    Hostname: string;
    Domainname: string;
    User: string;
    AttachStdin: boolean;
    AttachStdout: boolean;
    AttachStderr: boolean;
    ExposedPorts: {
      [key: string]: {};
    };
    Tty: boolean;
    OpenStdin: boolean;
    StdinOnce: boolean;
    Env: string[];
    Cmd: null;
    Image: string;
    Volumes: {
      [key: string]: {};
    };
    WorkingDir: string;
    Entrypoint: string[];
    OnBuild: null;
    Labels: {};
  };
  NetworkSettings: {
    Bridge: string;
    SandboxID: string;
    SandboxKey: string;
    Ports: {
      [key: string]: {
        HostIp: string;
        HostPort: string;
      }[];
    };
    HairpinMode: boolean;
    LinkLocalIPv6Address: string;
    LinkLocalIPv6PrefixLen: number;
    SecondaryIPAddresses: null;
    SecondaryIPv6Addresses: null;
    EndpointID: string;
    Gateway: string;
    GlobalIPv6Address: string;
    GlobalIPv6PrefixLen: number;
    IPAddress: string;
    IPPrefixLen: number;
    IPv6Gateway: string;
    MacAddress: string;
    Networks: {
      [key: string]: {
        IPAMConfig: null;
        Links: null;
        Aliases: null;
        MacAddress: string;
        NetworkID: string;
        EndpointID: string;
        Gateway: string;
        IPAddress: string;
        IPPrefixLen: number;
        IPv6Gateway: string;
        GlobalIPv6Address: string;
        GlobalIPv6PrefixLen: number;
        DriverOpts: null;
        DNSNames: null;
      };
    };
  };
};

export const DockerPsCommand = `docker ps -a --format '{"ID": "{{.ID}}", "Name": "{{.Names}}", "Status": "{{.Status}}", "State": "{{.State}}", "Image": "{{.Image}}", "Labels": "{{.Labels}}"}'`;
export const DockerInspectCommand = (containerId: string) =>
  `docker inspect ${containerId}`;

export type DockerLabel = { [key: string]: string };

export interface DockerPs {
  ID: string;
  Image: string;
  Name: string;
  Status: string;
  State: string;
  Labels: DockerLabel;
  IconUrl: string;
}
