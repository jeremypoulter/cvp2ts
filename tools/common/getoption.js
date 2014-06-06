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
    var common          = './';
    var commonOptions   = require(common + 'options.js');
    var console         = require('console');
    var util            = require('util');
    var defaults        = {
        configFile : undefined,
        configFileEncoding : 'utf8',
        cleanFetch : true,
        cleanExtract : true,
        dontFetch : false,
        dontExtract : false,
        other: [],
        spec : 'unknown',
        specDirectory : undefined,
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
        processInputFileOption : function(options, other, defaults) {
            return options;
        },
        processOutputFileOption : function(options, other, defaults) {
            return options;
        },
        run : function(argv) {
            var rv = 0;
            try {
                var options = commonOptions.readOptions(argv, defaultOptions(), $);
                if (options.other.length > 0) {
                    var propertyName = options.other[0];
                    util.puts(options[propertyName]);
                } else
                    console.error('[E]: ' + 'Missing property name argument!');
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
