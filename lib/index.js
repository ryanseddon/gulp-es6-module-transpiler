'use strict';

var gutil      = require('gulp-util');
var path       = require('path');
var through    = require('through2');
var sourceMap  = require('vinyl-sourcemaps-apply');
var transpiler = require('es6-module-transpiler');
var path       = require('path');

// this is dirty, I know - however, installing an own version
// of reacast can lead to errors because of gulp-es6mt and
// es6-module-transpiler using different instances of recast
var recast     = require('es6-module-transpiler/node_modules/recast');

var FileResolver = transpiler.FileResolver;

function formatterFor(name) {
    name = name || transpiler.formatters.DEFAULT;

    var type = typeof(name),
        formatter;

    if (name in transpiler.formatters) {
        formatter = transpiler.formatters[name];
    } else if (type === 'object' || type === 'function') {
        formatter = name;
    }

    if (typeof(formatter) === 'function') {
        /* jshint newcap:false */
        formatter = new formatter();
    }

    return formatter;
}

module.exports = exports = function(options) {
    options = options || {};

    var basePath = options.basePath || process.cwd(),
        bundleFileName = options.bundleFileName,
        importPaths = options.importPaths || [basePath],
        resolver = new FileResolver(importPaths),
        formatter = formatterFor(options.formatter);

    var container = new transpiler.Container({
        resolvers: [resolver],
        formatter: formatter,
        basePath: basePath
    });

    function transform(file, encoding, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            return callback(new gutil.PluginError(
                'gulp-es6-module-transpiler',
                'Streaming not supported'
            ));
        }

        var relativePath = path.relative(basePath, file.path),
            moduleName = relativePath.replace(/\.js$/, ''),
            module = new transpiler.Module(file.path, relativePath, container);

        module.name = moduleName;
        module.src = file.contents.toString(encoding);

        container.addModule(module);
        callback();
    }

    function flush(callback) {
	    try {
		    /* jshint validthis:true */
		    var stream = this;

            var modules = container.getModules();
            var defaultFilename = bundleFileName || (modules.length === 1 ? modules[0].name  + '.js' : 'bundle.js');

            container.convert().forEach(function(converted) {
                var filename = converted.filename || defaultFilename;

                var convertedAsFile = new gutil.File({
                    path: filename
                });

                var rendered = recast.print(converted, {
                    sourceMapName: filename
                });

                convertedAsFile.contents = new Buffer(rendered.code);

                var printSourceMaps = (options.sourceMaps !== false) && rendered.map;
                if (printSourceMaps) {
                    sourceMap(convertedAsFile, rendered.map);
                }

                stream.push(convertedAsFile);
            });
            callback();
        } catch(error) {
            if (error.message && error.message.indexOf('missing module import') > -1) {
                return callback(new gutil.PluginError(
                    'gulp-es6-module-transpiler',
                    error.message + '. Looking in: ' + JSON.stringify(importPaths)
                ));
            }

            return callback(error);
        }
    }

    return through.obj(transform, flush);
};

exports.formatters = transpiler.formatters;
