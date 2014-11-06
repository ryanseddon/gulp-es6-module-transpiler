"use strict";

var path = require("path");
var es = require("event-stream");
var transpiler = require("es6-module-transpiler");
var Container = transpiler.Container;
var FileResolver = transpiler.FileResolver;
var BundleFormatter = transpiler.formatters.bundle;
var CommonjsFormatter = transpiler.formatters.commonjs;

module.exports = function (opts) {

	// see "Writing a plugin"
	// https://github.com/wearefractal/gulp/wiki/Writing-a-gulp-plugin
	function es6ModuleTranspiler(file, callback) {
		// check if file.contents is a `Buffer`
		if (file.contents instanceof Buffer) {
			var contents,
				Formatter,
				container;

			if (opts.type && opts.type === "cjs"){
				Formatter = CommonjsFormatter;
			} else {
				Formatter = BundleFormatter;
			}

			container = new Container({
				resolvers: [new FileResolver([path.resolve(__dirname, file.path)])],
				formatter: new Formatter()
			});

			container.getModule(path.resolve(__dirname, file.path));
			contents = container.transform();
			var content = contents[0].code;
console.log('contents------------')
console.log(content)
			file.contents = new Buffer(contents);
console.log(container)
			callback(null, file);
		} else { // assume it is a `stream.Readable`
			// http://nodejs.org/api/stream.html
			// http://nodejs.org/api/child_process.html
			// https://github.com/dominictarr/event-stream

			// accepting streams is optional
			callback(new Error("gulp-es6-module-transpiler: streams not supported"), undefined);
		}
	}

	return es.map(es6ModuleTranspiler);
};
