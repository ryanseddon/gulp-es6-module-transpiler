# gulp-es6-module-transpiler [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url]

> es6-module-transpiler plugin for [gulp](https://github.com/wearefractal/gulp)

## Usage

First, install `gulp-es6-module-transpiler` as a development dependency:

```shell
npm install --save-dev gulp-es6-module-transpiler
```

Then, add it to your `gulpfile.js`:

```javascript
var es6ModuleTranspiler = require("gulp-es6-module-transpiler");

gulp.src("./src/*.js")
	.pipe(es6ModuleTranspiler({
		type: "amd"
	}))
	.pipe(gulp.dest("./dist"));
```

## API

### es6ModuleTranspiler(options)

#### options.type
Type: `String`

#### options.moduleName
Type: `String`  
Default: `''`

#### options.exports
Type: `Object`  


## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-es6-module-transpiler
[npm-image]: https://badge.fury.io/js/gulp-es6-module-transpiler.png

[travis-url]: http://travis-ci.org/ryanseddon/gulp-es6-module-transpiler
[travis-image]: https://secure.travis-ci.org/ryanseddon/gulp-es6-module-transpiler.png?branch=master

[depstat-url]: https://david-dm.org/ryanseddon/gulp-es6-module-transpiler
[depstat-image]: https://david-dm.org/ryanseddon/gulp-es6-module-transpiler.png
