import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { CONSTANTS } from './shared';

const TARGETS = {
  ios: 'aarch64-apple-ios',
  'ios-sim': 'aarch64-apple-ios-sim',
};

function cargoBuild(target: string) {
  spawnSync('cargo', ['build', '--release', '--target', target], {
    stdio: 'inherit',
    env: {
      IPHONEOS_DEPLOYMENT_TARGET: '14.0',
      ...process.env,
    },
  });
}

function getTarget() {
  const args = process.argv.slice(2);
  const target = (args[0] ?? '').replace('--target=', '');

  if (target !== 'ios' && target !== 'ios-sim') {
    console.error(
      `Invalid target ${target} found. Please specify --target='ios' or --target='ios-sim'`,
    );
    process.exit(1);
  }

  return target;
}

function main() {
  const target = TARGETS[getTarget()];
  console.log(`Building ios for target ${target}`);

  process.chdir(CONSTANTS.rustLibName);

  console.log('Building rust library for ios');
  cargoBuild(target);

  process.chdir('..');

  // Initialize the output directory
  const destinationPath = path.join(
    process.cwd(),
    'modules',
    CONSTANTS.expoModuleName,
    'ios',
    'rust',
  );
  if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath, { recursive: true });
  }
  const iosLibName = `lib${CONSTANTS.rustLibName}.a`;

  const rustLibPath = path.join(
    process.cwd(),
    'target',
    target,
    'release',
    iosLibName,
  );

  console.log('Generating bindings for ios');
  spawnSync(
    'cargo',
    [
      'run',
      '-p',
      'uniffi-bindgen',
      'generate',
      '--library',
      rustLibPath,
      '--language',
      'swift',
      '--out-dir',
      destinationPath,
    ],
    {
      stdio: 'inherit',
    },
  );

  fs.copyFileSync(rustLibPath, path.join(destinationPath, iosLibName));
}

main();
