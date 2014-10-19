"use strict";
function run(t) {
    var defProperties = t.properties.def;
    var b = document.body;
    var s = document.createElement('style');
    s.textContent = '@font-face { font-family: CVP2TSTest; src: url(./resources/test.ttf); } p.test { font-family: serif; font-size: 64px; }';
    var x = document.createElement('p');
    x.style.fontFamily = 'sans-serif';
    x.style.fontSize = '16px';
    x.style.fontWeight = 'bold';
    x.style.marginTop = '3em';
    x.textContent = 'The following paragraph consists of three spans, where the first and third use the "serif" font and the second uses a test font loaded via a @font-face rule. The width and height of the first and third span should differ from the width and height of the second span. If the font load had failed, then all three spans would have the same width and height.';
    var p = document.createElement('p');
    p.className = 'test';
    var t1 = document.createElement('span');
    t1.id = 't1';
    t1.textContent = 'TEST';
    t1.style.border = '2px solid red';
    var t2 = document.createElement('span');
    t2.id = 't2';
    t2.textContent = 'TEST';
    t2.style.fontFamily = 'CVP2TSTest';
    t2.style.border = '2px solid green';
    var t3 = document.createElement('span');
    t3.id = 't3';
    t3.textContent = 'TEST';
    t3.style.border = '2px solid red';
    b.onload = t.step_func_done(function(evt) {
        loadComplete(defProperties, b, evt);
    });
    b.appendChild(s);
    b.appendChild(x);
    p.appendChild(t1);
    p.appendChild(t2);
    p.appendChild(t3);
    b.appendChild(p);
}
function loadComplete(defProperties, e, evt) {
    var t1 = document.getElementById('t1');
    assert_true(!!t1);
    var t1r = t1.getBoundingClientRect(t1);
    assert_true(!!t1r);
    var t2 = document.getElementById('t2');
    assert_true(!!t2);
    var t2r = t2.getBoundingClientRect(t2);
    assert_true(!!t2r);
    var t3 = document.getElementById('t3');
    assert_true(!!t3);
    var t3r = t3.getBoundingClientRect(t3);
    assert_true(!!t3r);
    test(function() {
        assert_equals(t1r.width, t3r.width, 'span 1 bbox width must equal span3 bbox width');
    },  defProperties.expandedName + '-reference-width-matches');
    test(function() {
        assert_equals(t1r.height, t3r.height, 'span 1 bbox height must equal span3 bbox height');
    },  defProperties.expandedName + '-reference-height-matches');
    test(function() {
        assert_true(t2r.width != t1r.width, 'span 1 bbox width must not equal span2 bbox width');
    },  defProperties.expandedName + '-test-width-differs');
    test(function() {
        assert_true(t2r.height != t1r.height, 'span 1 bbox height must not equal span2 bbox height');
    },  defProperties.expandedName + '-test-height-differs');
}