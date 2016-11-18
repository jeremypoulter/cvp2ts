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
    function level4(spec, defs, tester) {
        runTests(spec, defs, tester, false);
    }
    function level4Async(spec, defs, tester) {
        runTests(spec, defs, tester, true);
    }
    function runTests(spec, defs, tester, async) {
        var def = !!defs && !Array.isArray(defs) ? defs : ((defs.length > 0) ? defs[0] : null);
        if (!!def) {
            runTestDefinitions(spec, def, tester, async);
        }
    }
    function runTestDefinitions(spec, def, tester, async) {
        var defName = def.name || 'missing';
        var defProperties = {
            name: defName,
            expandedName: makeExpandedName(spec, def)
        };
        var properties = {
            def: defProperties
        };
        if ('timeout' in def) {
            properties.timeout = def.timeout;
        }
        if (!!tester && ((tester != 'undefined') && (tester != 'null'))) {
            if (typeof tester == 'function') {
                if (!async) {
                    test(function() {
                        tester.apply(this);
                    }, defProperties.expandedName + '-tester-sync', properties);
                } else
                    async_test(tester, defProperties.expandedName + '-tester-async', properties);
            }
        }
    }
    function makeExpandedName(spec, def) {
        return spec + '-' + def.name.toLowerCase();
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
    expose('level4', level4);
    expose('level4Async', level4Async);
    /* debug only */
    expose('dumpProps', dumpProps);
})();
