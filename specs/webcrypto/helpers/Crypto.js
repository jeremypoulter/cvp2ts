"use strict";
function getCrypto() {
    if (!window['crypto'])
        throw InstantiationError('window.crypto is not defined');
    return window.crypto;
}