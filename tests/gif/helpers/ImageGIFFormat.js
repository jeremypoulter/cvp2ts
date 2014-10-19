"use strict";
function run(t) {
    var defProperties = t.properties.def;
    var e = document.createElement('img');
    e.src = './resources/test.gif';
    e.onload = t.step_func_done(function(evt) {
        loadComplete(defProperties, e, evt);
    });
    e.onerror = e.onload;
    document.body.appendChild(e);
}
function loadComplete(defProperties, e, evt) {
    var eTarget = evt.target;
    test(function() {
        assert_equals(eTarget, e, 'onload target must be original image element');
    },  defProperties.expandedName + '-target-matches');
    test(function() {
        assert_true('naturalWidth' in eTarget, 'image element must have naturalWidth property');
        assert_equals(eTarget.naturalWidth, 128, 'natural width of loaded image must match');
    },  defProperties.expandedName + '-width-matches');
    test(function() {
        assert_true('naturalHeight' in eTarget, 'image element must have naturalHeight property');
        assert_equals(eTarget.naturalHeight, 96, 'natural height of loaded image must match');
    },  defProperties.expandedName + '-height-matches');
}