import { Separator, YGroup } from 'tamagui';
import { useSshServerConnection } from '../../contexts/ServerConnection';
import { useEffect, useState } from 'react';
import { parseVirshDumpXML } from '../../util/virsh/util';
import VirshCard from './card';
import { VirshVM } from '../../util/virsh/types';

export default function VirshList() {
  const { sshClient } = useSshServerConnection();
  const [vms, setVms] = useState<VirshVM[]>([]);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    const fetchVms = async () => {
      if (!sshClient) return;
      const response = await sshClient.execute('virsh list --all --name');
      const names = response?.split('\n');
      if (!names) return;
      const vmXMLStrings = await Promise.all(
        names.map((name) => sshClient.execute(`virsh dumpxml "${name}"`)),
      );
      const vmXMLs = await Promise.all(
        vmXMLStrings.map((xml) => {
          return parseVirshDumpXML(xml);
        }),
      );
      const states = await Promise.all(
        names.map(async (name) => {
          return {
            name: name,
            state: await sshClient.execute(`virsh domstate "${name}"`),
          };
        }),
      );
      const vms: VirshVM[] = vmXMLs.map((vm) => {
        const stateObj = states.find((state) => state.name === vm.name);
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
      ?.execute(`virsh shutdown "${vm.name}"`)
      .then((response) => {
        console.log(response);
        setTrigger((prev) => !prev);
      })
      .catch((error) => console.log(error));
  };

  const startVm = (vm: VirshVM) => {
    setTrigger((prev) => !prev);
    sshClient
      ?.execute(`virsh start "${vm.name}"`)
      .then((response) => {
        console.log(response);
        setTrigger((prev) => !prev);
      })
      .catch((error) => console.log(error));
  };

  const restartVm = (vm: VirshVM) => {
    setTrigger((prev) => !prev);
    sshClient
      ?.execute(`virsh reboot "${vm.name}"`)
      .then((response) => {
        console.log(response);
        setTrigger((prev) => !prev);
      })
      .catch((error) => console.log(error));
  };

  const saveVm = (vm: VirshVM) => {
    setTrigger((prev) => !prev);
    sshClient
      ?.execute(`virsh save "${vm.name}" "${vm.name}.state"`)
      .then((response) => {
        console.log(response);
        setTrigger((prev) => !prev);
      })
      .catch((error) => console.log(error));
  };

  const restoreVm = (vm: VirshVM) => {
    setTrigger((prev) => !prev);
    sshClient
      ?.execute(`virsh restore "${vm.name}.state"`)
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
          <VirshCard
            key={vm.name}
            vm={vm}
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
