"use strict";
function getMediaKeyMessageEventAsync(test) {
    assert_true(!!navigator['requestMediaKeySystemAccess']);
    navigator.requestMediaKeySystemAccess("org.w3.clearkey", [ { initDataTypes: [ "keyids" ] } ])
    .then(function(keySystemAccess) {
        assert_true(!!keySystemAccess['createMediaKeys']);
        keySystemAccess.createMediaKeys()
        .then(function(keys) {
            assert_true(!!keys['createSession']);
            var session = keys.createSession();
            assert_true(!!session);
            assert_true(!!session['generateRequest']);
            waitForEventAndRunStep('message', session, test.step_func_done(function(evt) {
                level1TestInstance(evt, test.properties.def);
            }), test);
            session.generateRequest("keyids", getInitData())
            .catch(test.step_func_done(function(err) {
                assert_false(!!err,err);
            }));
        })
        .catch(test.step_func_done(function(err) {
            assert_false(!!err,err);
        }));
    })
    .catch(test.step_func_done(function(err) {
        assert_false(!!err,err);
    }));
}
function waitForEventAndRunStep(eventName, target, func, test)
{
    var cb = function(event) {
        if (func)
            func(event);
    }
    if (test)
        cb = test.step_func(cb);
    target.addEventListener(eventName, cb, true);
}
function getInitData() {
    var keyId = new Uint8Array([
        0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
        0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F
    ]);
    return stringToUint8Array(createKeyIDs(keyId));
}
function createKeyIDs()
{
    var keyIds = '{"kids":["';
    for (var i = 0; i < arguments.length; i++) {
        if (i != 0)
            keyIds += '","';
        keyIds += base64urlEncode(arguments[i]);
    }
    keyIds += '"]}';
    return keyIds;
}
function base64urlEncode(data)
{
    var result = btoa(String.fromCharCode.apply(null, data));
    return result.replace(/=+$/g, '').replace(/\+/g, "-").replace(/\//g, "_");
}
function stringToUint8Array(str)
{
    var a = new Uint8Array(str.length);
    for(var i = 0; i < str.length; i++)
        a[i] = str.charCodeAt(i);
    return a;
}
