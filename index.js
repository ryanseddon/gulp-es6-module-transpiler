var es = require("event-stream");
var Compiler = require("es6-module-transpiler").Compiler;
var fs = require("fs");
var path = require("path");

module.exports = function (opts) {
	"use strict";

	// if(typeof name == 'object') {
	// 	opts = name;
	// 	//name = '';
	// }

	// see "Writing a plugin"
	// https://github.com/wearefractal/gulp/wiki/Writing-a-gulp-plugin
	function es6ModuleTranspiler(file, callback) {
		// check if file.contents is a `Buffer`
		if (file.contents instanceof Buffer) {
			var moduleName,
				ext = path.extname(file.path),
				method,
				contents,
				compiler;

			if (opts.anonymous) {
				moduleName = '';
			} else if (typeof opts.moduleName === 'string') {
				moduleName = opts.moduleName;
			} else {
				moduleName = file.relative.slice(0, -ext.length);

				if (opts.moduleName) {
					moduleName = opts.moduleName(moduleName, file);
				}
			}

			compiler = new Compiler(String(file.contents), moduleName, opts);

			switch(opts.type) {
				case "amd":
					method = "toAMD";
					break;
				case "cjs":
					method = "toCJS";
					break;
				case "yui":
					method = "toYUI";
					break;
				default:
					method = "toGlobals";
			}

			contents = compiler[method].apply(compiler);
			file.contents = new Buffer(String(contents));

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
