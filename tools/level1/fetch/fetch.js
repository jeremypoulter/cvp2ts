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
    var http            = require('http');
    var https           = require('https');
    var path            = require('path');
    var stream          = require('stream');
    var url             = require('url');
    var util            = require('util');
    var cheerio         = require('cheerio');
    var defaults        = {
        configFile : undefined,
        configFileEncoding : 'utf8',
        dontFetch : false,
        dontFetchReason : undefined,
        force : false,
        inputFileEncoding : 'utf8',
        inputFile : undefined,
        local : undefined,
        other : [],
        outputFile : undefined,
        outputFileEncoding : 'utf8',
        phase : 'fetch',
        source : undefined,
        spec : 'unknown',
        specDirectory : undefined,
        verbose : false
    };
    var $               = {
        /* state */
        options : {},
        input : null,
        inputData : '',
        lastModifiedCached : NaN,
        lastModifiedCurrent : NaN,
        method : '',
        output : null,
        url : null,
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
                $.lastModifiedCached = Date.parse($.inputData);
                setTimeout(function() { $.onFetch('HEAD'); }, 0);
            } catch (e) {
                setTimeout(function() { $.onFatalException(e); }, 0);
            }
        },
        onFetch : function(method) {
            try {
                var requestOptions = { method: method };
                _.assign(requestOptions, $.url);
                var protocol = requestOptions.protocol;
                if (protocol.charAt(protocol.length - 1) == ':')
                    protocol = protocol.substring(0, protocol.length - 1);
                var request;
                if (protocol == 'http')
                    request = http.request(requestOptions);
                else if (protocol == 'https')
                    request = https.request(requestOptions);
                else
                    throw "Unsupported protocol '" + protocol + "'!";
                request.on('response', $.onFetchResponse);
                request.end();
                $.method = method;
            } catch (e) {
                setTimeout(function() { $.onFatalException(e); }, 0);
            }
        },
        onFetchResponse : function(response) {
            if ($.method === 'HEAD')
                $.onHeadResponse(response);
            else if ($.method === 'GET')
                $.onGetResponse(response);
            else
                setTimeout(function() { $.onFatalException('Unknown method response!'); }, 0);
        },
        onHeadResponse : function(response) {
            var fetchRequired = !!$.options['force'];
            if (response.statusCode == 200) {
                var lastModifiedCurrent = Date.parse(response.headers['last-modified']);
                if (_.isNaN(lastModifiedCurrent))
                    lastModifiedCurrent = Date.now();
                if (!_.isNaN($.lastModifiedCached)) {
                    if (lastModifiedCurrent > $.lastModifiedCached)
                        fetchRequired = true;
                } else
                    fetchRequired = true;
                if (!fetchRequired) {
                    if (!!$.options['outputFile']) {
                        if (!fs.existsSync($.options['outputFile']))
                            fetchRequired = true;
                        else {
                            var stats = fs.statSync($.options['outputFile']);
                            if (stats.size == 0)
                                fetchRequired = true;
                        }
                    }
                }
                $.lastModifiedCurrent = lastModifiedCurrent;
            }
            var spec = $.options['spec'];
            if (fetchRequired) {
                if ($.options['verbose'])
                    console.warn('[I]: ' + 'Fetching spec ' + spec + ' from ' + url.format($.url) + ' ...');
                setTimeout(function() { $.onFetch('GET'); }, 0);
            } else {
                if ($.options['verbose'])
                    console.warn('[I]: ' + 'Skipping spec ' + spec + ': cached copy available, last modified on ' + new Date($.lastModifiedCurrent).toUTCString() + '.');
                setTimeout(function() { $.onOutputLastModifiedDone(); }, 0);
            }
        },
        onGetResponse : function(response) {
            try {
                if (response.statusCode == 200) {
                    var lastModifiedCurrent = Date.parse(response.headers['last-modified']);
                    if (!_.isNaN(lastModifiedCurrent)) {
                        if (lastModifiedCurrent > $.lastModifiedCurrent)
                            $.lastModifiedCurrent = lastModifiedCurrent;
                    }
                    var output;
                    if (!!$.options['outputFile'])
                        output = fs.createWriteStream($.options['outputFile'], {encoding: $.options['outputFileEncoding']});
                    if (!!output) {
                        output.on('finish', $.onOutputDone);
                        $.output = output;
                    } else
                        throw "No output stream!";
                    response.on('data', $.onGetResponseData);
                    response.on('end', $.onGetResponseEnd);
                    response.on('error', $.onGetResponseError);
                } else if (response.statusCode/100 == 3) {
                    throw "No support for 3XX response code (" + response.statusCode + ")!";
                } else if (response.statusCode/100 == 4) {
                    throw "Resource not available (" + response.statusCode + ")!";
                } else if (response.statusCode/100 == 5) {
                    throw "Server error (" + response.statusCode + ")!";
                } else
                    throw "Unexpected response code (" + response.statusCode + ")!";
            } catch (e) {
                setTimeout(function() { $.onFatalException(e); }, 0);
            }
        },
        onGetResponseData : function(chunk) {
            try {
                $.output.write(chunk);
            } catch (e) {
                setTimeout(function() { $.onFatalException(e); }, 0);
            }
        },
        onGetResponseEnd : function() {
            try {
                $.output.end();
            } catch (e) {
                setTimeout(function() { $.onFatalException(e); }, 0);
            }
        },
        onGetResponseError : function() {
            setTimeout(function() { $.onFatalException('Response error!'); }, 0);
        },
        onOutputDone : function() {
            try {
                if (!_.isNaN($.lastModifiedCurrent)) {
                    if (!!$.options['inputFile']) {
                        var lastModifiedOutput = fs.createWriteStream($.options['inputFile'], {encoding: $.options['inputFileEncoding']});
                        lastModifiedOutput.on('finish', $.onOutputLastModifiedDone);
                        lastModifiedOutput.write(new Date($.lastModifiedCurrent).toUTCString());
                        lastModifiedOutput.end();
                    } else
                        setTimeout(function() { $.onOutputLastModifiedDone(); }, 0);
                } else
                    setTimeout(function() { $.onOutputLastModifiedDone(); }, 0);
            } catch (e) {
                setTimeout(function() { $.onFatalException(e); }, 0);
            }
        },
        onOutputLastModifiedDone : function() {
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
                if (!!options['dontFetch']) {
                    if (options['verbose']) {
                        var reason;
                        if (!!options['dontFetchReason'])
                            reason = options['dontFetchReason'];
                        else if (!!options['dontExtract'])
                            reason = "manual extraction required";
                        console.warn('[I]: ' + 'Skipping spec ' + options['spec'] + ' fetch' + (!!reason ? ': ' + reason : '') + '.');
                    }
                    return;
                }
                var input;
                if (!!options['source'])
                    $.url = url.parse(options['source']);
                else
                    throw "No specification source!";
                if (!!options['inputFile']) {
                    if (fs.existsSync(options['inputFile'])) {
                        input = fs.createReadStream(options['inputFile'], {encoding: options['inputFileEncoding']});
                        if (!!input) {
                            input.on('data', $.onInputData);
                            input.on('end', $.onInputDone);
                            input.resume();
                            $.input = input;
                        }
                    } else
                        setTimeout(function() { $.onInputDone(); }, 0);
                }
                $.options = options;
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
