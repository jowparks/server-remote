import React, { useEffect, useState, useRef } from 'react';
import { useDockerContainers } from '../../../contexts/DockerContainer';
import { useSshServerConnection } from '../../../contexts/ServerConnection';
import { View, Text } from 'tamagui';
import { ScrollView } from 'react-native';

export default function LogScreen() {
  const { currentContainerId, dockerContainers } = useDockerContainers();
  const { sshClient } = useSshServerConnection();
  const [logs, setLogs] = useState<string>('');
  let container = dockerContainers.find((c) => c.ID === currentContainerId);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isAtEnd, setIsAtEnd] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      if (!sshClient || !container) return;
      const command = `docker logs ${container.ID}`;

      const response = await sshClient.execute(command);
      setLogs(response);
      console.log(response);
    }

    fetchLogs();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!sshClient || !container) return;
      const command = `docker logs --since 2s ${container.ID}`;

      const response = await sshClient.execute(command);
      setLogs((prevLogs) => prevLogs + response);
    };

    const intervalId = setInterval(fetchLogs, 2000);

    return () => clearInterval(intervalId); // cleanup on unmount
  }, []);

  useEffect(() => {
    if (isAtEnd) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [logs]);

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtEnd =
      layoutMeasurement.height + contentOffset.y >= contentSize.height;
    setIsAtEnd(isAtEnd);
  };

  return (
    <View flex={1}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{
          flexGrow: 1,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        <Text color={'white'}>{logs}</Text>
      </ScrollView>
    </View>
  );
}
