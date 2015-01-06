'use strict';

require('mocha');

var fs = require('fs');
var gulp = require('gulp');
var transpile = require('../lib/index');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var concat = require('gulp-concat');

var expect = require('expect.js');
var inputDir = __dirname + '/input',
    outputDir = __dirname + '/output';

describe('gulp-es6-module-transpiler use cases', function() {
    beforeEach(function(done) {
        del(outputDir, done);
    });

    describe('source maps', function() {
        it('should work with single module', function(done) {
            gulp.src(inputDir + '/main/default.js')
            .pipe(sourcemaps.init())
            .pipe(transpile({
                basePath: inputDir + '/main'
            }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(outputDir))
            .on('end', function() {
                expect(fs.existsSync(outputDir + '/default.js')).to.be(true);
                expect(fs.existsSync(outputDir + '/default.js.map')).to.be(true);
                expect(fs.readFileSync(outputDir + '/default.js').toString('utf8'))
                    .to.contain('\n//# sourceMappingURL=default.js.map');

                done();
            });
        });

        it('should work with multiple modules', function(done) {
            gulp.src([inputDir + '/main/default.js', inputDir + '/main/foo.js'])
                .pipe(sourcemaps.init())
                .pipe(transpile({
                    basePath: inputDir + '/main'
                }))
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(outputDir))
                .on('end', function() {
                    expect(fs.existsSync(outputDir + '/foo.js')).to.be(true);
                    expect(fs.existsSync(outputDir + '/foo.js.map')).to.be(true);
                    expect(fs.readFileSync(outputDir + '/foo.js').toString('utf8'))
                        .to.contain('\n//# sourceMappingURL=foo.js.map');

                    expect(fs.existsSync(outputDir + '/default.js')).to.be(true);
                    expect(fs.existsSync(outputDir + '/default.js.map')).to.be(true);
                    expect(fs.readFileSync(outputDir + '/default.js').toString('utf8'))
                        .to.contain('\n//# sourceMappingURL=default.js.map');

                    done();
                });
        });

        it('should work with concatenated modules', function(done) {
            gulp.src([inputDir + '/main/default.js', inputDir + '/main/foo.js'])
                .pipe(sourcemaps.init())
                .pipe(transpile({
                    basePath: inputDir + '/main'
                }))
                .pipe(concat('bundle.js'))
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(outputDir))
                .on('end', function() {
                    expect(fs.existsSync(outputDir + '/bundle.js')).to.be(true);
                    expect(fs.existsSync(outputDir + '/bundle.js.map')).to.be(true);
                    expect(fs.readFileSync(outputDir + '/bundle.js').toString('utf8'))
                        .to.contain('\n//# sourceMappingURL=bundle.js.map');

                    done();
                });
        });
    });
});
