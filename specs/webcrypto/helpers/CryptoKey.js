"use strict";
function getCryptoKeyAsync(test) {
    window.crypto.subtle.generateKey(
        {
            name: "RSASSA-PKCS1-v1_5",
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: {name: "SHA-256"}
        },
        false,
        ["sign", "verify"]
    )
    .then(test.step_func_done(function(key) {
        assert_true(!!key);
        assert_true(!!key['publicKey']);
        assert_true(!!key.publicKey);
        level1TestInstance(key.publicKey, test.properties.def);
    }))
    .catch(function(err) {
        test.set_status(test.FAIL, err);
        test.done();
    });
}
