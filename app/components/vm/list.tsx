import { Separator, YGroup } from 'tamagui';
import { useSshServerConnection } from '../../contexts/ServerConnection';
import { useEffect, useState } from 'react';
import { parseVirshDumpXML } from '../../util/virsh/util';
import { VirshVM } from '../../util/virsh/types';
import ContainerCard from '../cards/containerCard';
import React from 'react';

export default function VirshList() {
  const { sshClient } = useSshServerConnection();
  const [vms, setVms] = useState<VirshVM[]>([]);
  const [trigger, setTrigger] = useState(false);

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
    };
    fetchVms();
    const intervalId = setInterval(fetchVms, 5000);
    return () => clearInterval(intervalId);
  }, [sshClient, trigger]);

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

  return (
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
