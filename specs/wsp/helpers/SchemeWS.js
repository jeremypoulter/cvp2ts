"use strict";
function run(tOuter) {
    var properties = tOuter.properties;
    var defProperties = properties.def;
    var url = 'ws://' + WS_SERVER + ':' + WS_PORT + WS_PATH_ECHO;
    var ws = new WebSocket(url);
    var open = false;
    var data = 'message';
    var tOpen = async_test(defProperties.expandedName + '-check-open');
    var tData;
    var tDone;
    ws.onopen = tOpen.step_func_done(function() {
        open = true;
        ws.send(data);
        assert_equals(ws.bufferedAmount, data.length);
        tData = async_test(defProperties.expandedName + '-check-data');
        ws.onmessage = tData.step_func_done(function(evt) {
            assert_equals(evt.data, data);
            ws.close();
            tDone = async_test(defProperties.expandedName + '-check-done');
            ws.onclose = tDone.step_func_done(function(evt) {
                assert_true(open);
                open = false;
                assert_true(evt.wasClean);
            });
        });
    });
    ws.onerror = tOpen.step_func_done(function() {
        assert_unreached('web socket error');
        if (!!tDone)
            tDone.done();
        if (!!tData)
            tData.done();
    });
    tOuter.done();
}
