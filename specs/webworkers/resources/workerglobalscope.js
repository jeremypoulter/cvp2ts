"use strict";
function showProperties(o) {
    var s = '';
    for (var pn in o) {
        if (s.length > 0)
            s += ',\n';
        s += pn + ':' + o[pn];
    }
    return s;
}
onmessage = function(event) {
    postMessage('done');
};