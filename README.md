# Server Remote

React Native iOS/Android App to control SSH servers. Uses a custom rust backend for SSH communication as there is no cross platform SSH library available for React Native.

Currently supports:

- Docker control/inspection
- virsh VM control/inspection
- File system navigation, download, and upload.
- FaceID/Biometric Auth

## TestFlight

### New Build

#### In XCode

- In the scheme bar (top center of editor), select Any iOS Device (arm64)
- Mac menu bar - click Product -> Archive, wait for build (might take a minute or two)
- Click Distribute App button in popup
- App Store Connect -> Distribute

### TODO

- Command run history
- App Intents
