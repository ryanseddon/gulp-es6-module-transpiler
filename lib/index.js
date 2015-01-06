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
        importPaths = options.importPaths || [basePath],
        resolver = new FileResolver(importPaths),
        formatter = formatterFor(options.formatter);

    function transformStream(stream, callback) {
        var chunks = [],
            length = 0;

        function onRead() {
            var chunk = stream.read();
            if (chunk) {
                length += chunk.length;
                chunks.push(chunk);
            }
        }

        stream.on('error', callback);
        stream.on('readable', onRead);
        stream.once('end', function onEnd() {
            stream.removeListener('readable', onRead);

            callback(null, Buffer.concat(chunks, length));
        });
    }

    function transform(file, encoding, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            /* jshint validthis:true */
            return transformStream(file.contents, function(error, buffer) {
                if (error) {
                    return callback(error);
                }

                file.contents = buffer;

                transform.call(this, file, encoding, callback);
            }.bind(this));
        }

        var container = new transpiler.Container({
            resolvers: [resolver],
            formatter: formatter,
            basePath: basePath
        });

        var relativePath = path.relative(basePath, file.path),
            moduleName = relativePath.replace(/\.js$/, ''),
            module = new transpiler.Module(file.path, relativePath, container);

        module.name = moduleName;
        module.src = file.contents.toString(encoding);

        container.addModule(module);

        try {
            // One module was added, one module will be returned
            var converted = container.convert().pop();

            var convertedAsFile = new gutil.File({
                path: moduleName + '.js'
            });

            var rendered = recast.print(converted, {
                sourceMapName: moduleName
            });

            convertedAsFile.contents = new Buffer(rendered.code);

            var printSourceMaps = (options.sourceMaps !== false) && rendered.map;
            if (printSourceMaps) {
                sourceMap(convertedAsFile, rendered.map);
            }

            /* jshint validthis:true */
            this.push(convertedAsFile);

            callback();
        } catch(error) {
            if (error.message && error.message.indexOf('missing module import') > -1) {
                throw new Error(error.message + '. Looking in: ' + JSON.stringify(importPaths));
            }

            return callback(error);
        }
    }

    return through.obj(transform);
};

exports.formatters = transpiler.formatters;
