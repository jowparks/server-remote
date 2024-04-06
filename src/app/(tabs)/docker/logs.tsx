import React, { useEffect, useState } from 'react';
import Logs from '../../../components/logs';
import { useDockerContainers } from '../../../contexts/DockerContainer';
import { Spinner } from 'tamagui';

export default function LogsScreen() {
  const { currentContainerId, dockerContainers } = useDockerContainers();
  const [initialCommand, setInitialCommand] = useState<string | null>(null);
  const [refreshCommand, setRefreshCommand] = useState<string | null>(null);
  useEffect(() => {
    let container = dockerContainers.find((c) => c.ID === currentContainerId);
    if (!container) return;
    setInitialCommand(`docker logs ${container.ID}`);
    setRefreshCommand(`docker logs --since 2s ${container.ID}`);
  }, [currentContainerId]);
  return initialCommand && refreshCommand ? (
    <Logs initialCommand={initialCommand} refreshCommand={refreshCommand} />
  ) : (
    <Spinner />
  );
}
