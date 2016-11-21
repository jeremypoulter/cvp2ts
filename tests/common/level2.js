// DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER
//
// Copyright (C) 2014, Cable Television Laboratories, Inc. & Skynav, Inc.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// * Redistributions of source code must retain the above copyright notice, this list
//   of conditions and the following disclaimer.
// * Redistributions in binary form must reproduce the above copyright notice, this list
//   of conditions and the following disclaimer in the documentation and/or other
//   materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
// TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
// PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
// THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

"use strict";
(function() {
    var global = window;
    function level2(spec, defs) {
        testDefinitions(spec, defs);
    }
    function testDefinitions(spec, defs) {
        var def = !!defs && !Array.isArray(defs) ? defs : ((defs.length > 0) ? defs[0] : null);
        if (!!def) {
            if (def.type == 'property') {
                testProperty(spec, def);
            }
        }
    }
    function testProperty(spec, def) {
        var defType = def.type || 'definition';
        var defName = def.name || 'missing';
        var defProperties = {
            def: def,
            type: defType,
            name: defName,
            expandedName: makeExpandedName(spec, def)
        };
        var e = document.createElement('p');
        var name = def.name;
        var v;
        var vSerialized;
        // test explicitt values
        var values = [];
        if (!def.valueType) {
            var getterName = 'get' + def.nameNormalized + 'Values';
            if (!!global[getterName]) {
                var getter = new Function('return ' + getterName + '();');
                values = values.concat(getter());
            }
        } else if (def.valueType == 'enum') {
            if (!!def.values)
                values = values.concat(def.values);
        }
        if (values.indexOf('inherit') < 0)
            values = values.concat('inherit');
        if (values.indexOf('initial') < 0)
            values = values.concat('initial');
        for (var i = 0; i < values.length; ++i) {
            var value = values[i];
            if (!!value) {
                if (Array.isArray(value)) {
                    if (value.length > 0)
                        v = value[0];
                    else
                        v = '';
                    if (value.length > 1)
                        vSerialized = value[1];
                    else
                        vSerialized = v;
                } else {
                    v = value;
                    vSerialized = value;
                }
                test(function() {
                    var s = e.style;
                    s.setProperty(name, v);
                    assert_equals(s.getPropertyValue(name), vSerialized);
                }, defProperties.expandedName + '-can-round-trip-value-' + escapeValue(v));
            }
        }
    };
    function makeExpandedName(spec, def) {
        return spec + '-' + def.type + '-' + def.name;
    }
    function escapeValue(s) {
        return s;
    }
    /* debug only */
    function dumpProps(o) {
        var s = '';
        for (var pn in o) {
            if (s.length > 0)
                s += ',\n';
            s += pn + ':' + o[pn];
        }
        return s;
    }
    /* globalizers */
    function expose(name, value) {
        global[name] = value;
    }
    expose('expose', expose);
    expose('level2', level2);
    /* debug only */
    expose('dumpProps', dumpProps);
})();
