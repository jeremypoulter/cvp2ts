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
    var _               = require('lodash');
    var assert          = require('assert');
    var common          = './../../common/';
    var commonOptions   = require(common + 'options.js');
    var console         = require('console');
    var fs              = require('fs');
    var path            = require('path');
    var stream          = require('stream');
    var util            = require('util');
    var defaults        = {
        configFile : undefined,
        configFileEncoding : 'utf8',
        configuredConstantsSupport : false,
        helpers3 : undefined,
        level : 3,
        local : undefined,
        other : [],
        outputFileEncoding : 'utf8',
        phase : 'generate',
        source : undefined,
        spec : 'unknown',
        specDirectory : undefined,
        testDirectory : undefined,
        verbose : false
    };
    var $               = {
        /* state */
        options : {},
        /* callbacks */
        onFatalException : function(e) {
            util.error(util.inspect(e));
            process.exit(1);
        },
        onProcessDocument : function() {
            try {
                processTests();
                setTimeout(function() { $.onOutputDone(); }, 0);
            } catch(e) {
                setTimeout(function() { $.onFatalException(e); }, 0);
            }
        },
        onOutputDone : function() {
            process.exit(0);
        },
        processInputFileOption : function(options, other, defaults) {
            return options;
        },
        processOutputFileOption : function(options, other, defaults) {
            return options;
        },
        run : function(argv) {
            try {
                var options = commonOptions.readOptions(argv, defaultOptions(), $);
                if (!!options['levels'] && !_.contains(options['levels'], options['level']))
                    return;
                if (!options['testDirectory'])
                    throw "No test directory!";
                if (!fs.existsSync(options['testDirectory']))
                    throw "Test directory does not exist!";
                $.options = options;
                if (options['verbose'])
                    console.warn('[I]: ' + 'Generating level ' + options['level'] + ' tests from ' + options['configFile'] + ' ...');
                setTimeout($.onProcessDocument, 0);
            } catch(e) {
                setTimeout(function() { $.onFatalException(e); }, 0);
            }
        },
    };
    function defaultOptions() {
        return defaults;
    }
    function processTests() {
        var options = $.options;
        _.forEach(options['tests'], function (def) {
            processTest(def);
        });
    }
    function processTest(def) {
        var options = $.options;
        var name = def.name;
        var helper = def.helper || name;
        var testCode = def.code || "run(test)";
        var async = def.async || false;
        var testFileName = makeTestFileName(def);
        if (!!testFileName) {
            var testContent = buildTest(options['spec'], [def], getHelper(helper), testCode, async);
            var testFile = path.normalize(path.join(options['testDirectory'], testFileName));
            fs.writeFileSync(testFile, testContent, {encoding: options['outputFileEncoding']});
        }
    }
    function getHelper(name) {
        var helpers = $.options.helpers3;
        if (!!helpers) {
            var index = helpers.indexOf(name);
            if (index >= 0) {
                return helpers[index];
            }
        }
        return undefined;
    }
    function makeTestFileName(def) {
        var sep = '-';
        var name = def.name;
        return [$.options['spec'], name].join(sep) + '.html';
    }
    function buildTest(spec, defs, helper, testCode, async) {
        assert.ok(util.isArray(defs) && (defs.length > 0));
        var def = defs[0];
        var html = getTestPreamble();
        html += "<title>" + "Test " + def.name + "</title>\n";
        html += getTestScripts(def, helper);
        html += "<h1>Test " + def.name + " Support</h1>\n";
        html += "<div id='log'></div>\n";
        var entryName = async ? 'level3Async' : 'level3';
        var tester;
        if (!!testCode) {
            if (testCode == 'undefined') {
                if ($.options['warnOnUndefinedInstanceGetter']) {
                    console.warn('[W]: ' + 'Undefined test code for ' + def.name + '.');
                }
                tester = "undefined";
            } else if (testCode == 'null') {
                tester = "null";
            } else {
                tester = "function(t){return " + testCode + ";}";
            }
        } else {
            tester = "undefined";
        }
        html += "<script>\n";
        html += entryName + "('" + spec + "', JSON.parse(document.getElementById('testDef').textContent), " + tester + ");\n";
        html += "</script>\n";
        return html;
    }
    function getTestPreamble() {
        var html = "";
        html += "<!-- Copyright (C) 2014, Cable Television Laboratories, Inc. & Skynav, Inc. -->\n";
        html += "<!-- DO NOT EDIT! This test was generated by https://github.com/dlna/cvp2ts -->\n";
        html += "<!doctype html>\n";
        html += "<meta charset='utf-8'>\n";
        return html;
    }
    function getTestScripts(def, helper) {
        var html = "";
        html += "<script src='/resources/testharness.js'></script>\n";
        html += "<script src='/resources/testharnessreport.js'></script>\n";
        html += "<script src='../common/level3.js'></script>\n";
        if ($.options['configuredConstantsSupport'])
            html += "<script src='../common/constants.js?pipe=sub'></script>\n";
        if (!!helper)
            html += "<script src='./helpers/" + helper + ".js'></script>\n";
        html += "<script type='text/plain' id='testDef'>\n";
        html += JSON.stringify(def) + "\n";
        html += "</script>\n";
        return html;
    }
    $.run(process.argv);
})();
