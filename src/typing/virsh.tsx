export type VirshVM = { state: string } & VirshVMDumpXML;

export type VirshVMDumpXML = {
  domain: {
    $: {
      type: string;
    };
    name: string[];
    uuid: string[];
    metadata: Array<{
      vmtemplate: Array<{
        $: {
          xmlns: string;
          name: string;
          icon: string;
          os: string;
        };
      }>;
    }>;
    memory: Array<{
      _: string;
      $: {
        unit: string;
      };
    }>;
    currentMemory: Array<{
      _: string;
      $: {
        unit: string;
      };
    }>;
    memoryBacking: Array<{
      nosharepages: string[];
    }>;
    vcpu: Array<{
      _: string;
      $: {
        placement: string;
      };
    }>;
    cputune: Array<{
      vcpupin: Array<{
        $: {
          vcpu: string;
          cpuset: string;
        };
      }>;
    }>;
    os: Array<{
      type: Array<{
        _: string;
        $: {
          arch: string;
          machine: string;
        };
      }>;
      loader: Array<{
        _: string;
        $: {
          readonly: string;
          type: string;
        };
      }>;
      nvram: string[];
    }>;
    features: Array<{
      acpi: string[];
      apic: string[];
    }>;
    cpu: Array<{
      $: {
        mode: string;
        check: string;
        migratable: string;
      };
      topology: Array<{
        $: {
          sockets: string;
          dies: string;
          cores: string;
          threads: string;
        };
      }>;
      cache: Array<{
        $: {
          mode: string;
        };
      }>;
    }>;
    clock: Array<{
      $: {
        offset: string;
      };
      timer: Array<{
        $: {
          name: string;
          tickpolicy: string;
        };
      }>;
    }>;
    on_poweroff: string[];
    on_reboot: string[];
    on_crash: string[];
    devices: Array<{
      emulator: string[];
      disk: Array<{
        $: {
          type: string;
          device: string;
        };
        driver: Array<{
          $: {
            name: string;
            type: string;
            cache: string;
          };
        }>;
        source: Array<{
          $: {
            file: string;
          };
        }>;
        target: Array<{
          $: {
            dev: string;
            bus: string;
          };
        }>;
        boot: Array<{
          $: {
            order: string;
          };
        }>;
        address: Array<{
          $: {
            type: string;
            domain: string;
            bus: string;
            slot: string;
            function: string;
          };
        }>;
      }>;
      controller: Array<{
        $: {
          type: string;
          index: string;
          model: string;
        };
        model?: Array<{
          $: {
            name: string;
          };
        }>;
        target?: Array<{
          $: {
            chassis: string;
            port: string;
          };
        }>;
        address: Array<{
          $: {
            type: string;
            domain: string;
            bus: string;
            slot: string;
            function: string;
            multifunction?: string;
          };
        }>;
      }>;
      interface: Array<{
        $: {
          type: string;
        };
        mac: Array<{
          $: {
            address: string;
          };
        }>;
        source: Array<{
          $: {
            bridge: string;
          };
        }>;
        model: Array<{
          $: {
            type: string;
          };
        }>;
        address: Array<{
          $: {
            type: string;
            domain: string;
            bus: string;
            slot: string;
            function: string;
          };
        }>;
      }>;
      serial: Array<{
        $: {
          type: string;
        };
        target: Array<{
          $: {
            type: string;
            port: string;
          };
          model: Array<{
            $: {
              name: string;
            };
          }>;
        }>;
      }>;
      console: Array<{
        $: {
          type: string;
        };
        target: Array<{
          $: {
            type: string;
            port: string;
          };
        }>;
      }>;
      channel: Array<{
        $: {
          type: string;
        };
        target: Array<{
          $: {
            type: string;
            name: string;
          };
        }>;
        address: Array<{
          $: {
            type: string;
            controller: string;
            bus: string;
            port: string;
          };
        }>;
      }>;
      input: Array<{
        $: {
          type: string;
          bus: string;
        };
        address?: Array<{
          $: {
            type: string;
            bus: string;
            port: string;
          };
        }>;
      }>;
      audio: Array<{
        $: {
          id: string;
          type: string;
        };
      }>;
      hostdev: Array<{
        $: {
          mode: string;
          type: string;
          managed: string;
        };
        driver: Array<{
          $: {
            name: string;
          };
        }>;
        source: Array<{
          address: Array<{
            $: {
              domain: string;
              bus: string;
              slot: string;
              function: string;
            };
          }>;
        }>;
        address: Array<{
          $: {
            type: string;
            domain: string;
            bus: string;
            slot: string;
            function: string;
          };
        }>;
      }>;
      memballoon: Array<{
        $: {
          model: string;
        };
      }>;
    }>;
  };
};
