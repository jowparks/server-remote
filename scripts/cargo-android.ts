import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { CONSTANTS } from './shared';

const TARGET_TO_DESTINATION = {
  'aarch64-linux-android': 'arm64-v8a',
  'armv7-linux-androideabi': 'armeabi-v7a',
  'i686-linux-android': 'x86',
  'x86_64-linux-android': 'x86_64',
} as const;

function build(target: string) {
  spawnSync(
    'cargo',
    ['ndk', '--target', target, '--platform', '31', 'build', '--release'],
    {
      stdio: 'inherit',
    },
  );
}

function main() {
  console.log('Building rust library for android');

  process.chdir(CONSTANTS.rustLibName);

  Object.keys(TARGET_TO_DESTINATION).forEach(build);

  process.chdir('..');

  const androidLibName = `lib${CONSTANTS.rustLibName}.so`;
  let sourcePath;

  Object.entries(TARGET_TO_DESTINATION).forEach(([target, architecture]) => {
    sourcePath = path.join(
      process.cwd(),
      'target',
      target,
      'release',
      androidLibName,
    );
    const architecturePath = path.join(
      process.cwd(),
      'modules',
      CONSTANTS.expoModuleName,
      'android',
      'src',
      'main',
      'jniLibs',
      architecture,
    );
    if (!fs.existsSync(architecturePath)) {
      fs.mkdirSync(architecturePath, { recursive: true });
    }
    fs.copyFileSync(sourcePath, path.join(architecturePath, androidLibName));
  });

  if (!sourcePath) {
    console.log('Skipping binding generation as no library was built');
    return;
  }

  const bindingPath = path.join(
    process.cwd(),
    'modules',
    CONSTANTS.expoModuleName,
    'android',
    'src',
    'main',
    'java',
  );

  console.log('Generating bindings for android');
  spawnSync(
    'cargo',
    [
      'run',
      '-p',
      'uniffi-bindgen',
      'generate',
      '--library',
      sourcePath,
      '--language',
      'kotlin',
      '--out-dir',
      bindingPath,
    ],
    {
      stdio: 'inherit',
    },
  );
}

main();
