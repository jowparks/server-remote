import React, { useEffect, useState, useRef } from 'react';
import { useSsh } from '../../contexts/ssh';
import { View, Text } from 'tamagui';
import { ScrollView } from 'react-native';
import uuid from 'react-native-uuid';

export type LogsProps = {
  command: string;
  refreshCommand?: string;
};
// TODO handle rendering only the number of lines visible on page

export default function Logs({ command, refreshCommand }: LogsProps) {
  const { sshClient } = useSsh();
  const [logs, setLogs] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [isAtEnd, setIsAtEnd] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      if (!sshClient) return;
      const commandId = uuid.v4() as string;
      await sshClient.execAsync({
        command,
        commandId,
        onData: (data) => {
          setLogs((prevLogs) => prevLogs + data);
        },
      });
    }

    const refreshLogs = async () => {
      if (!sshClient) return;
      if (refreshCommand) {
        const response = await sshClient.exec(refreshCommand);
        setLogs((prevLogs) => prevLogs + response);
      } else {
        const response = await sshClient.exec(command);
        setLogs(response);
      }
    };

    let intervalId;
    async function init() {
      await fetchLogs();
      intervalId = setInterval(refreshLogs, 2000);
    }
    init();

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (isAtEnd) {
      scrollViewRef.current?.scrollToEnd({ animated: false });
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
        // scrollEventThrottle={400}
      >
        <Text color={'white'} selectable>
          {logs}
        </Text>
      </ScrollView>
    </View>
  );
}
