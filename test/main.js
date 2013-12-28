/*global describe, it*/
"use strict";

var fs = require("fs"),
	es = require("event-stream"),
	should = require("should");
require("mocha");

var gutil = require("gulp-util"),
	es6ModuleTranspiler = require("../"),
	fixtures = fs.readdirSync(process.cwd() + "/test/fixtures");

describe("gulp-es6ModuleTranspiler", function () {

	fixtures.forEach(function(file) {
		var expected = file.replace('.js', '.amd.js');

		var expectedFile = new gutil.File({
			path: "test/expected/" + expected,
			cwd: "test/",
			base: "test/expected",
			contents: fs.readFileSync("test/expected/" + expected)
		});

		it("should produce expected file via buffer", function (done) {

			var srcFile = new gutil.File({
				path: "test/fixtures/" + file,
				cwd: "test/",
				base: "test/fixtures",
				contents: fs.readFileSync("test/fixtures/" + file)
			});

			var stream = es6ModuleTranspiler({type: 'amd'});

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

			var stream = es6ModuleTranspiler({type: 'amd'});

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
