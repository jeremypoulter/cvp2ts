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
        inputFileEncoding : 'utf8',
        inputFile : undefined,
        local : undefined,
        other : [],
        outputFile : undefined,
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
        input : null,
        inputData : '',
        document : null,
        output : null,
        numTestStreams : 0,
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
                    processCallbacks(doc);
                    processDictionaries(doc);
                    processExceptions(doc);
                    processInterfaces(doc);
                    processImplements(doc);
                }
            } catch(e) {
                setTimeout(function() { $.onFatalException(e); }, 0);
            }
        },
        onTestOutputOpen : function() {
            var s = this;
            $.numTestStreams++;
            s.on('finish', $.onTestOutputDone);
            s.end(s.getContent());
        },
        onTestOutputDone : function() {
            if (--$.numTestStreams < 1)
                processOutput();
        },
        onTestOutputError : function(e) {
            if (--$.numTestStreams < 1)
                processOutput();
        },
        onOutputDone : function() {
            if ($.numTestStreams < 1)
                process.exit(0);
            else
                setTimeout(function() { $.onOutputDone(); }, 0);
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
                    console.warn('Generating tests from ' + ((input !== process.stdin) ? options['inputFile'] : 'STDIN') + ' ...');
            } catch(e) {
                setTimeout(function() { $.onFatalException(e); }, 0);
            }
        },
    };
    function defaultOptions() {
        return defaults;
    }
    function processCallbacks(doc) {
    }
    function processDictionaries(doc) {
    }
    function processExceptions(doc) {
    }
    function processInterfaces(doc) {
        _(doc).filter(function (def) {
            return def.type == 'interface';
        }).forEach(function (def) {
            processInterface(def, doc);
        });
    }
    function processInterface(def, doc) {
        var options = $.options;
        var spec = options['spec'];
        var name = def.name;
        var type = def.type;
        var testFile = path.normalize(path.join(options['testDirectory'], [spec, type, name].join('-') + '.html'));
        var testOutput = fs.createWriteStream(testFile, {encoding: options['outputFileEncoding']});
        var instanceGetters = options['instances'];
        var instanceGetter = 'undefined';
        if (!!instanceGetters && !!instanceGetters[name])
            instanceGetter = instanceGetters[name];
        testOutput.getContent = function() { return buildTest(spec, name, type, def, instanceGetter); };
        testOutput.on('open', $.onTestOutputOpen);
        testOutput.on('error', $.onTestOutputError);
        
    }
    function processImplements(doc) {
    }
    function buildTest(spec, name, type, idl, getInstance) {
        var type = capitalize(type);
        var html = "";
        html += "<!-- Copyright (C) 2014, Cable Television Laboratories, Inc. & Skynav, Inc. -->\n";
        html += "<!-- DO NOT EDIT! This test was generated by $(CVP2TS)/tools/level1/generate/generate.js. -->\n";
        html += "<!doctype html>\n";
        html += "<meta charset='utf-8'>\n";
        html += "<title>" + name + " " + type + " Signature Tests</title>\n";
        html += "<script src='/resources/testharness.js'></script>\n";
        html += "<script src='/resources/testharnessreport.js'></script>\n";
        html += "<script src='/tools/common/level1.js'></script>\n";
        html += "<script type='text/plain' id='idl'>\n";
        html += JSON.stringify(idl) + "\n";
        html += "</script>\n";
        html += "<h1>Test " + type + " " + name + " Signature</h1>\n";
        html += "<div id='log'></div>\n";
        html += "<script>\n";
        html += "level1('" + spec + "', JSON.parse(document.getElementById('idl').textContent), function() { return " + getInstance + "; });\n";
        html += "</script>\n";
        return html;
    }
    function capitalize(s) {
        if (s.length > 0) {
            var first = String.fromCharCode(s.charCodeAt(0));
            var remainder = s.substring(1);
            return first.toUpperCase() + remainder;
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
