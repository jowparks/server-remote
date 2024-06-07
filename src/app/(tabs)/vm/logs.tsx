import React, { useState } from 'react';
import Logs from '../../../components/containers/logs';
import { useVms } from '../../../contexts/vm';
import Spin from '../../../components/general/spinner';
import { useFocusedEffect } from '../../../util/focused-effect';

export default function LogsScreen() {
  const { currentVmName, vms } = useVms();
  const [command, setCommand] = useState<string | null>(null);
  useFocusedEffect(() => {
    let name = vms.find((c) => c.domain.name[0] === currentVmName)?.domain
      .name[0];
    if (!name) return;
    setCommand(`cat "/var/log/libvirt/qemu/${name}.log"`);
  }, [currentVmName]);
  return command ? <Logs command={command} /> : <Spin />;
}
