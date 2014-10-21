"use strict";
function run(t) {
    var properties = t.properties;
    var defProperties = properties.def;
    var e = document.createElement('img');
    e.src = './resources/test.png';
    e.onload = t.step_func_done(function() {
        test(function() {
            assert_unreached('image loaded with img-src \'none\'');
        }, defProperties.expandedName + '-check-allowed');
    });
    e.onerror = t.step_func_done(function() {
        async_test(function() {
            var t = this;
            var s = document.createElement('script');
            s.src = './support/check-report.sub.js?present=true&field=violated-directive&value=img-src%20%27none%27';
            s.onload = t.step_func(function() {
                t.properties = properties;
                checkReport(t);
            });
            s.onerror = t.step_func_done(function() {
                assert_unreached('unable to load check-report.sub.js');
            });
            document.body.appendChild(s);
        }, defProperties.expandedName + '-check-denial-report');
    });
    document.body.appendChild(e);
}
