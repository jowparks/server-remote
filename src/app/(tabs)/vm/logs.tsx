import React, { useEffect, useState } from 'react';
import Logs from '../../../components/containers/logs';
import { Spinner } from 'tamagui';
import { useVms } from '../../../contexts/vm';

export default function LogsScreen() {
  const { currentVmName, vms } = useVms();
  const [command, setCommand] = useState<string | null>(null);
  useEffect(() => {
    let name = vms.find((c) => c.domain.name[0] === currentVmName)?.domain
      .name[0];
    if (!name) return;
    setCommand(`cat "/var/log/libvirt/qemu/${name}.log"`);
  }, [currentVmName]);
  return command ? <Logs command={command} /> : <Spinner />;
}
