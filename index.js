var es = require("event-stream");
var Compiler = require("es6-module-transpiler").Compiler;
var path = require("path");

module.exports = function (opts) {
    "use strict";

    // see "Writing a plugin"
    // https://github.com/wearefractal/gulp/wiki/Writing-a-gulp-plugin
    function es6ModuleTranspiler(file, callback) {
        // check if file.contents is a `Buffer`
        if (file.contents instanceof Buffer) {
            var moduleName = null,
                ext = path.extname(file.path),
                method,
                contents,
                compiler;

            if (typeof opts.moduleName === "string") {
                moduleName = opts.moduleName;
            } else {
                moduleName = file.relative.slice(0, -ext.length);

                if (opts.moduleName) {
                    moduleName = opts.moduleName(moduleName, file);
                }
            }

            if(opts.namespace){
                moduleName =  opts.namespace+"/"+moduleName;
            }
            
            compiler = new Compiler(String(file.contents), moduleName, opts);

            switch (opts.type) {
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

            contents = compiler[method].call(compiler);
            file.contents = new Buffer(contents);

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
