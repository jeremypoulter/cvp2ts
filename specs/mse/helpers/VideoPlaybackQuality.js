"use strict";
function getVideoPlaybackQuality() {
    var video = document.createElement('video');
    if (!('getVideoPlaybackQuality' in video))
        throw new InstantiationError('video.getVideoPlaybackQuality is not defined.');
    return video.getVideoPlaybackQuality();
}