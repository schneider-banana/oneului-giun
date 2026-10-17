const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Workaround for: "Cannot find native module 'ExpoTopicSubscriptionModule'"
// crashing the app on startup in Expo Go (Android).
// expo-notifications' index unconditionally re-exports subscribeToTopicAsync /
// unsubscribeFromTopicAsync, whose Android implementation calls
// requireNativeModule('ExpoTopicSubscriptionModule') at import time. That
// native module (push-only FCM broadcast topics) isn't registered in some
// Expo Go Android clients, so the import alone kills the app — even though
// this app only uses local notifications and never touches topic APIs.
// Redirect that single import to a local no-op stub (stubs/expoTopicSubscription.js).
const STUB_PATH = path.join(__dirname, "stubs", "expoTopicSubscription.js");

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === "android" &&
    moduleName === "./TopicSubscriptionModule" &&
    context.originModulePath.includes("expo-notifications/build")
  ) {
    return { filePath: STUB_PATH, type: "sourceFile" };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
