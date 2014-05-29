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
    function level1(spec, idl, getInstance) {
        level1Test(spec, idl, getInstance, false);
    }
    function level1Async(spec, idl, getInstance) {
        level1Test(spec, idl, getInstance, true);
    }
    function level1Test(spec, idl, getInstance, async) {
        var idlType = idl.type || 'definition';
        var idlName = idl.name || 'missing';
        var idlProperties = {
            idl: idl,
            type: idlType,
            name: idlName,
            expandedName: spec + '-' + idlType + '-' + idlName.toLowerCase()
        };
        test(function() {
            assert_true(!!idl, 'Is IDL defined?');
        }, idlProperties.expandedName + '-idl-defined');
        if (!idl)
            return;
        if (!hasExtendedAttribute(idl, 'NoInterfaceObject')) {
            test(function() {
                assert_true(!!global[idlName], 'Is ' + idlProperties.name + ' bound at global scope?');
            }, idlProperties.expandedName + '-bound-at-global-scope');
        }
        if (!!getInstance && (getInstance != 'undefined')) {
            if (typeof getInstance === 'function') {
                if (!async)
                    testInstance(getInstance(), idlProperties);
                else
                    async_test(getInstance, idlProperties.expandedName + '-get-instance-async', {idl: idlProperties});
            }
        }
    };
    function hasExtendedAttribute(idl, attr) {
        var eas = idl.extAttrs || [];
        for (var i in eas) {
            var ea = eas[i];
            if (ea.name === attr)
                return true;
        }
        return false;
    }
    function testInstance(instance, idlProperties) {
        test(function() {
            assert_true(!!instance, 'Is ' + idlProperties.name + ' instance present?');
        }, idlProperties.expandedName + '-instance-present');
        if (!instance)
            return;
        for (var i in idlProperties.idl.members) {
            var member = idlProperties.idl.members[i];
            var memberName = member.name;
            var overloadIndex = getOverloadIndex(member, i);
            if (overloadIndex < 1) {
                if (member.type == 'attribute') {
                    test(function() {
                        assert_true(instance[memberName] !== undefined, 'Does ' + idlProperties.name + ' instance have ' + memberName + ' attribute?');
                    }, idlProperties.expandedName + '-instance-has-' + memberName + '-attribute');
                } else if (member.type == 'operation' && !isSpecialOperation(member)) {
                    test(function() {
                        assert_true(instance[memberName] !== undefined, 'Does ' + idlProperties.name + ' instance have ' + memberName + ' operation?');
                    }, idlProperties.expandedName + '-instance-has-' + memberName + '-operation');
                }
            }
        }
    }
    function isSpecialOperation(member) {
        if (member.getter)
            return true;
        else if (member.setter)
            return true;
        else if (member.creator)
            return true;
        else if (member.deleter)
            return true;
        else if (member.legacycaller)
            return true;
        else if (member.stringifier)
            return true;
        else
            return false;
    }
    var overloads = {};
    function getOverloadIndex(member, i) {
        var memberName = member.name;
        var memberOverloads = overloads[memberName];
        if (memberOverloads === undefined)
            memberOverloads = [ 1 ];
        else
            memberOverloads[0] = memberOverloads[0] + 1;
        overloads[memberName] = memberOverloads;
        return memberOverloads[0] - 1;
    }
    function expose(name, value) {
        global[name] = value;
    }
    expose('expose', expose);
    expose('level1', level1);
    expose('level1Async', level1Async);
    expose('level1TestInstance', testInstance);
})();
