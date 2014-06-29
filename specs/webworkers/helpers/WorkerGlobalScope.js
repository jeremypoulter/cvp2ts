"use strict";
function getWorkerGlobalScopeAsync(test) {
    var worker = new Worker('./resources/workerglobalscope.js');
    worker.onmessage = test.step_func_done(function (event) {alert(event.data);});
    worker.postMessage('doit');
}
