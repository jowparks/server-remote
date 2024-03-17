import { Card, H4, Paragraph } from "tamagui";
import { Server } from "../types";
export type ServerCardProps = {
    server: Server;
};

export default function ServerCard(props: ServerCardProps) {
    const { server } = props;
    return <Card elevate size="$4" bordered key={server.user+server.host+server.port} style={{ marginBottom: 20, width: '90%' }}>
    <Card.Header padded style={{ padding: 10 }}>
        <H4>{server.name}</H4>
        <Paragraph theme="alt2">{server.user}@{server.host}:{server.port}</Paragraph>
    </Card.Header>
  </Card>
};