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
    var fs              = require('fs');
    var path            = require('path');
    var util            = require('util');
    var defaults        = {
        configFile : undefined,
        configFileEncoding : 'utf8',
        dontFetch : false,
        dontExtract : false,
        dryRun : false,
        other : [],
        phase : undefined,
        quiet : true,
        spec : 'unknown',
        specDirectory : undefined,
        testDirectoryRoot : undefined,
        verbose : false
    };
    var $               = {
        onFatalException : function(e) {
            util.error(util.inspect(e));
            process.exit(1);
        },
        removeFile : function(options, file) {
            try {
                if (fs.existsSync(file)) {
                    if (options.dryRun || options.verbose)
                        console.warn('[I]: ' + 'rm ' + file);
                    if (!options.dryRun)
                        fs.unlinkSync(file);
                }
            } catch (e) {
                if (!options.quiet)
                    throw e;
            }
        },
        removeDirectory : function(options, dir) {
            try {
                if (fs.existsSync(dir)) {
                    if (options.dryRun || options.verbose)
                        console.warn('[I]: ' + 'rmdir ' + dir);
                    if (!options.dryRun)
                        fs.rmdirSync(dir);
                }
            } catch (e) {
                if (!options.quiet)
                    throw e;
            }
        },
        removeDirectoryRecursively : function (options, dir) {
            if (!fs.existsSync(dir))
                return;
            _(fs.readdirSync(dir)).forEach(function(item) {
                var lf = path.resolve(dir, item);
                var st = fs.statSync(lf);
                if (st.isDirectory())
                    $.removeDirectoryRecursively(options, lf);
                else if (st.isFile()) {
                    $.removeFile(options, lf);
                }
            });
            $.removeDirectory(options, dir);
        },
        cleanFetch : function(options, specDirectory, spec, specOptions) {
            if (!specOptions['dontFetch']) {
                try {
                    if (!!specOptions['local']) {
                        var lf = path.resolve(specDirectory, specOptions['local']);
                        $.removeFile(options, lf);
                        $.removeFile(options, lf + '.lm');
                    }
                } catch (e) {
                    setTimeout(function() { $.onFatalException(e); }, 0);
                }
            }
        },
        cleanExtract : function(options, specDirectory, spec, specOptions) {
            if (!specOptions['dontExtract']) {
                try {
                    if (!!specDirectory && !!spec) {
                        var lf = path.resolve(specDirectory, spec + '.idl');
                        $.removeFile(options, lf);
                    }
                } catch (e) {
                    setTimeout(function() { $.onFatalException(e); }, 0);
                }
            }
        },
        cleanParse : function(options, specDirectory, spec, specOptions) {
            if (!specOptions['dontParse']) {
                try {
                    if (!!specDirectory && !!spec) {
                        var lf = path.resolve(specDirectory, spec + '.idl.json');
                        $.removeFile(options, lf);
                    }
                } catch (e) {
                    setTimeout(function() { $.onFatalException(e); }, 0);
                }
            }
        },
        cleanGenerate : function(options, specDirectory, spec, specOptions) {
            if (!specOptions['dontGenerate']) {
                try {
                    if (!!specDirectory && !!spec) {
                        var lf = path.resolve(specDirectory, spec + '.test.ts');
                        $.removeFile(options, lf);
                    }
                    if (!!options['testDirectoryRoot'] && !!spec) {
                        var td = path.resolve(options['testDirectoryRoot'], spec);
                        $.removeDirectoryRecursively(options, td);
                    }
                } catch (e) {
                    setTimeout(function() { $.onFatalException(e); }, 0);
                }
            }
        },
        cleanIndex : function(options, specDirectory, spec, specOptions) {
            try {
                if (!!specDirectory && !!spec) {
                    var lf = path.resolve(specDirectory, spec + '.idl.json');
                    $.removeFile(options, lf);
                }
            } catch (e) {
                setTimeout(function() { $.onFatalException(e); }, 0);
            }
        },
        clean : function(options, specDirectory, spec, specOptions) {
            if (options['phase'] === 'fetch')
                $.cleanFetch(options, specDirectory, spec, specOptions);
            else if (options['phase'] === 'extract')
                $.cleanExtract(options, specDirectory, spec, specOptions);
            else if (options['phase'] === 'parse')
                $.cleanParse(options, specDirectory, spec, specOptions);
            else if (options['phase'] === 'index')
                $.cleanIndex(options, specDirectory, spec, specOptions);
            else if (options['phase'] === 'generate')
                $.cleanGenerate(options, specDirectory, spec, specOptions);
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
                    for (var i in options.other) {
                        var fn = options.other[i];
                        var pn = path.dirname(fn);
                        var sp = path.basename(pn);
                        var cf = path.join(pn, sp + '.config.json');
                        var sd = { dontFetch: false, dontExtract: false, dontParse: false, dontGenerate: false};
                        var so = commonOptions.readOptions(['', '', '--config', cf], sd);
                        $.clean(options, pn, sp, so);
                    }
                }
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
