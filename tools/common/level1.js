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
                assert_true(idlName in global, 'Is ' + idlProperties.name + ' bound at global scope?');
            }, idlProperties.expandedName + '-bound-at-global-scope');
        }
        if (hasStaticMember(idl)) {
            test(function() {
                testStaticMembers(global[idlName], idlProperties);
            }, idlProperties.expandedName + '-has-statics', {idl: idlProperties});
        }
        if (!!getInstance && (getInstance != 'undefined')) {
            if (typeof getInstance === 'function') {
                if (!async) {
                    test(function() {
                        testInstance(getInstance(), idlProperties);
                    }, idlProperties.expandedName + '-get-instance-sync', {idl: idlProperties});
                } else
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
    function hasStaticMember(idl) {
        for (var i in idl.members) {
            var member = idl.members[i];
            if (member.static)
                return true;
        }
        return false;
    }
    function testStaticMembers(interfaceInstance, idlProperties) {
        test(function() {
            assert_true(!!interfaceInstance, 'Is ' + idlProperties.name + ' interface present?');
        }, idlProperties.expandedName + '-interface-present');
        if (!interfaceInstance)
            return;
        for (var i in idlProperties.idl.members) {
            var member = idlProperties.idl.members[i];
            if (!member.static)
                continue;
            var memberName = member.name;
            if (!memberName)
                continue;
            var overloadIndex = getOverloadIndex(memberName);
            if (overloadIndex < 1) {
                if (member.type == 'attribute') {
                    test(function() {
                        assert_true(memberName in interfaceInstance, 'Does ' + idlProperties.name + ' interface have static ' + memberName + ' attribute?');
                    }, idlProperties.expandedName + '-interface-has-static-' + memberName + '-attribute');
                } else if (member.type == 'operation') {
                    test(function() {
                        assert_true(memberName in interfaceInstance, 'Does ' + idlProperties.name + ' interface have static ' + memberName + ' operation?');
                    }, idlProperties.expandedName + '-interface-has-static-' + memberName + '-operation');
                }
            }
        }
    }
    function hasInstanceMember(idl) {
        for (var i in idl.members) {
            var member = idl.members[i];
            if (!member.static)
                return true;
        }
        return false;
    }
    function testInstance(instance, idlProperties) {
        var idlName = idlProperties.name;
        test(function() {
            assert_true(!!instance, 'Is ' + idlName + ' instance present?');
        }, idlProperties.expandedName + '-instance-present');
        if (!instance)
            return;
        if (!hasExtendedAttribute(idlProperties.idl, 'NoInterfaceObject')) {
            test(function() {
                assert_true(idlName in global && instance instanceof global[idlName], 'Is instance object an instance of ' + idlName + '?');
            }, idlProperties.expandedName + '-is-instance-instanceof-' + idlName);
        }
        var inheritance = idlProperties.idl.inheritance;
        if (!!inheritance) {
            // TODO: the following is producing false negatives in the case that the inherited interface is marked as [NoInterfaceObject],
            // in which case we can't determine inheritance using instanceof operator; to fix this, we need a list of all IDL interfaces (defined in any spec)
            // that are marked as [NoInterfaceObject]; we will need to compute that table by indexing all parsed IDL definitions between the parse phase and the
            // generate phase
            test(function() {
                assert_true(inheritance in global && instance instanceof global[inheritance], 'Does instance object inherit from ' + inheritance + '?');
            }, idlProperties.expandedName + '-does-instance-inherit-from-' + inheritance);
        }
        for (var i in idlProperties.idl.members) {
            var member = idlProperties.idl.members[i];
            var memberName = member.name;
            if (!memberName) {
                if (member.type == 'operation') {
                    if (member.stringifier) {
                        memberName = 'toString';
                    }
                } else if (member.type == 'serializer')
                    memberName = 'toJSON';
            }
            if (!memberName)
                continue;
            var overloadIndex = getOverloadIndex(memberName);
            if (overloadIndex < 1) {
                if (member.type == 'const') {
                    test(function() {
                        assert_true(memberName in instance, 'Does ' + idlName + ' instance have ' + memberName + ' constant?');
                    }, idlProperties.expandedName + '-instance-has-' + memberName + '-constant');
                    if (memberName in instance) {
                        var value = member.value;
                        if (!!member.value) {
                            if (value.type == 'number') {
                                test(function() {
                                    assert_equals(instance[memberName], value.value, 'Does ' + idlName + ' instance constant have value ' + value.value + '?');
                                }, idlProperties.expandedName + '-instance-' + memberName + '-constant-has-value-' + value.value);
                            }
                        }
                    }
                } else if (member.type == 'field') {
                    test(function() {
                        assert_true(memberName in instance, 'Does ' + idlName + ' instance have ' + memberName + ' field?');
                    }, idlProperties.expandedName + '-instance-has-' + memberName + '-field');
                } else if (member.type == 'attribute') {
                    test(function() {
                        assert_true(memberName in instance, 'Does ' + idlName + ' instance have ' + memberName + ' attribute?');
                    }, idlProperties.expandedName + '-instance-has-' + memberName + '-attribute');
                } else if (member.type == 'operation') {
                    test(function() {
                        assert_true(memberName in instance, 'Does ' + idlName + ' instance have ' + memberName + ' operation?');
                    }, idlProperties.expandedName + '-instance-has-' + memberName + '-operation');
                } else if (member.type == 'serializer') {
                    test(function() {
                        assert_true(memberName in instance, 'Does ' + idlName + ' instance have ' + memberName + ' serializer?');
                    }, idlProperties.expandedName + '-instance-has-' + memberName + '-serializer');
                }
            }
        }
    }
    var overloads = { names: [], counts: [] };
    function getOverloadIndex(memberName) {
        var names = overloads.names;
        var counts = overloads.counts;
        var i = names.indexOf(memberName);
        if (i < 0) {
            i = names.length;
            names[i] = memberName;
            counts[i] = 1;
        } else {
            counts[i] = counts[i] + 1;
        }
        return counts[i] - 1;
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
    function InstantiationError(message)
    {
        this.message = 'InstantiationError: ' + message;
    }
    InstantiationError.prototype.toString = function() {
        return this.message;
    };
    /* globalizers */
    function expose(name, value) {
        global[name] = value;
    }
    expose('expose', expose);
    expose('level1', level1);
    expose('level1Async', level1Async);
    expose('level1TestInstance', testInstance);
    expose('InstantiationError', InstantiationError);
    /* debug only */
    expose('dumpProps', dumpProps);
})();
