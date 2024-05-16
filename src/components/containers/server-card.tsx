import React, { useEffect, useState } from 'react';
import { Card, H4, Paragraph } from 'tamagui';
import ContextMenuView from 'react-native-context-menu-view';
import { Animated } from 'react-native';
import { Server, hostname } from '../../typing/server';

export type ServerCardProps = {
  server: Server;
  onEdit: (server: Server) => void;
  onDelete: (server: Server) => void;
  onPress: (server: Server) => void;
};

export default function ServerCard(props: ServerCardProps) {
  const { server, onEdit, onDelete, onPress } = props;
  const [isCardScaled, setIsCardScaled] = useState(false);

  const scaleValue = useState(new Animated.Value(1))[0];

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: isCardScaled ? 1.1 : 1,
      useNativeDriver: true,
    }).start();
  }, [isCardScaled]);

  const handleEdit = () => {
    onEdit(server);
    setIsCardScaled(false);
  };

  const handleDelete = () => {
    onDelete(server);
    setIsCardScaled(false);
  };

  return (
    // TODO handle context menu closes, item scales to zero rather than normal size, which creates odd animation
    <Animated.View
      style={{
        marginBottom: 20,
        width: '90%',
        transform: [{ scale: scaleValue }],
      }}
    >
      {/* TODO handle verify delete */}
      <ContextMenuView
        actions={[
          { title: 'Edit', systemIcon: 'pencil' },
          { title: 'Delete', systemIcon: 'trash', destructive: true },
        ]}
        onPress={(event) => {
          event.nativeEvent.index == 0 ? handleEdit() : handleDelete();
        }}
        previewBackgroundColor="transparent"
      >
        <Card
          elevate
          size="$4"
          bordered
          borderRadius={15}
          key={server.user + server.host + server.port}
          onPress={() => onPress(server)}
        >
          <Card.Header padded style={{ padding: 10 }}>
            <H4>{server.name}</H4>
            <Paragraph theme="alt2">{hostname(server)}</Paragraph>
          </Card.Header>
        </Card>
      </ContextMenuView>
    </Animated.View>
  );
}
