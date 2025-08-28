const { getDefaultConfig } = require('expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const config = getDefaultConfig(__dirname);

// Ignore native build outputs and metal module cache to prevent Metro watch errors
const ignorePatterns = [
  /ios\/build\/.*/,
  /android\/build\/.*/,
  /.*ModuleCache\.noindex\/.*/,
  /.*\.pcm\.lock$/, // Metal's transient lock files
  /ios\/Pods\/.*/, // pods
];
config.resolver.blockList = exclusionList(ignorePatterns);
// Back-compat (older Metro reads blacklistRE)
config.resolver.blacklistRE = exclusionList(ignorePatterns);

// Support bundling TensorFlow Lite models
if (config?.resolver?.assetExts && !config.resolver.assetExts.includes('tflite')) {
  config.resolver.assetExts.push('tflite');
}

module.exports = config;
