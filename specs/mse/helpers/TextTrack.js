"use strict";
function getTextTrackAsync(test) {
    var video = document.createElement('video');
    if (!('MediaSource' in window))
        throw new InstantiationError('window.MediaSource is not defined.');
    if (!('URL' in window))
        throw new InstantiationError('window.URL is not defined.');
    var source = new MediaSource();
    var buffer;
    var bufferCount = 0;
    waitForEventAndRunStep('sourceopen', source, function(evt) {
        if (!!buffer)
            return;
        buffer = source.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
        waitForEventAndRunStep('updateend', buffer, function(evt) {
            source.endOfStream();
        }, null);
        fetch('./resources/video.webm')
        .then(function(xhr) {
            if (xhr.status == 200) {
                var data = new Uint8Array(xhr.response);
                var blob = new Blob([ data ], { type: 'video/webm' });
                var chunkCount = 6;
                var chunkSize = Math.ceil(blob.size / chunkCount);
                var readChunk = function(chunkIndex) {
                    var r = new FileReader();
                    var blobOffset = chunkIndex * chunkSize;
                    var chunk = blob.slice(blobOffset, blobOffset + chunkSize);
                    r.onload = function(evt) {
                        buffer.appendBuffer(new Uint8Array(evt.target.result));
                        if (chunkIndex < (chunkCount - 1)) {
                            if (video.paused)
                                video.play();
                            readChunk(chunkIndex + 1);
                        }
                    };
                    r.readAsArrayBuffer(chunk);
                }
                readChunk(0);
            }
        })
        .catch(function(xhr) {
            test.set_status(test.FAIL, 'media fetch failed');
            test.done();
        });
    }, null);
    waitForEventAndRunStep('sourceended', source, test.step_func_done(function(evt) {
        if (!!buffer) {
            if (!('textTracks' in video))
                throw new InstantiationError('video.textTracks is not defined.');
            if (!video.textTracks)
                throw new InstantiationError('video.textTracks is null.');
            if (video.textTracks.length < 1)
                throw new InstantiationError('video.textTracks.length is zero.');
            level1TestInstance(video.textTracks[0], test.properties.def);
        }
    }), test);
    if (!('createObjectURL' in window.URL))
        throw new InstantiationError('window.URL.createObjectURL is not defined.');
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
function fetch(url) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
            resolve(xhr);
        };
        xhr.onerror = function() {
            reject(xhr);
        };
        xhr.send();
    });
}

