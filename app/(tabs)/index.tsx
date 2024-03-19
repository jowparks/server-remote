import { Text, View } from 'tamagui'
import DockerList from './docker/list'

export default function DockerScreen() {
  return (
    <View flex={1} alignItems="center">
      <DockerList />
    </View>
  )
}
