"use strict";
function run(t) {
    var defProperties = t.properties.def;
    var e = document.createElement('video');
    var mimeType = 'video/mp2t';
    var canPlay = e.canPlayType(mimeType)
    test(function() {
        assert_not_equals(canPlay, '', 'can play type ' + mimeType + ' must return non-empty string');
    },  defProperties.expandedName + '-can-play-type');
    if ((canPlay === 'maybe') || (canPlay === 'probably')) {
        e.src = './resources/test.mp2';
        e.autoplay = true;
        e.onended = t.step_func_done(function(evt) {
            loadComplete(defProperties, e, evt);
        });
        e.onrror = t.step_func_done(function(evt) {
            loadComplete(defProperties, e, evt);
        });
        document.body.appendChild(e);
    } else {
        t.done();
    }
}
function loadComplete(defProperties, e, evt) {
    var eTarget = evt.target;
    test(function() {
        assert_equals(eTarget, e, 'onload target must be original image element');
    },  defProperties.expandedName + '-target-matches');
    test(function() {
        assert_true('error' in eTarget, 'video element must have error property');
        assert_equals(eTarget.error, null, 'error must be null');
    },  defProperties.expandedName + '-no-error');
}