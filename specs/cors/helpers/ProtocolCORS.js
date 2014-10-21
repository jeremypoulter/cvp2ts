"use strict";
function run(t) {
    var defProperties = t.properties.def;
    var url = CROSSDOMAIN + './support/check-cors.py';
    test(function() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url + '?allow=1', false);
        xhr.send();
        assert_true(JSON.parse(xhr.response));
    }, defProperties.expandedName + '-test-crossorigin-allowed');
    test(function() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url + '?allow=0', false);
        assert_throws(null, function() { xhr.send(); }, 'must throw NetworkError:');
    }, defProperties.expandedName + '-test-crossorigin-denied');
    t.done();
}
