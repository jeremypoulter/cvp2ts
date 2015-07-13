"use strict";
function getSourceBufferList() {
    if (!('MediaSource' in window))
        throw new InstantiationError('window.MediaSource is not defined.');
    var source = new MediaSource();
    if (!source)
        throw new InstantiationError('unable to instantiate MediaSource.');
    if (!('sourceBuffers' in source))
        throw new InstantiationError('source.sourceBuffers is not defined.');
    return source.sourceBuffers;
}