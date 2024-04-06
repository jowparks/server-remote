const { getDefaultConfig } = require('expo/metro-config');
// Find the project and workspace directories
const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);
config.watchFolders = [
  ...config.watchFolders,
  '/Users/joe/repos/react-native-ssh-sftp',
];
module.exports = config;
