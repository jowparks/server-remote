import React, { useEffect, useState, useRef } from 'react';
import { useSsh } from '../contexts/ssh';
import { View, Text } from 'tamagui';
import { ScrollView } from 'react-native';

export type LogsProps = {
  command: string;
  refreshCommand?: string;
};

export default function Logs({ command, refreshCommand }: LogsProps) {
  const { sshClient } = useSsh();
  const [logs, setLogs] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);
  const [isAtEnd, setIsAtEnd] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      if (!sshClient) return;
      const response = await sshClient.execute(command);
      setLogs(response);
      console.log(response);
    }

    fetchLogs();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!sshClient) return;
      if (refreshCommand) {
        const response = await sshClient.execute(refreshCommand);
        setLogs((prevLogs) => prevLogs + response);
      } else {
        const response = await sshClient.execute(command);
        setLogs(response);
      }
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
  // TODO make text selectable
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
