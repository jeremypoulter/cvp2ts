"use strict";
function run(t) {
    var defProperties = t.properties.def;
    var url = CROSSDOMAIN + './support/check-origin.py';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = t.step_func_done(function() {
        var response = JSON.parse(xhr.response);
        test(function() {
            assert_true(response);
        }, defProperties.expandedName + '-test-origin-present');
    });
    xhr.onerror = function() {
        assert_unreached('unable to load ' + url);
    };
    xhr.send();
}
