"use strict";
function getCSSRule() {
    var e = document.createElement('style');
    document.head.appendChild(e);
    var s = e.sheet;
    s.insertRule('#id {}',0);
    return s.cssRules[0];
}