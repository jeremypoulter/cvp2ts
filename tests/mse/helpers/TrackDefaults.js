"use strict";
function getTrackDefaultListAsync(test) {
    var video = document.createElement('video');
    if (!('MediaSource' in window))
        throw new InstantiationError('window.MediaSource is not defined.');
    if (!('URL' in window))
        throw new InstantiationError('window.URL is not defined.');
    var source = new MediaSource();
    waitForEventAndRunStep('sourceopen', source, function(evt) {
        buffer = source.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
        if (!!buffer)
            level1TestInstance(buffer.trackDefaults, test.properties.def);
    }, test);
    video.src = URL.createObjectURL(source);
    document.body.appendChild(video);
}
function waitForEventAndRunStep(eventName, target, func, test)
{
    var cb = function(event) {
        if (func)
            func(event);
    }
    if (test)
        cb = test.step_func(cb);
    target.addEventListener(eventName, cb, true);
}
