import { Card, H4, Paragraph } from "tamagui";

type DockerCardProps = {
    container: DockerContainer;
}

export default function DockerCard(props: DockerCardProps) {
    const { container } = props;
    return <Card
        elevate
        size="$4"
        bordered
        borderRadius={15}
    >
        <Card.Header padded style={{ padding: 10 }}>
        <H4>{container.Image}</H4>
        <Paragraph theme="alt2">
            {container.Command}
        </Paragraph>
        </Card.Header>
    </Card>
}