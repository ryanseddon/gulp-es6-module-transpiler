'use strict';

require('mocha');

var fs = require('fs');
var tempWrite = require('temp-write');
var es6 = require('es6-module-transpiler');

var expect = require('expect.js');

var gutil = require('gulp-util'),
    transpiler = require('../lib/index');

var inputDir = __dirname + '/input/main/',
    altInputDir = __dirname + '/input/alternative/',
    cwd = process.cwd();

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

        // es6-module-transpiler appends source map URL by default
        return fs.readFileSync(output).toString('utf8')
            .replace(/\n\n\/\/# sourceMappingURL=.*?$/, '');
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

    function verify(transpileOptions, makeOptions, callback) {
        transpile(transpileOptions, function(error, output) {
            expect(error).to.be(null);
            expect(toString(output)).to.be(make(makeOptions));

            callback();
        });
    }

    function toString(file) {
        return file.contents.toString('utf8');
    }

    var inputs = load(inputDir);

    describe('options', function() {
        it('should not throw error if no options were provided', function() {
            expect(function() {
                transpiler();
            }).to.not.throwException();
        });

        describe('formatter', function() {
            it('should use DEFAULT if not specified', function(done) {
                verify({
                    sources: [inputs.default],
                    basePath: inputDir
                }, {
                    modules: ['default'],
                    output: 'default',
                    formatter: transpiler.formatters.DEFAULT
                }, done);
            });

            it('should accept formatter instance', function(done) {
                verify({
                    sources: [inputs.default],
                    basePath: inputDir,
                    formatter: new transpiler.formatters.commonjs()
                }, {
                    modules: ['default'],
                    output: 'default',
                    formatter: 'commonjs'
                }, done);
            });

            it('should accept constructor function', function(done) {
                verify({
                    sources: [inputs.default],
                    basePath: inputDir,
                    formatter: transpiler.formatters.commonjs
                }, {
                    modules: ['default'],
                    output: 'default',
                    formatter: 'commonjs'
                }, done);
            });

            it('should accept string identifier', function(done) {
                verify({
                    sources: [inputs.default],
                    formatter: 'commonjs',
                    basePath: inputDir
                }, {
                    modules: ['default'],
                    output: 'default',
                    formatter: 'commonjs'
                }, done);
            });

            it('should throw error if no such formatter exists', function() {
                expect(function() {
                    transpile({
                        sources: [inputs.default],
                        formatter: 'mongodb'
                    }, function() {});
                }.bind(this)).to.throwError();
            });
        });

        describe('importPaths', function() {
            it('should use basePath as default', function(done) {
                verify({
                    sources: [inputs.import],
                    formatter: 'commonjs',
                    basePath: inputDir
                }, {
                    modules: ['import'],
                    output: 'import',
                    formatter: 'commonjs',
                    importPaths: [inputDir]
                }, done);
            });

            it('should accept array of strings', function(done) {
                verify({
                    sources: [inputs.importAlt],
                    formatter: 'commonjs',
                    basePath: altInputDir,
                    importPaths: [inputDir, altInputDir]
                }, {
                    modules: ['importAlt'],
                    output: 'importAlt',
                    formatter: 'commonjs',
                    importPaths: [inputDir, altInputDir]
                }, done);
            });
        });

        describe('basePath', function() {
            afterEach(function() {
                process.chdir(cwd);
            });

            it('should use current working directory by default', function(done) {
                process.chdir(inputDir);

                verify({
                    sources: [inputs.default]
                }, {
                    modules: ['default'],
                    output: 'default',
                    formatter: transpiler.formatters.DEFAULT
                }, done);
            });

            it('should resolve modules relative to basePath', function(done) {
                var dir = __dirname + '/input';

                verify({
                    sources: [inputs.default],
                    basePath: dir
                }, {
                    modules: ['main/default'],
                    output: 'default',
                    formatter: transpiler.formatters.DEFAULT,
                    importPaths: [dir]
                }, done);
            });
        });

        describe('sourceMaps', function() {
            context('if not false', function() {
                it('should not append source maps URL', function(done) {
                    transpile({
                        sources: [inputs.default],
                        basePath: inputDir,
                        sourceMaps: null
                    }, function(error, output) {
                        expect(error).to.be(null);
                        expect(toString(output)).to.not.contain('sourceMappingURL=default.map');

                        done();
                    });
                });

                it('should add sourceMap to output file', function(done) {
                    transpile({
                        sources: [inputs.default],
                        basePath: inputDir,
                        sourceMaps: true
                    }, function(error, output) {
                        expect(error).to.be(null);
                        expect(output.sourceMap).to.eql({
                            version: 3,
                            sources: [ 'default.js' ],
                            names: [],
                            mappings: ';;IAAA,CAAC,CAAC,kBAAS,EAAE,CAAC,CAAC,CAAC' +
                                ',CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,EAAE,EAAE,CAAC',
                            file: 'default',
                            sourcesContent: [ inputs.default.contents.toString('utf8') ]
                        });

                        done();
                    });
                });
            });

            context('if false', function() {
                it('should not append source maps URL', function(done) {
                    transpile({
                        sources: [inputs.default],
                        basePath: inputDir,
                        sourceMaps: false
                    }, function(error, output) {
                        expect(error).to.be(null);
                        expect(toString(output)).to.not.contain('sourceMappingURL=default.map');

                        done();
                    });
                });
            });
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

    describe('conversion', function() {
        describe('error', function() {
            it('should append importPaths if "missing module import" error was thrown', function() {
                transpile({
                    sources: [inputs.importAlt],
                    basePath: inputDir
                }, function(error) {
                    // Windows compatibility
                    var inputDirRegex = inputDir.replace(/\\/g, '\\\\\\\\');

                    expect(error.message).to.match(new RegExp(
                        'missing module import from importAlt.js for path: bar.' +
                        ' Looking in: \\["' + inputDirRegex + '"\\]'
                    ));
                });
            });
        });

        it('should output one file for every input file', function(done) {
            var sources = [inputs.default, inputs.import],
                outputs = ['default', 'import'].map(function(source) {
                    return make({
                        modules: [source],
                        output: source,
                        formatter: transpiler.formatters.DEFAULT
                    });
                }),
                i = 0;

            transpile({
                sources: sources,
                basePath: inputDir
            }, function(error, output) {
                expect(error).to.be(null);
                expect(toString(output)).to.be(outputs[i]);

                if (++i === sources.length) {
                    done();
                }
            });
        });
    });
});
