/*global describe, it*/
"use strict";

var fs = require("fs"),
	es = require("event-stream"),
	should = require("should");
require("mocha");

var gutil = require("gulp-util"),
	es6ModuleTranspiler = require("../"),
	fixtures = fs.readdirSync(process.cwd() + "/test/fixtures"),
	types = ['amd', 'cjs', 'yui', 'globals'];

describe("gulp-es6ModuleTranspiler:", function () {

	fixtures.forEach(function(file) {
		
		types.forEach(function(type) {
			var expected = file.replace('.js', '.'+ type +'.js'),
				streamOpts;
			
			var expectedFile = new gutil.File({
				path: "test/expected/" + expected,
				cwd: "test/",
				base: "test/expected",
				contents: fs.readFileSync("test/expected/" + expected)
			});

			it(file + " should produce expected "+ type +" module file via buffer", function (done) {

				var srcFile = new gutil.File({
					path: "test/fixtures/" + file,
					cwd: "test/",
					base: "test/fixtures",
					contents: fs.readFileSync("test/fixtures/" + file)
				});

				if(type === 'globals' && file === 'import.js') {
					streamOpts = {
						type: type,
						imports: { bar: 'Bar'}
					};
				} else if(type === 'amd' && file === 'export.js') {
					streamOpts = {
						type: type,
						moduleName: 'Bar'
					};
				} else {
					streamOpts = {
						type: type
					};
				}

				var stream = es6ModuleTranspiler(streamOpts);

				stream.on("error", function(err) {
					should.exist(err);
					done(err);
				});

				stream.on("data", function (newFile) {
					should.exist(newFile);
					should.exist(newFile.contents);

					String(newFile.contents).should.equal(String(expectedFile.contents));
					done();
				});

				stream.write(srcFile);
				stream.end();
			});

			it("should error on stream", function (done) {

				var srcFile = new gutil.File({
					path: "test/fixtures/" + file,
					cwd: "test/",
					base: "test/fixtures",
					contents: fs.createReadStream("test/fixtures/" + file)
				});

				var stream = es6ModuleTranspiler({type: type});

				stream.on("error", function(err) {
					should.exist(err);
					done();
				});

				stream.on("data", function (newFile) {
					newFile.contents.pipe(es.wait(function(err, data) {
						done(err);
					}));
				});

				stream.write(srcFile);
				stream.end();
			});
		});
	});
});
