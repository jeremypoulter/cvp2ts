"use strict";
function getSubtleCrypto() {
    if (!window['crypto'])
        throw InstantiationError('window.crypto is not defined');
    if (!window.crypto)
        throw InstantiationError('window.crypto is null');
    if (!window.crypto['subtle'])
        throw InstantiationError('window.crypto.subtle is not defined');
    return window.crypto.subtle;
}