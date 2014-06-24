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
        helpers : undefined,
        indexFile : undefined,
        inputFileEncoding : 'utf8',
        inputFile : undefined,
        instances : {},
        instancesAsync : {},
        local : undefined,
        manual : [],
        other : [],
        outputFile : undefined,
        outputFileEncoding : 'utf8',
        phase : 'generate',
        source : undefined,
        spec : 'unknown',
        specDirectory : undefined,
        testDirectory : undefined,
        verbose : false,
        warnOnMissingImplementsInterface : true,
        warnOnMissingInstanceGetter : true,
        warnOnUndefinedInstanceGetter : true
    };
    var chunkSize       = 16384;
    var $               = {
        /* state */
        options : {},
        index : null,
        input : null,
        inputData : '',
        document : null,
        output : null,
        partials: {},
        /* callbacks */
        onFatalException : function(e) {
            util.error(util.inspect(e));
            process.exit(1);
        },
        onInputData : function(chunk) {
            $.inputData += chunk;
        },
        onInputDone : function() {
            try {
                $.document = JSON.parse($.inputData);
                setTimeout($.onProcessDocument, 0);
            } catch (e) {
                setTimeout(function() { $.onFatalException(e); }, 0);
            }
        },
        onProcessDocument : function() {
            try {
                var doc = $.document;
                if (!!doc) {
                    processCallbackInterfaces(doc);
                    processDictionaries(doc);
                    processExceptions(doc);
                    processInterfaces(doc);
                    processImplements(doc);
                }
                setTimeout(function() { $.onOutputDone(); }, 0);
            } catch(e) {
                setTimeout(function() { $.onFatalException(e); }, 0);
            }
        },
        onOutputDone : function() {
            process.exit(0);
        },
        processInputFileOption : function(options, other, defaults) {
            if (!options['inputFile']) {
                if (other.length > 0)
                    options['inputFile'] = other.shift();
                if (!!options['inputFile'] && !options['specDirectory'])
                    options['specDirectory'] = commonOptions.extractSpecDirectory(options['inputFile']);
                if (!options['inputFile']) {
                    if (!!options['specDirectory'] && !!options['spec'])
                        options['inputFile'] = path.normalize(path.join(options['specDirectory'], options['spec'] + '.idl'));
                }
            }
            return options;
        },
        processOutputFileOption : function(options, other, defaults) {
            if (!options['outputFile']) {
                if (other.length > 0)
                    options['outputFile'] = other.shift();
                else if (!!options['specDirectory'] && !!options['spec'])
                    options['outputFile'] = path.join(options['specDirectory'], '.tests', options['spec'] + '.js');
            }
            return options;
        },
        run : function(argv) {
            try {
                var options = commonOptions.readOptions(argv, defaultOptions(), $);
                var input;
                if (!!options['inputFile'])
                    input = fs.createReadStream(options['inputFile'], {encoding: options['inputFileEncoding']});
                else
                    input = process.stdin;
                if (!!input) {
                    input.on('data', $.onInputData);
                    input.on('end', $.onInputDone);
                    input.resume();
                    $.input = input;
                } else
                    throw "No input stream!";
                if (!options['testDirectory'])
                    throw "No test directory!";
                if (!fs.existsSync(options['testDirectory']))
                    throw "Test directory does not exist!";
                $.options = options;
                if (options['verbose'])
                    console.warn('[I]: ' + 'Generating tests from ' + ((input !== process.stdin) ? options['inputFile'] : 'STDIN') + ' ...');
            } catch(e) {
                setTimeout(function() { $.onFatalException(e); }, 0);
            }
        },
    };
    function defaultOptions() {
        return defaults;
    }
    function processCallbackInterfaces(doc) {
        _(doc).filter(function (def) {
            return def.type == 'callback interface' && hasConstantMember(def);
        }).forEach(function (def) {
            processCallbackInterface(def, doc);
        });
    }
    function processDictionaries(doc) {
        _(doc).filter(function (def) {
            return def.type == 'dictionary' && hasExtendedAttribute(def, 'Constructor');
        }).forEach(function (def) {
            processDictionary(def, doc);
        });
    }
    function processExceptions(doc) {
        _(doc).filter(function (def) {
            return def.type == 'exception';
        }).forEach(function (def) {
            processInterface(def, doc);
        });
    }
    function processInterfaces(doc) {
        _(doc).filter(function (def) {
            return def.type == 'interface';
        }).forEach(function (def) {
            processInterface(def, doc);
        });
    }
    function processImplements(doc) {
        _(doc).filter(function (def) {
            return def.type == 'implements';
        }).forEach(function (def) {
            processImplementsInterface(def, doc);
        });
    }
    function processCallbackInterface(def, doc) {
        processInterface(def, doc);
    }
    function processDictionary(def, doc) {
        console.warn('[W]: ' + 'Dictionary with constructor ' + def.name + ' NOT YET TESTED!');
    }
    function processImplementsInterface(def, doc) {
        var options = $.options;
        var type = def.type;
        var target = def.target;
        var targetImplements = def.implements;
        var defs = [def];
        var targetImplementsDef = findInterface(doc, targetImplements);
        if (!!targetImplementsDef)
            defs.push(targetImplementsDef);
        else {
            if ($.options['warnOnMissingImplementsInterface'])
                console.warn('[W]: ' + 'Missing implements interface ' + targetImplements + '.');
            return;
        }
        var getInstance;
        var async;
        if (!!options['instances'] && !!options['instances'][target]) {
            getInstance = options['instances'][target];
            async = false;
        } else if (!!options['instancesAsync'] && !!options['instancesAsync'][target]) {
            getInstance = options['instancesAsync'][target];
            async = true;
        } else {
            if ($.options['warnOnMissingInstanceGetter'])
                console.warn('[W]: ' + 'Missing instance getter for ' + target + '.');
            return;
        }
        var manual = requiresManualTest(targetImplements);
        var testFileName = makeTestFileName(def, doc, manual);
        if (!!testFileName) {
            var testContent = buildImplementsTest(options['spec'], defs, getInstance, async, getHelper(target), manual);
            var testFile = path.normalize(path.join(options['testDirectory'], testFileName));
            fs.writeFileSync(testFile, testContent, {encoding: options['outputFileEncoding']});
        }
    }
    function findInterface(doc, name) {
        var def =  _(doc).filter(function (def) {
            return (def.type == 'interface' || def.type == 'callback interface') && def.name == name;
        }).pop();
        if (!def)
            def = findInterfaceFromIndex(doc, name);
        return def;
    }
    function findInterfaceFromIndex(doc, name) {
        try {
            if (!$.index) {
                var options = $.options;
                $.index = JSON.parse(fs.readFileSync(options['indexFile'], {encoding: options['inputFileEncoding']}));
            }
            for (var i in $.index) {
                var def = $.index[i];
                if (def.type == 'interface') {
                    if (!def.partial) {
                        if (def.name == name)
                            return def;
                    }
                }
            }
        } catch (e) {
            setTimeout(function() { $.onFatalException(e); }, 0);
        }
        return undefined;
    }
    function getTestPreamble() {
        var html = "";
        html += "<!-- Copyright (C) 2014, Cable Television Laboratories, Inc. & Skynav, Inc. -->\n";
        html += "<!-- DO NOT EDIT! This test was generated by $(CVP2TS)/tools/level1/generate/generate.js. -->\n";
        html += "<!doctype html>\n";
        html += "<meta charset='utf-8'>\n";
        return html;
    }
    function getTestScripts(idl, helper) {
        var html = "";
        html += "<script src='/resources/testharness.js'></script>\n";
        html += "<script src='/resources/testharnessreport.js'></script>\n";
        html += "<script src='/tools/common/level1.js'></script>\n";
        if (!!helper)
            html += "<script src='./helpers/" + helper + ".js'></script>\n";
        html += "<script type='text/plain' id='idl'>\n";
        html += JSON.stringify(idl) + "\n";
        html += "</script>\n";
        return html;
    }
    function buildImplementsTest(spec, defs, getInstance, async, helper, manual) {
        assert.ok(util.isArray(defs) && (defs.length > 0));
        var def = defs[0];
        var type = capitalize(def.type);
        var html = getTestPreamble();
        html += "<title>" + def.target + " " + type + " " + def.implements + " Signature Tests</title>\n";
        html += getTestScripts(defs, helper);
        html += "<h1>Test " + def.target + " " + type + " " + def.implements + " Signature</h1>\n";
        html += "<div id='log'></div>\n";
        var entryName = async ? 'level1Async' : 'level1';
        var instanceGetter;
        if (!!getInstance) {
            if (getInstance == 'undefined') {
                if ($.options['warnOnUndefinedInstanceGetter'])
                    console.warn('[W]: ' + 'Undefined instance getter for ' + def.target + '.');
                instanceGetter = "undefined";
            } else if (getInstance == 'null') {
                instanceGetter = "null";
            } else
                instanceGetter = "function(test){return " + getInstance + ";}";
        } else {
            instanceGetter = "undefined";
        }
        html += "<script>\n";
        if (manual)
            html += "setup({explicit_done: true, explicit_timeout: true});\n"
        html += entryName + "('" + spec + "', JSON.parse(document.getElementById('idl').textContent), " + instanceGetter + ");\n";
        html += "</script>\n";
        return html;
    }
    function processInterface(def, doc) {
        var options = $.options;
        var type = def.type;
        var name = def.name;
        var getInstance;
        var async;
        if (!!options['instances'] && !!options['instances'][name]) {
            getInstance = options['instances'][name];
            async = false;
        } else if (!!options['instancesAsync'] && !!options['instancesAsync'][name]) {
            getInstance = options['instancesAsync'][name];
            async = true;
        } else {
            if ($.options['warnOnMissingInstanceGetter'])
                console.warn('[W]: ' + 'Missing instance getter for ' + name + '.');
            return;
        }
        var manual = requiresManualTest(name);
        var testFileName = makeTestFileName(def, doc, manual);
        if (!!testFileName) {
            var testContent = buildInterfaceTest(options['spec'], [def], getInstance, async, getHelper(name), manual);
            var testFile = path.normalize(path.join(options['testDirectory'], testFileName));
            fs.writeFileSync(testFile, testContent, {encoding: options['outputFileEncoding']});
        }
    }
    function hasExtendedAttribute(def, attr) {
        var eas = def.extAttrs || [];
        for (var i in eas) {
            var ea = eas[i];
            if (ea.name == attr)
                return true;
        }
        return false;
    }
    function hasConstantMember(def) {
        var members = def.members;
        for (var i in members) {
            var member = members[i];
            if (member.type == 'const')
                return true;
        }
        return false;
    }
    function getHelper(name) {
        var helpers = $.options.helpers;
        if (!!helpers) {
            var index = helpers.indexOf(name);
            if (index >= 0) {
                return helpers[index];
            }
        }
        return undefined;
    }
    function makeTestFileName(def, doc, manual) {
        var sep = '-';
        if (def.type == 'callback interface')
            return makeCallbackInterfaceTestFileName(def, doc, manual, sep);
        else if (def.type == 'exception')
            return makeExceptionTestFileName(def, doc, manual, sep);
        else if (def.type == 'implements')
            return makeImplementsTestFileName(def, doc, manual, sep);
        else if (def.type == 'interface')
            return makeInterfaceTestFileName(def, doc, manual, sep);
        else
            return null;
    }
    function makeCallbackInterfaceTestFileName(def, doc, manual, sep) {
        return makeInterfaceTestFileName(def, doc, manual, sep);
    }
    function makeExceptionTestFileName(def, doc, manual, sep) {
        return makeInterfaceTestFileName(def, doc, manual, sep);
    }
    function makeImplementsTestFileName(def, doc, manual, sep) {
        var target = def.target;
        if (manual)
            target += sep + 'manual';
        return [$.options['spec'], 'interface', def.implements, 'implemented', 'by', target].join(sep) + '.html';
    }
    function makeInterfaceTestFileName(def, doc, manual, sep) {
        var name = def.name;
        if (def.partial) {
            var partials = $.partials;
            var partialIndex;
            if (name in partials)
                partialIndex = partials['name'];
            else
                partialIndex = 0;
            partials['name'] = ++partialIndex;
            name += sep + 'partial' + sep + partialIndex;
        }
        var type = def.type;
        if (type == 'callback interface')
            type = 'interface';
        if (manual)
            name += sep + 'manual';
        return [$.options['spec'], type, name].join(sep) + '.html';
    }
    function buildInterfaceTest(spec, defs, getInstance, async, helper, manual) {
        assert.ok(util.isArray(defs) && (defs.length > 0));
        var def = defs[0];
        var type = capitalize(def.type);
        var html = getTestPreamble();
        html += "<title>" + def.name + " " + type + " Signature Tests</title>\n";
        html += getTestScripts(def, helper);
        html += "<h1>Test " + type + " " + def.name + " Signature</h1>\n";
        html += "<div id='log'></div>\n";
        var entryName = async ? 'level1Async' : 'level1';
        var instanceGetter;
        if (!!getInstance) {
            if (getInstance == 'undefined') {
                if ($.options['warnOnUndefinedInstanceGetter']) {
                    console.warn('[W]: ' + 'Undefined instance getter for ' + def.name + '.');
                }
                instanceGetter = "undefined";
            } else if (getInstance == 'null') {
                instanceGetter = "null";
            } else {
                instanceGetter = "function(test){return " + getInstance + ";}";
            }
        } else {
            instanceGetter = "undefined";
        }
        html += "<script>\n";
        if (manual)
            html += "setup({explicit_done: true, explicit_timeout: true});\n"
        html += entryName + "('" + spec + "', JSON.parse(document.getElementById('idl').textContent), " + instanceGetter + ");\n";
        html += "</script>\n";
        return html;
    }
    function requiresManualTest(name) {
        var options = $.options;
        return !!options['manual'] && (options.manual.indexOf(name) >= 0);
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
    function processOutput() {
        var options = $.options;
        var output;
        if (!!options['outputFile'])
            output = fs.createWriteStream(options['outputFile'], {encoding: options['outputFileEncoding']});
        else
            output = process.stdout;
        if (!!output) {
            output.on('finish', $.onOutputDone);
            output.end();
        } else
            throw "No output stream!";
    }
    $.run(process.argv);
})();
