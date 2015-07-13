"use strict";
function getTrackDefault() {
    if (!('TrackDefault' in window))
        throw new InstantiationError('window.TrackDefault is not defined.');
    return new TrackDefault('video','en','id', [ 'main' ], '123');
}