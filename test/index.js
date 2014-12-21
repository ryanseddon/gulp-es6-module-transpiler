'use strict';

require('mocha');

var fs = require('fs');
var tempWrite = require('temp-write');
var es6 = require('es6-module-transpiler');

var expect = require('expect.js');

var gutil = require('gulp-util'),
    transpiler = require('../lib/index');

var inputDir = __dirname + '/input/main/',
    altInputDir = __dirname + '/input/alternative/';

describe('gulp-es6-module-transpiler', function() {
    function make(options) {
        var output = tempWrite.sync('gulp-es6-module-transpiler', options.output);

        var container = new es6.Container({
            resolvers: [new es6.FileResolver(options.importPaths || [inputDir])],
            formatter: new transpiler.formatters[options.formatter](),
            basePath: options.basePath
        });

        options.modules.forEach(function(module) {
            container.getModule(module);
        });

        container.write(output);

        return fs.readFileSync(output).toString('utf8');
    }

    function load(dir) {
        return fs.readdirSync(dir).reduce(function(hash, filename) {
            var withoutExtension = filename.replace(/\.js$/, '');

            hash[withoutExtension] = new gutil.File({
                cwd: __dirname,
                base: dir,
                path: dir + filename,
                contents: fs.readFileSync(dir + filename)
            });

            return hash;
        }, {});
    }

    function transpile(options, callback) {
        var stream = transpiler(options);

        stream.on('error', function(error) {
            expect(error).to.be.ok();

            callback(error);
        });

        stream.on('data', function (file) {
            expect(file).to.be.ok();

            callback(null, file);
        });

        options.sources.forEach(function(source) {
            stream.write(source);
        });

        stream.end();
    }

    function toString(file) {
        return file.contents.toString('utf8');
    }

    before(function() {
        this.inputs = load(inputDir);
        this.altInputs = load(altInputDir);
    });

    after(function() {
        delete this.inputs;
        delete this.altInputs;
    });

    describe('formatter', function() {
        it('should use DEFAULT if not specified', function(done) {
            transpile({
                sources: [this.inputs.default],
                basePath: inputDir
            }, function(error, output) {
                var expected = make({
                    modules: ['default'],
                    output: 'default',
                    formatter: transpiler.formatters.DEFAULT
                });

                expect(toString(output)).to.be(expected);

                done();
            }.bind(this));
        });

        it('should accept formatter instance', function(done) {
            transpile({
                sources: [this.inputs.default],
                basePath: inputDir,
                formatter: new transpiler.formatters.commonjs()
            }, function(error, output) {
                var expected = make({
                    modules: ['default'],
                    output: 'default',
                    formatter: 'commonjs'
                });

                expect(toString(output)).to.be(expected);

                done();
            }.bind(this));
        });

        it('should accept constructor function', function(done) {
            transpile({
                sources: [this.inputs.default],
                basePath: inputDir,
                formatter: transpiler.formatters.commonjs
            }, function(error, output) {
                var expected = make({
                    modules: ['default'],
                    output: 'default',
                    formatter: 'commonjs'
                });

                expect(toString(output)).to.be(expected);

                done();
            }.bind(this));
        });

        it('should accept string identifier', function(done) {
            transpile({
                sources: [this.inputs.default],
                formatter: 'commonjs',
                basePath: inputDir
            }, function(error, output) {
                var expected = make({
                    modules: ['default'],
                    output: 'default',
                    formatter: 'commonjs'
                });

                expect(toString(output)).to.be(expected);

                done();
            }.bind(this));
        });

        it('should throw error if no such formatter exists', function() {
            expect(function() {
                transpile({
                    sources: [this.inputs.default],
                    formatter: 'mongodb'
                }, function() {});
            }.bind(this)).to.throwError();
        });
    });

    describe('importPaths', function() {
        it('should use current working directory by default', function(done) {
            // dependencies of import.js are in altInputDir
            process.chdir(altInputDir);

            transpile({
                sources: [this.inputs.importAlt],
                formatter: 'commonjs',
                basePath: inputDir
            }, function(error, output) {
                var expected = make({
                    modules: ['importAlt'],
                    output: 'importAlt',
                    formatter: 'commonjs',
                    importPaths: [inputDir, altInputDir]
                });

                expect(toString(output)).to.be(expected);

                done();
            }.bind(this));
        });

        it('should accept array of strings', function(done) {
            transpile({
                sources: [this.altInputs.bar],
                formatter: 'commonjs',
                basePath: altInputDir,
                importPaths: [inputDir, altInputDir]
            }, function(error, output) {
                var expected = make({
                    modules: ['bar'],
                    output: 'bar',
                    formatter: 'commonjs',
                    importPaths: [altInputDir]
                });

                expect(toString(output)).to.be(expected);

                done();
            }.bind(this));
        });
    });

    describe('basePath', function() {
        it('should use current working directory by default', function(done) {
            process.chdir(inputDir);

            transpile({
                sources: [this.inputs.default]
            }, function(error, output) {
                var expected = make({
                    modules: ['default'],
                    output: 'default',
                    formatter: transpiler.formatters.DEFAULT
                });

                expect(toString(output)).to.be(expected);

                done();
            }.bind(this));
        });

        it('should resolve modules relative to basePath', function(done) {
            var dir = __dirname + '/input';

            transpile({
                sources: [this.inputs.default],
                basePath: dir
            }, function(error, output) {
                var expected = make({
                    modules: ['main/default'],
                    output: 'default',
                    formatter: transpiler.formatters.DEFAULT,
                    importPaths: [dir]
                });

                expect(toString(output)).to.be(expected);

                done();
            }.bind(this));
        });
    });

    describe('formatters', function() {
        it('should have DEFAULT key', function() {
            expect(transpiler.formatters).to.have.property('DEFAULT');
        });

        it('should have default formatter with its name stored in DEFAULT key', function() {
            expect(transpiler.formatters).to.have.property(transpiler.formatters.DEFAULT);
            expect(transpiler.formatters[transpiler.formatters.DEFAULT]).to.be.a(Function);
        });
    });

    describe('moduleName', function() {
        it('should use "default" if there are more modules', function(done) {
            transpile({
                sources: [this.inputs.export, this.inputs.foo],
                basePath: inputDir
            }, function(error, output) {
                var expected = make({
                    modules: ['export', 'foo'],
                    output: 'default',
                    formatter: transpiler.formatters.DEFAULT
                });

                expect(toString(output)).to.be(expected);

                done();
            }.bind(this));
        });

        it('should use module name if there is only one', function(done) {
            transpile({
                sources: [this.inputs.default],
                basePath: inputDir
            }, function(error, output) {
                var expected = make({
                    modules: ['default'],
                    output: 'default',
                    formatter: transpiler.formatters.DEFAULT
                });

                expect(toString(output)).to.be(expected);

                done();
            }.bind(this));
        });

        it('should use moduleName from options if specified', function(done) {
            transpile({
                sources: [this.inputs.default],
                basePath: inputDir,
                moduleName: 'bundle'
            }, function(error, output) {
                var expected = make({
                    modules: ['default'],
                    output: 'bundle',
                    formatter: transpiler.formatters.DEFAULT
                });

                expect(toString(output)).to.be(expected);

                done();
            }.bind(this));
        });
    });
});
