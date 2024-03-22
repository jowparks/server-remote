export type VirshVM = { state: string } & VirshVMDumpXML;

export type VirshVMDumpXML = {
  name: string;
  uuid: string;
  memory: number;
  vcpu: number;
  os: {
    type: string;
    arch: string;
    machine: string;
    boot: string[];
  };
  devices: {
    disk: {
      type: string;
      device: string;
      driver: {
        name: string;
        type: string;
      };
      source: {
        file: string;
      };
      target: {
        dev: string;
        bus: string;
      };
    }[];
    interface: {
      type: string;
      mac: {
        address: string;
      };
      source: {
        network: string;
      };
      model: {
        type: string;
      };
    }[];
  };
};
