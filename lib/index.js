'use strict'

var gutil   = require('gulp-util')
var path    = require('path')
var through = require('through2')
var applySourceMap = require('vinyl-sourcemaps-apply')

var transpiler = require('es6-module-transpiler')
var Container  = transpiler.Container
var FileResolver = transpiler.FileResolver
var Module     = require("es6-module-transpiler/lib/module");
var recast     = require('es6-module-transpiler/node_modules/recast')

var DefaultFormatter = transpiler.formatters[transpiler.formatters.DEFAULT]
var ResolveMock      = { resolveModule: function() {} }

module.exports = exports = function(opts) {
  var container = new Container({
    resolvers: [new FileResolver([process.cwd()])],
    formatter: opts && opts.formatter || new DefaultFormatter
  })

  var files = {}

  function transform(file, enc, callback) {
    if (file.isNull()) {
      callback(null, file)
      return
    }

    if (file.isStream()) {
      callback(new gutil.PluginError(
        'gulp-es6-module-transpiler',
        'Streaming not supported'
      ))
      return
    }

    var module = new Module(file.path, file.path, container)
    module.name = path.relative(file.base, file.path).replace(/\.js$/, '')
    module.src = file.contents.toString(enc)
    container.addModule(module)

    files[file.path] = file

    callback()
  }

  function flush(callback) {
    var self = this
    container.convert().forEach(function(converted) {
      var file = converted.filename && converted.filename in files
        ? files[converted.filename]
        : new gutil.File({ path: 'bundle.js' })

      var rendered = recast.print(converted, {
        sourceMapName: path.basename(file.path)
      })
      file.contents = new Buffer(rendered.code)

      if (rendered.map) {
        applySourceMap(file, rendered.map)
      }

      self.push(file)
    })

    callback()
  }

  return through.obj(transform, flush)
}

exports.formatters = transpiler.formatters
