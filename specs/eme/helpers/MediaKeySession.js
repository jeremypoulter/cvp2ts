"use strict";
function getMediaKeySessionAsync(test) {
    assert_true(!!navigator['requestMediaKeySystemAccess']);
    navigator.requestMediaKeySystemAccess("org.w3.clearkey", [ { initDataTypes: [ "keyids" ] } ])
    .then(function(keySystemAccess) {
        assert_true(!!keySystemAccess['createMediaKeys']);
        keySystemAccess.createMediaKeys()
        .then(test.step_func_done(function(keys) {
            assert_true(!!keys['createSession']);
            level1TestInstance(keys.createSession(), test.properties.def);
        }))
        .catch(test.step_func_done(function(err) {
            assert_false(!!err,err);
        }));
    })
    .catch(test.step_func_done(function(err) {
        assert_false(!!err,err);
    }));
}
