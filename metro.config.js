const exclusionList = require('metro-config/src/defaults/exclusionList');
const isProd = process.env.NODE_ENV === 'production' || process.env.EXPO_PUBLIC_ENV === 'production';
let config;
if (isProd) {
  const { getSentryExpoConfig } = require("@sentry/react-native/metro");
  config = getSentryExpoConfig(__dirname);
} else {
  const { getDefaultConfig } = require('expo/metro-config');
  config = getDefaultConfig(__dirname);
}

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