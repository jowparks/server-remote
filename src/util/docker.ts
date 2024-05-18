import { DockerLabel, DockerPs } from '../typing/docker';

export const processDockerPs = (line: string): DockerPs => {
  const container = JSON.parse(line);
  const labels = {};
  container.Labels.split(',').forEach((label: string) => {
    const [key, value] = label.split('=');
    labels[key] = value;
  });
  container.Labels = labels;
  container.IconUrl = iconFromLabels(labels);
  return container as DockerPs;
};

export const iconFromLabels = (labels: DockerLabel) => {
  const urlPattern = new RegExp('^(http|https)://', 'i');
  for (const key in labels) {
    if (
      key.includes('icon') &&
      (labels[key].includes('.png') ||
        labels[key].includes('.jpeg') ||
        labels[key].includes('.jpg')) &&
      urlPattern.test(labels[key])
    ) {
      return labels[key];
    }
  }
};
