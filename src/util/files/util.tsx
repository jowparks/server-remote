export function fileCommand(path: string) {
  return `find ${path} -maxdepth 1 -printf '%M,%n,%u.%g,%s,%AY-%Am-%Ad %AH:%AM:%AS,%TY-%Tm-%Td %TH:%TM:%TS,%p,%y,%l\n'`;
}

export type FileType = 'f' | 'd' | 'l';

export interface FileInfo {
  permissions: string;
  numHardLinks: number;
  owner: string;
  group: string;
  size: string;
  lastAccessDate: string;
  lastModified: string;
  filePath: string;
  fileName: string;
  fileType: FileType;
  symlinkTarget?: string;
}

export const fileInfoKeyMap = {
  permissions: 'Permissions',
  numHardLinks: 'Number of Hard Links',
  owner: 'Owner',
  group: 'Group',
  size: 'Size',
  lastAccessDate: 'Last Access Date',
  lastModified: 'Last Modified',
  filePath: 'File Path',
  fileName: 'File Name',
  fileType: 'File Type',
  symlinkTarget: 'Symlink Target',
};

export function parseFileInfo(line: string): FileInfo {
  const parts = line.split(',');

  return {
    permissions: parts[0],
    numHardLinks: parseInt(parts[1]),
    owner: parts[2].split('.')[0],
    group: parts[2].split('.')[1],
    size: formatBytes(parseInt(parts[3])),
    lastAccessDate: parts[4].split('.')[0],
    lastModified: parts[5].split('.')[0],
    filePath: parts[6],
    fileName: parts[6].split('/').pop() || '',
    fileType: parts[7] as FileType,
    symlinkTarget: parts[8] || undefined, // Symlink target can be empty for non-symlink files
  };
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
