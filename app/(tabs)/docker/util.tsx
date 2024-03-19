export function parseDockerContainerPs(raw: any): DockerContainer {
    return {
        Command: raw.Command,
        CreatedAt: raw.CreatedAt ? new Date(raw.CreatedAt) : undefined,
        ID: raw.ID,
        Image: raw.Image,
        Labels: raw.Labels ? Object.fromEntries(raw.Labels.split(',').map((label: string) => label.split('='))) : undefined,
        LocalVolumes: raw.LocalVolumes ? parseInt(raw.LocalVolumes) : undefined,
        Mounts: raw.Mounts ? raw.Mounts.split(',') : undefined,
        Names: raw.Names,
        Networks: raw.Networks ? raw.Networks.split(',') : undefined,
        Ports: raw.Ports ? Object.fromEntries(raw.Ports.split(',').map((port: string) => port.split('->'))) : undefined,
        RunningFor: raw.RunningFor,
        Size: raw.Size ? {
            actual: parseInt(raw.Size.split(' ')[0]),
            virtual: parseInt(raw.Size.split(' ')[3]),
        } : undefined,
        State: raw.State,
        Status: raw.Status,
    };
}