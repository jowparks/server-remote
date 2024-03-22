import { parseStringPromise } from 'xml2js';
import { VirshVMDumpXML } from './types';

export async function parseVirshDumpXML(raw: string): Promise<VirshVMDumpXML> {
  const result = await parseStringPromise(raw, { explicitArray: false });
  const domain = result.domain;

  return {
    name: domain.name,
    uuid: domain.uuid,
    memory: parseInt(domain.memory),
    vcpu: parseInt(domain.vcpu),
    os: {
      type: domain.os.type._,
      arch: domain.os.type.$.arch,
      machine: domain.os.type.$.machine,
      boot: domain.os.boot.map((boot: any) => boot.$.dev),
    },
    devices: {
      disk: domain.devices.disk.map((disk: any) => ({
        type: disk.$.type,
        device: disk.$.device,
        driver: {
          name: disk.driver.$.name,
          type: disk.driver.$.type,
        },
        source: {
          file: disk.source.$.file,
        },
        target: {
          dev: disk.target.$.dev,
          bus: disk.target.$.bus,
        },
      })),
      interface: domain.devices.interface.map((_interface: any) => ({
        type: _interface.$.type,
        mac: {
          address: _interface.mac.$.address,
        },
        source: {
          network: _interface.source.$.network,
        },
        model: {
          type: _interface.model.$.type,
        },
      })),
    },
  };
}
