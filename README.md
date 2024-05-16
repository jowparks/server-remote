## Gotchas

- ld: building for 'iOS-simulator', but linking in object file (/Users/joe/repos/server-remote/ios/Pods/NMSSH/NMSSH-iOS/Libraries/lib/libcrypto.a[arm64][2](aes_cbc.o)) built for 'iOS'
    - need to run on ios Rosetta simulator, open xcworkspace and run in rosetta simulator

## TestFlight

### New Build

#### In XCode

- Click folder icon in top left of editor
- Double Click "mobileapp"
- Signing & Capabilities tab
- Under signing select "IF Labs" for team (must be added to team in App Store Connect, ask Derek)
- Bundle identifier should be prepopulated but should read "com.ironfish.mobileapp"
- In the scheme bar (top center of editor), select Any iOS Device (arm64)
- Mac menu bar - click Product -> Archive, wait for build (might take a minute or two)
- Click Distribute App button in popup
- App Store Connect -> Distribute

#### TestFlight website

- Login at appstoreconnect.apple.com
- Go to apps
- Click Iron Fish Wallet
- Click Test Flight tab
- From here you can manage internal testing groups/members and builds

### Adding Testflight user

- For internal only, go to AppStoreConnect, Users and Access
- Click +, enter email of employee that they use on their iOS device (probably not work email), add them as customer support
- Have them verify joining team by checking email
- Go to Apps -> Ironfish Wallet -> Testflight
- Left panel Click Internal Testing IF Labs
- Click + for testers
- Select new user, click add
- Have user go to email, and follow link to test app

## Libssh2 and Password vs key auth

- Went down a big rabbit hole trying to use key auth, I was getting errors in the iOS code:
```bash
NMSSH: User auth list: publickey,password
Authentication failed
NMSSH: Public key authentication failed with reason -16
```

and ssh server:
```bash
grep 'sshd' /var/log/auth.log

Apr  6 03:42:33 dev sshd[46161]: pam_unix(sshd:session): session closed for user dev
Apr  6 03:44:22 dev sshd[46222]: Accepted publickey for dev from 10.0.2.2 port 57995 ssh2: RSA SHA256:1I7Ay1tgj/nmUI5W3c05jdbPpj8Qa5PuGWu1XNz0WHc
Apr  6 03:44:22 dev sshd[46222]: pam_unix(sshd:session): session opened for user dev(uid=1000) by (uid=0)
Apr  6 04:02:39 dev sshd[46314]: userauth_pubkey: key type ssh-rsa not in PubkeyAcceptedAlgorithms [preauth]
```

It seems like the session is trying to fall back to ssh-rsa, which is weird because if I run ssh connection via CLI in verbose mode I get more are supported:

```bash
debug1: Will attempt key: /Users/joe/.ssh/id_dsa
debug1: SSH2_MSG_EXT_INFO received
debug1: kex_input_ext_info: server-sig-algs=<ssh-ed25519,sk-ssh-ed25519@openssh.com,ssh-rsa,rsa-sha2-256,rsa-sha2-512,ssh-dss,ecdsa-sha2-nistp256,ecdsa-sha2-nistp384,ecdsa-sha2-nistp521,sk-ecdsa-sha2-nistp256@openssh.com,webauthn-sk-ecdsa-sha2-nistp256@openssh.com>
debug1: kex_input_ext_info: publickey-hostbound@openssh.com=<0>
debug1: SSH2_MSG_SERVICE_ACCEPT received
debug1: Authentications that can continue: publickey,password
debug1: Next authentication method: publickey
debug1: Authentications that can continue: publickey,password
debug1: Next authentication method: password
dev@localhost's password:
```

I thought it was that libssh2 (underlying library for NMSSH) may  not support the new versions of signatures (ie rsa-sha2-256).

I found that it was [supported last year](https://github.com/libssh2/libssh2/issues/536) in libssh2 (before the fork of NMSSH was updated) and is gated by LIBSSH2_RSA_SHA2 compile time flag.

It seemed like iOS uses OpenSSL for [`libcrypto.a`](https://github.com/speam/NMSSH/blob/master/NMSSH-iOS/Libraries/lib/libcrypto.a) but it isn't documented in `NMSSH` what version of openssl (or crypto library in general) is used.

Things to try:

- Compile my own version of libssh2 against new version of openssl, see if that works
- Try manually specifying the public key signature types in session passed to libssh2 by NMSSH
- Compile my own version of libssh2 with log statements.

This is the method being used in `NMSSH`:
[libssh2_userauth_publickey_frommemory](https://github.com/speam/NMSSH/blob/aca13f6a66ce61fa174b498a6f5d6f7bf63fb9a9/NMSSH-iOS/Libraries/include/libssh2/libssh2.h#L678)
The implementation is [here](https://github.com/libssh2/libssh2/blob/cba7f97506c1b8e5ff131bbbc57b5796ac634c56/src/userauth.c#L2017) in `libssh2`

TODO:

- Command run history
- App Intents
