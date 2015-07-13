"use strict";
function getMediaEncryptedEventAsync(t) {
    var e = document.createElement('video');
    waitForEventAndRunStep('encrypted', e, t.step_func_done(function(evt) {
        var defProperties = t.properties.def;
        level1TestInstance(evt, defProperties);
        test(function() {
            assert_equals(evt.initDataType, 'webm');
        }, defProperties.expandedName + '-initDataType-value');
        test(function() {
            assert_array_equals(new Uint8Array(evt.initData), stringToUint8Array('0123456789012345'));
        }, defProperties.expandedName + '-initData-value');
    }), t);
    e.src = './resources/video.webm';
    document.body.appendChild(e);
}
function stringToUint8Array(str)
{
    var a = new Uint8Array(str.length);
    for(var i = 0; i < str.length; i++)
        a[i] = str.charCodeAt(i);
    return a;
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
