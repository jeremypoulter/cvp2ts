"use strict";
function getMediaKeySystemAccessAsync(test) {
    assert_true(!!navigator['requestMediaKeySystemAccess']);
    navigator.requestMediaKeySystemAccess("org.w3.clearkey", [ { initDataTypes: [ "keyids" ] } ])
    .then(test.step_func_done(function(keySystemAccess) {
        level1TestInstance(keySystemAccess, test.properties.def);
    }))
    .catch(test.step_func_done(function(err) {
        assert_false(!!err,err);
    }));
}
