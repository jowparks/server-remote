import { Text, View } from 'tamagui';
import DockerList from '../components/docker/list';

export default function DockerScreen() {
  return (
    <View flex={1} alignItems="center">
      <DockerList />
    </View>
  );
}
