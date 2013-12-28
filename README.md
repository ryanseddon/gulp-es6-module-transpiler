# gulp-es6-module-transpiler [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url]

> es6-module-transpiler plugin for [gulp](https://github.com/wearefractal/gulp)

## Usage

First, install `gulp-es6-module-transpiler` as a development dependency:

```shell
npm install --save-dev gulp-es6-module-transpiler
```

Then, add it to your `gulpfile.js`:

```javascript
var es6-module-transpiler = require("gulp-es6-module-transpiler");

gulp.src("./src/*.ext")
	.pipe(es6-module-transpiler({
		msg: "Hello Gulp!"
	}))
	.pipe(gulp.dest("./dist"));
```

## API

### es6-module-transpiler(options)

#### options.msg
Type: `String`  
Default: `Hello World`

The message you wish to attach to file.


## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-es6-module-transpiler
[npm-image]: https://badge.fury.io/js/gulp-es6-module-transpiler.png

[travis-url]: http://travis-ci.org/ryanseddon/gulp-es6-module-transpiler
[travis-image]: https://secure.travis-ci.org/ryanseddon/gulp-es6-module-transpiler.png?branch=master

[depstat-url]: https://david-dm.org/ryanseddon/gulp-es6-module-transpiler
[depstat-image]: https://david-dm.org/ryanseddon/gulp-es6-module-transpiler.png
