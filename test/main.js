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

	it("should pass file when it isNull()", function (done) {
		var stream = es6ModuleTranspiler();
		var emptyFile = {
			isNull: function () { return true; }
		};
		stream.on("data", function (data) {
			data.should.equal(emptyFile);
			done();
		});
		stream.write(emptyFile);
	});

	it("should emit error when file isStream()", function (done) {
		var stream = es6ModuleTranspiler();
		var streamFile = {
			isNull: function () { return false; },
			isStream: function () { return true; }
		};
		stream.on("error", function (err) {
			err.message.should.equal("streams not supported");
			done();
		});
		stream.write(streamFile);
	});

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
				} else if(file === 'export-modname.js') {
					streamOpts = {
						type: type,
						moduleName: function(name, file) {
							return 'foo/bar';
						}
					};
				} else if(file === 'export-modprefix.js') {
					streamOpts = {
						type: type,
						prefix: 'js',
						moduleName: function(name, file) {
							return 'foo/bar';
						}
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
		});
	});
});
