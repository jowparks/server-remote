import { parseString } from 'react-native-xml2js';
import { VirshVmDumpXML } from '../typing/virsh';

export async function parseVirshDumpXML(raw: string): Promise<VirshVmDumpXML> {
  return new Promise((resolve, reject) =>
    parseString(raw, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    }),
  );
}
