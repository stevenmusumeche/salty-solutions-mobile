# Salty Solutions React Native App

## Developing locally

`yarn run ios` or `yarn run android`

## Building

The project is built using GitHub actions.

### Android

Bump app version in `android/app/build.gradle`. Look for `android.defaultConfig.versionCode` and `android.defaultConfig.versionName`.

```bash
cd android
# creates a release aab for play store
./gradlew bundleRelease
# creates a release apk
./gradlew assembleRelease

```

Choose "app-bundle" and wait for the build to complete on Expo. Download the built file.

### iOS

```bash
expo build:ios
```

Choose "archive" and wait for the build to complete on Expo. You might have to login with the Apple developer account (steven@musumeche.com).Download the built file.

## Over The Air Publishing

```bash
expo publish
```
