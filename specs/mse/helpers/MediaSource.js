"use strict";
function getMediaSource() {
    if (!('MediaSource' in window))
        throw new InstantiationError('window.MediaSource is not defined.');
    return new MediaSource();
}