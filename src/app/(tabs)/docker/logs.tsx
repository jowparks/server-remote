import React, { useEffect, useState } from 'react';
import Logs from '../../../components/logs';
import { useDockerContainers } from '../../../contexts/docker-container';
import { Spinner } from 'tamagui';

export default function LogsScreen() {
  const { currentContainerId, dockerContainers } = useDockerContainers();
  const [command, setCommand] = useState<string | null>(null);
  const [refreshCommand, setRefreshCommand] = useState<string | null>(null);
  useEffect(() => {
    let container = dockerContainers.find((c) => c.ID === currentContainerId);
    if (!container) return;
    setCommand(`docker logs ${container.ID}`);
    setRefreshCommand(`docker logs --since 2s ${container.ID}`);
  }, [currentContainerId]);
  return command && refreshCommand ? (
    <Logs command={command} refreshCommand={refreshCommand} />
  ) : (
    <Spinner />
  );
}
