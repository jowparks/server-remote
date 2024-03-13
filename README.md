## Gotchas

- ld: building for 'iOS-simulator', but linking in object file (/Users/joe/repos/server-remote/ios/Pods/NMSSH/NMSSH-iOS/Libraries/lib/libcrypto.a[arm64][2](aes_cbc.o)) built for 'iOS'
    - need to run on ios Rosetta simulator, open xcworkspace and run in rosetta simulator
