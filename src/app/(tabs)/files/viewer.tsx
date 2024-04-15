import React, { useState, useEffect } from 'react';
import {
  YGroup,
  Separator,
  ListItem,
  ScrollView,
  View,
  Spinner,
} from 'tamagui';
import { useSshServerConnection } from '../../../contexts/ssh-client';
import { LsResult } from '@jowparks/react-native-ssh-sftp';
import { ChevronRight } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

const DirectoryBrowser = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const initialPath = Array.isArray(params.path) ? params.path[0] : params.path;
  const path = initialPath || '/';
  const { sshClient } = useSshServerConnection();
  const [contents, setContents] = useState<LsResult[] | null>(null);
  const [loading, setLoading] = useState(true);

  navigation.setOptions({ title: path });

  useEffect(() => {
    const fetchDirectory = async () => {
      setLoading(true);
      if (!sshClient) return;
      sshClient.sftpLs(path, (error, response) => {
        if (!response) return;
        if (error) {
          console.warn(error);
          return;
        }
        // actually a list of strings as json
        const data = (response as unknown as string[]).map((item) =>
          JSON.parse(item),
        ) as LsResult[];
        setContents(data);
        setLoading(false);
      });
    };

    fetchDirectory();
  }, []);

  const handlePress = (item: LsResult) => {
    if (item.isDirectory) {
      router.push({
        pathname: '(tabs)/files/viewer',
        params: { path: `${path}${item.filename}` },
      });
    }
  };

  return loading ? (
    <Spinner />
  ) : (
    <View>
      <ScrollView>
        <YGroup
          alignSelf="center"
          bordered
          width="90%"
          size="$5"
          separator={<Separator />}
        >
          {contents?.map((item) => (
            <YGroup.Item>
              <ListItem
                hoverTheme
                pressTheme
                title={item.filename}
                onPress={() => handlePress(item)}
                subTitle="Subtitle"
                iconAfter={item.isDirectory ? ChevronRight : undefined}
              />
            </YGroup.Item>
          ))}
        </YGroup>
      </ScrollView>
    </View>
  );
};

export default DirectoryBrowser;
