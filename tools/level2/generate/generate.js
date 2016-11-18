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
        helpers2 : undefined,
        level : 2,
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
                processVocabulary();
                processProperties();
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
    function processVocabulary() {
    }
    function processProperties() {
        var options = $.options;
        _.forEach(options['properties'], function (def) {
            if (!def.type)
                def.type = 'property';
            if (!def.nameNormalized)
                def.nameNormalized = normalizePropertyName(def.name);
            processProperty(def);
        });
    }
    function processProperty(def) {
        var options = $.options;
        var type = def.type;
        var name = def.nameNormalized;
        var testFileName = makeTestFileName(def);
        if (!!testFileName) {
            var testContent = buildPropertyTest(options['spec'], [def], getHelper(name));
            var testFile = path.normalize(path.join(options['testDirectory'], testFileName));
            fs.writeFileSync(testFile, testContent, {encoding: options['outputFileEncoding']});
        }
    }
    function normalizePropertyName(name) {
        return capitalize(name.split("-").join(" ")).split(" ").join("");
    }
    function getHelper(name) {
        var helpers = $.options.helpers2;
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
        if (def.type == 'property')
            return makePropertyTestFileName(def, sep);
        else
            return null;
    }
    function makePropertyTestFileName(def, sep) {
        var type = def.type;
        var name = def.nameNormalized;
        return [$.options['spec'], type, name].join(sep) + '.html';
    }
    function buildPropertyTest(spec, defs, helper) {
        assert.ok(util.isArray(defs) && (defs.length > 0));
        var def = defs[0];
        var type = 'property';
        var html = getTestPreamble();
        html += "<title>" + "Property " + def.name + " Tests</title>\n";
        html += getTestScripts(def, helper);
        html += "<h1>Test " + capitalize(type) + " " + def.name + " Support</h1>\n";
        html += "<div id='log'></div>\n";
        var entryName = 'level2';
        html += "<script>\n";
        html += entryName + "('" + spec + "', JSON.parse(document.getElementById('propDef').textContent));\n";
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
        html += "<script src='../common/level2.js'></script>\n";
        if (!!helper)
            html += "<script src='./helpers/" + helper + ".js'></script>\n";
        html += "<script type='text/plain' id='propDef'>\n";
        html += JSON.stringify(def) + "\n";
        html += "</script>\n";
        return html;
    }
    function capitalize(s) {
        if (s.length > 0) {
            var sNew = '';
            var words = s.match(/\S+/g);
            for (var i in words) {
                var w = words[i];
                var first = String.fromCharCode(w.charCodeAt(0));
                var remainder = w.substring(1);
                if (sNew.length > 0)
                    sNew += ' ';
                sNew += first.toUpperCase() + remainder;
            }
            return sNew;
        } else
            return s;
    }
    $.run(process.argv);
})();
