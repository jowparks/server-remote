# Server Remote

If you use the app, consider donating to keep it totally free.
<form action="https://www.paypal.com/donate" method="post" target="_top">
<input type="hidden" name="business" value="KTCX2BU3EMFYJ" />
<input type="hidden" name="no_recurring" value="0" />
<input type="hidden" name="item_name" value="Hosting infrastructure and building server remote" />
<input type="hidden" name="currency_code" value="USD" />
<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
<img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
</form>

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
