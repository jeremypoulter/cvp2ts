"use strict";
var assert      = require('assert');
var fs          = require('fs');
var path        = require('path');
function mapOptionAlias(alias) {
    if (alias == 'config')
        alias = 'configFile';
    else if (alias == 'in')
        alias = 'inputFile';
    else if (alias == 'input')
        alias = 'inputFile';
    else if (alias == 'out')
        alias = 'outputFile';
    else if (alias == 'output')
        alias = 'outputFile';
    else
        alias = alias;
    return alias;
}
function readConfiguration(configFile, options, defaults) {
    var encoding = options['configFileEncoding'] || defaults['configFileEncoding'];
    var config = JSON.parse(fs.readFileSync(configFile, {encoding: encoding}));
    for (var name in config) {
        if (name in options)
            continue;
        else
            options[name] = config[name];
    }
    return options;
}
function processOptionDefaults(options, defaults) {
    for (var name in defaults) {
        if (name in options)
            continue;
        else
            options[name] = defaults[name];
    }
    return options;
}
function extractSpecDirectory(filePath) {
    /*
    var configPathComponents = path.dirname(filePath).split(path.sep);
    var parentComponent = (configPathComponents.length > 0) ? configPathComponents[configPathComponents.length - 1] : undefined;
    if (parentComponent == '.config')
        configPathComponents.pop();
    var specPath = configPathComponents.join(path.sep);
    if (specPath.lastIndexOf(path.sep) != (specPath.length - 1))
        specPath = specPath.concat(path.sep);
    return specPath;
    */
    return path.dirname(filePath);
}
function processSpecDirectoryOption(options, defaults) {
    if (!options['specDirectory']) {
        var configFile = options['configFile'];
        if (!!configFile)
            options['specDirectory'] = extractSpecDirectory(configFile);
        else if (!!options['inputFile'])
            options['specDirectory'] = extractSpecDirectory(options['inputFile']);
    }
    return options;
}
function processInputFileOption(options, other, defaults, handler) {
    return handler.processInputFileOption(options, other, defaults);
}
function processOutputFileOption(options, other, defaults, handler) {
    return handler.processOutputFileOption(options, other, defaults);
}
function processOptions(options, defaults, handler) {
    // merge configuration
    var configFile = options['configFile'];
    if (!!configFile)
        options = readConfiguration(configFile, options, defaults);
    // merge defaults
    options = processOptionDefaults(options, defaults);
    // specific option processing
    var other = options['other'];
    options = processSpecDirectoryOption(options, defaults);
    options = processInputFileOption(options, other, defaults, handler);
    options = processOutputFileOption(options, other, defaults, handler);
    return options;
}
function readOptions(argv, defaults, handler) {
    var options = {};
    assert(!!argv, 'missing argument array');
    assert(argv.length >= 2, 'missing argument');
    argv.shift();
    argv.shift();
    while (argv.length > 0) {
        var a1 = argv.shift();
        var name, value;
        if (a1.indexOf('--') == 0) {
            name = a1.substr(2);
            if (!name.length)
                break;
            else
                name = mapOptionAlias(name);
            if (argv.length > 0) {
                var a2 = argv.shift();
                if (a2.indexOf('--') == 0)
                    argv.unshift(a2);
                else if (a2.indexOf('\\--') == 0)
                    value = a2.substr(1);
                else
                    value = a2;
            }
        } else if (a1.indexOf('-') == 0) {
            switch (a1.substr(1)) {
            case 'v':
                name = 'verbose'; value = true;
                break;
            default:
                break;
            }
        } else {
            argv.unshift(a1);
            break;
        }
        if (name !== undefined) {
            options[name] = value;
        }
    }
    if (argv.length > 0) {
        var other = [];
        while (argv.length > 0) {
            other.push(argv.shift());
        }
        options['other'] = other;
    }
    return processOptions(options, defaults, handler);
}
exports.extractSpecDirectory = function(filePath) {
    return extractSpecDirectory(filePath);
}
exports.readOptions = function(argv, defaults, handler) {
    return readOptions(argv, defaults, handler);
}
