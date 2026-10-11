const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
console.log("sourceExts:", config.resolver.sourceExts);
console.log("assetExts:", config.resolver.assetExts);
console.log("resolverMainFields:", config.resolver.resolverMainFields);
