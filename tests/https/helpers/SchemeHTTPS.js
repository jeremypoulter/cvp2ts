"use strict";
function run(t) {
    var defProperties = t.properties.def;
    var url = './support/respond.py';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = t.step_func_done(function() {
        // test original request headers (returned unmodified by responder)
        var response = JSON.parse(xhr.response);
        test(function() {
            assert_true('accept' in response);
        }, defProperties.expandedName + '-test-request-header-accept-present');
        test(function() {
            assert_true('accept-language' in response);
        }, defProperties.expandedName + '-test-request-header-accept-language-present');
        test(function() {
            assert_true('accept-encoding' in response);
        }, defProperties.expandedName + '-test-request-header-accept-encoding-present');
        test(function() {
            assert_true('connection' in response);
        }, defProperties.expandedName + '-test-request-header-connection-present');
        test(function() {
            assert_equals(response['connection'], 'keep-alive');
        }, defProperties.expandedName + '-test-request-header-connection-has-keep-alive');
        test(function() {
            assert_true('host' in response);
        }, defProperties.expandedName + '-test-request-header-host-present');
        test(function() {
            assert_equals(response['host'], location.host);
        }, defProperties.expandedName + '-test-request-header-host-match');
        test(function() {
            assert_true('referer' in response);
        }, defProperties.expandedName + '-test-request-header-referer-present');
        test(function() {
            assert_equals(response['referer'], location.href);
        }, defProperties.expandedName + '-test-request-header-referer-match');
        test(function() {
            assert_true('user-agent' in response);
        }, defProperties.expandedName + '-test-request-header-user-agent-present');
        // test response headers (returned by responder)
        var responseHeaders = getResponseHeaders(xhr);
        test(function() {
            assert_true('content-length' in responseHeaders);
        }, defProperties.expandedName + '-test-response-header-content-length-present');
        test(function() {
            assert_true('content-type' in responseHeaders);
        }, defProperties.expandedName + '-test-response-header-content-type-present');
        test(function() {
            assert_equals(responseHeaders['content-type'], 'application/json');
        }, defProperties.expandedName + '-test-response-header-content-type-match');
        test(function() {
            assert_true('date' in responseHeaders);
        }, defProperties.expandedName + '-test-response-header-date-present');
        test(function() {
            assert_true('server' in responseHeaders);
        }, defProperties.expandedName + '-test-response-header-server-present');
    });
    xhr.onerror = function() {
        assert_unreached('unable to load ' + url);
    };
    xhr.send();
}
function getResponseHeaders(xhr) {
    var headers = xhr.getAllResponseHeaders().split('\u000d\u000a');
    var responseHeaders = {};
    for (var i = 0; i < headers.length; ++i) {
        var header = headers[i];
        if (header.indexOf(':') >= 0) {
            var headerComponents = header.split(':');
            var n = headerComponents[0];
            var v = headerComponents[1];
            responseHeaders[n.toLowerCase().trim()] = v.trim();
        }
    }
    return responseHeaders;
}
