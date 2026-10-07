# Hello Flutter

A Flutter mobile app with a Hello World greeting and a **Say hello** button.
The greeting count lasts for the current app session.

## Requirements

- Flutter 3.47.6 and Dart 3.13.5 (used to create and verify this app).
- Android SDK and Java JDK for Android builds.
- macOS and Xcode for iOS builds. The generated iOS project has not been built in this Linux environment.

## Run and test

From the repository root:

```bash
# Activate tools in the configured Codex cloud environment:
source /workspace/toolchains/activate-flutter.sh
cd flutter_app
flutter pub get --enforce-lockfile
flutter analyze
flutter test
flutter run
```

`flutter run` needs a connected Android device/emulator or an iOS device/simulator.
The cloud environment supports headless widget tests and Android builds;
it has no connected phone or Android emulator.

## Build an Android APK

From `flutter_app`:

```bash
flutter build apk --debug
```

Output: `build/app/outputs/flutter-apk/app-debug.apk`.
Install it on an Android device using `adb install -r` followed by that path.
This is a development build signed with a local debug key, not a store release.
Build outputs, local SDK paths, and signing keys are excluded from Git.
