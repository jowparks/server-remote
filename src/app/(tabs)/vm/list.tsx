import { ScrollView, Separator, Spacer, Spinner, View, YGroup } from 'tamagui';
import React, { useEffect, useState } from 'react';
import { useSsh } from '../../../contexts/ssh';
import ContainerCard from '../../../components/containers/container-card';
import { useVms } from '../../../contexts/vm';
import { VirshVm } from '../../../typing/virsh';
import { useRouter } from 'expo-router';
import images from '../../../icons';
import Spin from '../../../components/general/spinner';
import { RefreshControl } from 'react-native';

export default function VmList() {
  return (
    <View flex={1} alignItems="center">
      <VmListScreen />
    </View>
  );
}

function VmListScreen() {
  const { sshClient } = useSsh();
  const { vms, retrieveVms, setCurrentVmName } = useVms();
  const [loaded, setLoaded] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchVms = async () => {
      if (!sshClient) return;
      await retrieveVms();
      setLoaded(true);
      setRefreshing(false);
    };
    fetchVms();
    const intervalId = setInterval(fetchVms, 5000);
    return () => clearInterval(intervalId);
  }, [sshClient, trigger, triggerRefresh]);

  const stopVm = (vm: VirshVm) => {
    setTrigger((prev) => !prev);
    sshClient
      ?.execute(`virsh shutdown "${vm.domain.name[0]}"`)
      .then((response) => {
        console.log(response);
        setTrigger((prev) => !prev);
      })
      .catch((error) => console.log(error));
  };

  const forceStopVm = (vm: VirshVm) => {
    setTrigger((prev) => !prev);
    sshClient
      ?.execute(`virsh destroy "${vm.domain.name[0]}"`)
      .then((response) => {
        console.log(response);
        setTrigger((prev) => !prev);
      })
      .catch((error) => console.log(error));
  };

  const startVm = (vm: VirshVm) => {
    setTrigger((prev) => !prev);
    sshClient
      ?.execute(`virsh start "${vm.domain.name[0]}"`)
      .then((response) => {
        console.log(response);
        setTrigger((prev) => !prev);
      })
      .catch((error) => console.log(error));
  };

  const restartVm = (vm: VirshVm) => {
    setTrigger((prev) => !prev);
    sshClient
      ?.execute(`virsh reboot "${vm.domain.name[0]}"`)
      .then((response) => {
        console.log(response);
        setTrigger((prev) => !prev);
      })
      .catch((error) => console.log(error));
  };

  const saveVm = (vm: VirshVm) => {
    setTrigger((prev) => !prev);
    sshClient
      ?.execute(
        `virsh save "${vm.domain.name[0]}" "${vm.domain.name[0]}.state"`,
      )
      .then((response) => {
        console.log(response);
        setTrigger((prev) => !prev);
      })
      .catch((error) => console.log(error));
  };

  const restoreVm = (vm: VirshVm) => {
    setTrigger((prev) => !prev);
    sshClient
      ?.execute(`virsh restore "${vm.domain.name[0]}.state"`)
      .then((response) => {
        console.log(response);
        setTrigger((prev) => !prev);
      })
      .catch((error) => console.log(error));
  };

  return !loaded ? (
    <Spin />
  ) : (
    <View flex={1} width={'90%'}>
      <Spacer size="$2" />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTriggerRefresh(!triggerRefresh);
            }}
          />
        }
      >
        <YGroup
          alignSelf="center"
          bordered
          size="$5"
          width="100%"
          separator={<Separator />}
        >
          <YGroup.Item>
            {vms.map((vm, index) => (
              <ContainerCard
                key={vm.domain.name[0]}
                name={vm.domain.name[0]}
                subheading={vm.state}
                running={vm.state === 'running' || vm.state === 'idle'}
                paused={vm.state === 'paused' || vm.state === 'pmsuspended'}
                stopped={
                  vm.state === 'shut off' ||
                  vm.state === 'crashed' ||
                  vm.state === 'in shutdown' ||
                  vm.state === 'dying'
                }
                iconUrl={
                  images[vm.domain.metadata[0].vmtemplate[0].$.icon] ??
                  images['default.png']
                }
                onCardPress={() => {
                  setCurrentVmName(vm.domain.name[0]);
                  router.navigate('(tabs)/vm/menu');
                }}
                onStart={() =>
                  vm.state == 'paused' ? restoreVm(vm) : startVm(vm)
                }
                onPause={() => saveVm(vm)}
                onRestart={() => restartVm(vm)}
                onStop={() => stopVm(vm)}
                onForceStop={() => forceStopVm(vm)}
                listItemStyle={{
                  borderTopLeftRadius: index === 0 ? 10 : 0,
                  borderTopRightRadius: index === 0 ? 10 : 0,
                  borderBottomLeftRadius: index === vms.length - 1 ? 10 : 0,
                  borderBottomRightRadius: index === vms.length - 1 ? 10 : 0,
                }}
              />
            ))}
          </YGroup.Item>
        </YGroup>
      </ScrollView>
    </View>
  );
}
