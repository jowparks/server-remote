import React, { useEffect, useState } from 'react';
import Logs from '../../../components/logs';
import { Spinner } from 'tamagui';
import { useVirshVms } from '../../../contexts/virtual-machines';

export default function LogsScreen() {
  const { currentVmName, virshVms } = useVirshVms();
  const [command, setCommand] = useState<string | null>(null);
  useEffect(() => {
    let name = virshVms.find((c) => c.domain.name[0] === currentVmName)?.domain
      .name[0];
    if (!name) return;
    setCommand(`cat "/var/log/libvirt/qemu/${name}.log"`);
  }, [currentVmName]);
  return command ? <Logs command={command} /> : <Spinner />;
}
