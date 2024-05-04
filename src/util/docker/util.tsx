import { DockerPs } from '../../typing/docker';

export function parseDockerContainerPs(raw: any): DockerPs {
  return {
    ID: raw.ID,
    Image: raw.Image,
    Name: raw.Name,
    State: raw.State,
    Status: raw.Status,
  };
}
