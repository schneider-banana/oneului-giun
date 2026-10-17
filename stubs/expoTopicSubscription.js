/**
 * No-op stub for expo-notifications' Android topic-subscription native module.
 *
 * expo-notifications' `topicSubscription.js` unconditionally imports
 * `./TopicSubscriptionModule`, which on Android resolves to a file calling
 * `requireNativeModule('ExpoTopicSubscriptionModule')` at import time.
 * That native module (push-only FCM broadcast topics) is not registered in
 * some Expo Go Android clients, so merely importing `expo-notifications`
 * crashes the whole app on startup with:
 *   "Cannot find native module 'ExpoTopicSubscriptionModule'"
 *
 * This app never uses subscribeToTopic/unsubscribeFromTopic (local daily
 * reminders only), so metro.config.js redirects the Android resolution here.
 * The functions below match the shape `topicSubscription.js` expects.
 */

const TopicSubscriptionStub = {
  subscribeToTopicAsync: () => Promise.resolve(null),
  unsubscribeFromTopicAsync: () => Promise.resolve(null),
};

export default TopicSubscriptionStub;
