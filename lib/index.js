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
        formatter = new formatter();
    }

    return formatter;
}

module.exports = exports = function(options) {
    var cwd = process.cwd(),
        basePath = options.basePath || cwd,
        importPaths = options.importPaths || [cwd];

    var container = new transpiler.Container({
        resolvers: [new FileResolver(importPaths)],
        formatter: formatterFor(options.formatter)
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

        var relativePath = path.relative(basePath, file.path);
        var module = new transpiler.Module(file.path, relativePath, container);
        module.name = relativePath.replace(/\.js$/, '');
        module.src = file.contents.toString(encoding);

        container.addModule(module);

        callback();
    }

    function flush(callback) {
        var modules = container.getModules(),
            hasSingleModule = modules.length === 1,
            moduleName = options.moduleName || (hasSingleModule && modules[0].name) || 'default',
            sourceMapName = path.basename(moduleName);

        container.convert().forEach(function(converted) {
            var file = new gutil.File({
                    path: moduleName + '.js',
                    contents: converted.contents
                });

            var rendered = recast.print(converted, {
                sourceMapName: sourceMapName
            });

            if (rendered.map) {
                rendered.code += '\n\n//# sourceMappingURL=' + sourceMapName + '.map';
                file.contents = new Buffer(rendered.code);

                sourceMap(file, rendered.map);
            } else {
                file.contents = new Buffer(rendered.code);
            }

            this.push(file);
        }.bind(this));

        callback();
    }

    return through.obj(transform, flush);
};

exports.formatters = transpiler.formatters;
