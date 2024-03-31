import { Separator, Spinner, View, YGroup } from 'tamagui';
import React, { useEffect, useState } from 'react';
import { useSshServerConnection } from '../../../contexts/ServerConnection';
import { VirshVM } from '../../../typing/virsh';
import { parseVirshDumpXML } from '../../../util/vm/util';
import ContainerCard from '../../../components/generic/containerCard';

export default function VmList() {
  return (
    <View flex={1} alignItems="center">
      <VmListScreen />
    </View>
  );
}

function VmListScreen() {
  const { sshClient } = useSshServerConnection();
  const [vms, setVms] = useState<VirshVM[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [trigger, setTrigger] = useState(false);
  // TODO handle button clicks creating a visual feedback for intermittent state, do same for docker
  useEffect(() => {
    const fetchVms = async () => {
      if (!sshClient) return;
      const response = await sshClient.execute('virsh list --all --name');
      const names = response?.split('\n').filter(Boolean);
      if (!names) return;
      const vmXMLStrings = await Promise.all(
        names.map((name) => {
          return sshClient.execute(`virsh dumpxml "${name}"`);
        }),
      );
      const vmXMLs = await Promise.all(
        vmXMLStrings.map((xml) => {
          return parseVirshDumpXML(xml);
        }),
      );
      const states = await Promise.all(
        names.map(async (name) => {
          const state = await sshClient.execute(`virsh domstate "${name}"`);
          return {
            name: name,
            state: state.trim(),
          };
        }),
      );
      const vms: VirshVM[] = vmXMLs.map((vm) => {
        const stateObj = states.find(
          (state) => state.name === vm.domain.name[0],
        );
        return { ...vm, state: stateObj?.state || '' };
      });
      setVms(vms);
      setLoaded(true);
    };
    fetchVms();
    const intervalId = setInterval(fetchVms, 5000);
    return () => clearInterval(intervalId);
  }, [sshClient, trigger]);

  // TODO handle force stop
  const stopVm = (vm: VirshVM) => {
    setTrigger((prev) => !prev);
    sshClient
      ?.execute(`virsh shutdown "${vm.domain.name[0]}"`)
      .then((response) => {
        console.log(response);
        setTrigger((prev) => !prev);
      })
      .catch((error) => console.log(error));
  };

  const startVm = (vm: VirshVM) => {
    setTrigger((prev) => !prev);
    sshClient
      ?.execute(`virsh start "${vm.domain.name[0]}"`)
      .then((response) => {
        console.log(response);
        setTrigger((prev) => !prev);
      })
      .catch((error) => console.log(error));
  };

  const restartVm = (vm: VirshVM) => {
    setTrigger((prev) => !prev);
    sshClient
      ?.execute(`virsh reboot "${vm.domain.name[0]}"`)
      .then((response) => {
        console.log(response);
        setTrigger((prev) => !prev);
      })
      .catch((error) => console.log(error));
  };

  const saveVm = (vm: VirshVM) => {
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

  const restoreVm = (vm: VirshVM) => {
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
    <Spinner size="large" />
  ) : (
    <YGroup
      alignSelf="center"
      bordered
      width={'90%'}
      size="$5"
      separator={<Separator />}
    >
      <YGroup.Item>
        {vms.map((vm) => (
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
            onCardPress={() => console.log('fooba')}
            onStart={() => (vm.state == 'paused' ? restoreVm(vm) : startVm(vm))}
            onPause={() => saveVm(vm)}
            onRestart={() => restartVm(vm)}
            onStop={() => stopVm(vm)}
          />
        ))}
      </YGroup.Item>
    </YGroup>
  );
}
