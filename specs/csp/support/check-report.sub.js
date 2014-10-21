"use strict";
(function() {
    function checkReport(t) {
        var defProperties = t.properties.def;
        var locationComponents = location.pathname.split('/');
        var testPath = locationComponents.slice(0, locationComponents.length - 1).join('/');
        var testName = locationComponents[locationComponents.length - 1].split('.')[0].toLowerCase();
        var cookies = document.cookie.split(';');
        var id;
        for (var i = 0; i < cookies.length; ++i) {
            var cookie = cookies[i];
            var cookieComponents = cookie.split('=');
            var n = cookieComponents[0].trim();
            if (n == testName) {
                id = cookieComponents[1].trim();
                document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + testPath;
                break;
            }
        }
        if (!!id) {
            var url = './support/report-csp.py?op=take&timeout=1&id=' + id;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onload = t.step_func_done(function() {
                var present = {{GET[present]}};
                var result  = JSON.parse(xhr.response);
                var error   = result['error'];
                var report  = result['csp-report'];
                test(function() {
                    assert_false(!(present ^ report), present ? 'no report sent' : 'report sent in error');
                }, defProperties.expandedName + (present ? '-report-present' : '-report-absent'));
                if (!!present && !!report) {
                    test(function() {
                        var field  = "{{GET[field]}}"; // must use double quotes, lest substitution contain single quotes
                        var value  = "{{GET[value]}}"; // must use double quotes, lest substitution contain single quotes
                        assert_equals(report[field], value);
                    }, defProperties.expandedName + '-report-field-matches');
                }
            });
            xhr.onerror = t.step_func_done(function() {
                assert_unreached('unable to load report-csp.py');
            });
            xhr.send();
        } else {
            assert_unreached('report identifier cookie missing');
            t.done();
        }
    }
    expose('checkReport', checkReport);
})();
