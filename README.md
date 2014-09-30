# gulp-es6-module-transpiler

[Gulp](https://github.com/gulpjs/gulp) plugin for the [ES6 Module Transpiler](https://github.com/esnext/es6-module-transpiler)

[![NPM][npm]](https://npmjs.org/package/gulp-es6mt)
[![Dependency Status][dependencies]](https://david-dm.org/rkusa/gulp-es6-module-transpiler)

```js
npm install gulp-es6mt
```

## Usage

```js
var transpile  = require('gulp-es6mt')
var sourcemaps = require('gulp-sourcemaps')
gulp.task('build', function() {
  return gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
        .pipe(transpile({
          formatter: new transpile.formatters.commonjs
        }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('lib'))
})
```

## MIT License

Copyright (c) 2014 Markus Ast

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[npm]: http://img.shields.io/npm/v/gulp-es6-module-transpiler.svg?style=flat-square
[dependencies]: http://img.shields.io/david/rkusa/gulp-es6-module-transpiler.svg?style=flat-square
