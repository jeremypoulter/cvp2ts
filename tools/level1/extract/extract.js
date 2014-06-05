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
    var common          = './../../common/';
    var commonOptions   = require(common + 'options.js');
    var console         = require('console');
    var fs              = require('fs');
    var path            = require('path');
    var stream          = require('stream');
    var util            = require('util');
    var cheerio         = require('cheerio');
    var defaults        = {
        configFile : undefined,
        configFileEncoding : 'utf8',
        dontExtract : false,
        inputFileEncoding : 'utf8',
        inputFile : undefined,
        local : undefined,
        other : [],
        outputFile : undefined,
        outputFileEncoding : 'utf8',
        phase : 'extract',
        source : undefined,
        spec : 'unknown',
        specDirectory : undefined,
        verbose : false
    };
    var $               = {
        /* state */
        input : null,
        inputData : '',
        document : null,
        output : null,
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
                $.document = cheerio.load($.inputData);
                setTimeout($.onProcessDocument, 0);
            } catch (e) {
                setTimeout(function() { $.onFatalException(e); }, 0);
            }
        },
        onProcessDocument : function() {
            var doc = $.document;
            if (!!doc) {
                var idlCount = 0;
                if (!idlCount) {
                    doc('.idl').filter(':not(.extract)').each(
                        function(i, e) {
                            $.output.write('\n' + doc(e).text() + '\n');
                            ++idlCount;
                        }
                    );
                }
                if (!idlCount) {
                    doc('.idl-code').filter(':not(.extract)').each(
                        function(i, e) {
                            $.output.write('\n' + doc(e).text() + '\n');
                            ++idlCount;
                        }
                    );
                }
            }
            $.output.end();
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
                    if (!!options['specDirectory'] && !!options['local'])
                        options['inputFile'] = path.normalize(path.join(options['specDirectory'], options['local']));
                }
            }
            return options;
        },
        processOutputFileOption : function(options, other, defaults) {
            if (!options['outputFile']) {
                if (other.length > 0)
                    options['outputFile'] = other.shift();
                else if (!!options['specDirectory'] && !!options['spec'])
                    options['outputFile'] = path.join(options['specDirectory'], options['spec'] + '.idl');
            }
            return options;
        },
        run : function(argv) {
            try {
                var options = commonOptions.readOptions(argv, defaultOptions(), $);
                if (!!options['dontExtract']) {
                    if (options['verbose'])
                        console.warn('[I]: ' + 'Skipping ' + options['spec'] + ' IDL extraction.');
                    return;
                }
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
                var output;
                if (!!options['outputFile'])
                    output = fs.createWriteStream(options['outputFile'], {encoding: options['outputFileEncoding']});
                else
                    output = process.stdout;
                if (!!output) {
                    output.on('finish', $.onOutputDone);
                    $.output = output;
                } else
                    throw "No output stream!";
                if (options['verbose'])
                    console.warn('[I]: ' + 'Extracting IDL from ' + ((input !== process.stdin) ? options['inputFile'] : 'STDIN') + ' ...');
            } catch(e) {
                setTimeout(function() { $.onFatalException(e); }, 0);
            }
        },
    };
    function defaultOptions() {
        return defaults;
    }
    $.run(process.argv);
})();
