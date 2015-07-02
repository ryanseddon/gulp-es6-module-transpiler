# gulp-es6-module-transpiler

[Gulp](https://github.com/gulpjs/gulp) plugin for the [ES6 Module Transpiler](https://github.com/esnext/es6-module-transpiler)

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url]

```js
npm install gulp-es6-module-transpiler
```

## Usage

### Basic usage

```js
var transpile  = require('gulp-es6-module-transpiler');

gulp.task('build', function() {
    return gulp.src('src/**/*.js')
        .pipe(transpile({
            formatter: 'bundle'
        }))
        .pipe(gulp.dest('lib'));
})
```

### With source maps

```js
var sourcemaps = require('gulp-sourcemaps');
var transpile  = require('gulp-es6-module-transpiler');

gulp.task('build', function() {
    return gulp.src('src/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(transpile({
            formatter: 'bundle'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('lib'));
 })
 ```


### Options

```formatter``` *```String|Formatter|Formatter constructor```* *[optional]*

Name of built-in formatter, formatter instance of formatter constructor function. Controls the output format of transpiler scripts. All built-in formatters are available as ```formatters``` property of required module ```require('gulp-es6-module-transpiler').formatters```.

Defaults to [es6-module-transpiler](https://github.com/esnext/es6-module-transpiler) default formatter.

**Important** es6-module-transpiler version 0.9.x supports ```bundle``` and ```commonjs``` formatters only.
To support AMD format, please use [es6-module-transpiler-amd-formatter](https://github.com/caridy/es6-module-transpiler-amd-formatter).

```basePath``` *```String```* *[optional]*

All module names will be resolved and named relatively to this path.

Defaults to ```process.cwd()```.

```importPaths``` *```Array<String>```* *[optional]*

Array of path that will be used to resolve modules.

Defaults to ```[ options.basePath ]```.

```sourceMaps``` *```Boolean```* *[optional]*

If set to ```false```, sourceMappingURL is not appended to transpiled files and source maps are not applied. Defaults to ```true```.

## Release history

* 02/07/2015 - v0.2.2 - Bump es6-module-transpiler to 0.10.0
* 02/02/2015 - v0.2.1 - Outputs one file for every input file
* 29/12/2014 - v0.2.0 - 0.5.0+ compatibility with es6-module-transpiler
* 12/07/2014 - v0.1.3 - Normalises paths for windows machines
* 08/06/2014 - v0.1.2 - Added module prefix option
* 16/04/2014 - v0.1.1 - Version bump to 0.4.0

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-es6-module-transpiler
[npm-image]: https://badge.fury.io/js/gulp-es6-module-transpiler.png

[travis-url]: http://travis-ci.org/ryanseddon/gulp-es6-module-transpiler
[travis-image]: https://secure.travis-ci.org/ryanseddon/gulp-es6-module-transpiler.png?branch=master

[depstat-url]: https://david-dm.org/ryanseddon/gulp-es6-module-transpiler
[depstat-image]: https://david-dm.org/ryanseddon/gulp-es6-module-transpiler.png
