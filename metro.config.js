const exclusionList = require('metro-config/src/defaults/exclusionList');
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// Ignore native build outputs to prevent watcher/readlink issues
config.resolver.blockList = exclusionList([
  /ios\/build\/.*/,
  /android\/build\/.*/,
]);

// Support bundling TensorFlow Lite models
if (config?.resolver?.assetExts && !config.resolver.assetExts.includes('tflite')) {
  config.resolver.assetExts.push('tflite');
}

module.exports = config;