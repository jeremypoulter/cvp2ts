"use strict";
function run(t) {
    var defProperties = t.properties.def;
    var ident = 'test';
    var url = './support/set-cookie.py?ident=' + ident;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = t.step_func(function() {
        test(function() {
            assert_equals(xhr.status, 200);
        }, defProperties.expandedName + '-test-response-status');
        if (xhr.status == 200) {
            test(function() {
                assert_equals(xhr.response, "NO_COOKIE");
            }, defProperties.expandedName + '-test-cookie-not-present');
            xhr.open('GET', url, true);
            xhr.onload = t.step_func_done(function() {
                test(function() {
                    assert_equals(xhr.response, "COOKIE");
                }, defProperties.expandedName + '-test-cookie-present');
            });
            xhr.send();
        } else
            t.done();
    });
    xhr.onerror = function() {
        assert_unreached('unable to load ' + url);
    };
    document.cookie = ident + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    xhr.send();
}
