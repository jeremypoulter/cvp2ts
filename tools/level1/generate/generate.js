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
                $.document = JSON.parse($.inputData);
                setTimeout($.onProcessDocument, 0);
            } catch (e) {
                setTimeout(function() { $.onFatalException(e); }, 0);
            }
        },
        onProcessDocument : function() {
            var doc = $.document;
            if (!!doc) {
                processCallbacks(doc);
                processDictionaries(doc);
                processExceptions(doc);
                processInterfaces(doc);
                processImplements(doc);
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
                    if (!!options['specDirectory'] && !!options['spec'])
                        options['inputFile'] = path.normalize(path.join(options['specDirectory'], '.cache', options['spec'] + '.idl'));
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
        $.output.write('testInterface' + def.name + '();\n');
    }
    function processImplements(doc) {
    }
    $.run(process.argv);
})();
