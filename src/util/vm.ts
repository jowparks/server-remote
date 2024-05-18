import { parseString } from 'react-native-xml2js';
import { VirshVMDumpXML } from '../typing/virsh';

export async function parseVirshDumpXML(raw: string): Promise<VirshVMDumpXML> {
  return new Promise((resolve, reject) =>
    parseString(raw, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    }),
  );
}
