# Salty Solutions React Native App

## Developing locally

`yarn run ios` or `yarn run android`

### Testing In-app purchases

These have to be tested on a real device. For iOS, this means running the app via XCode and choosing a USB-connected device as the destination.

## Building

The project is built using GitHub actions.

### Android

Bump app version in `android/app/build.gradle`. Look for `android.defaultConfig.versionCode` and `android.defaultConfig.versionName`. Open a PR on GitHub. The build action will automatically run. Wait for GitHub action to complete, then download the result artifact. After you merge the PR, another build will be made.

#### Upload to Google Play store

todo

#### Building locally

You probably don't need to do this.

```bash
cd android
# creates a release aab for play store
./gradlew bundleRelease
# creates a release apk
./gradlew assembleRelease

```

### iOS

Bump app version in `Info.plist`. Look for `CFBundleShortVersionString` and `CFBundleVersion`. Open a PR on GitHub. The build action will automatically run. Wait for GitHub action to complete, then download the result artifact. After you merge the PR, another build will be made.

#### Upload to Apple App Store

Use the [Transporter App](https://apps.apple.com/us/app/transporter/id1450874784?mt=12) to upload the IPA file to Apple. Wait a while. You should receive an email from Apple when it has been processed. It will show up as being available in App Store Connection under Test Flight. Submit it for review and wait.

## Over The Air Publishing

OTA updates uses Expo and it's easy. Run this:

```bash
expo publish
```
