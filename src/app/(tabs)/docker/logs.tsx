import React, { useEffect, useState } from 'react';
import Logs from '../../../components/containers/logs';
import { useDocker } from '../../../contexts/docker';
import Spin from '../../../components/general/spinner';
import { useFocusedEffect } from '../../../util/focused-effect';

export default function LogsScreen() {
  const { currentContainerId, containers } = useDocker();
  const [command, setCommand] = useState<string | null>(null);
  const [refreshCommand, setRefreshCommand] = useState<string | null>(null);
  useFocusedEffect(() => {
    let container = containers.find((c) => c.ID === currentContainerId);
    if (!container) return;
    setCommand(`docker logs ${container.ID}`);
    setRefreshCommand(`docker logs --since 2s ${container.ID}`);
  }, [currentContainerId]);
  return command && refreshCommand ? (
    <Logs command={command} refreshCommand={refreshCommand} />
  ) : (
    <Spin />
  );
}
