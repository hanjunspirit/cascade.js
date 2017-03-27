var gulp = require('gulp');
var babelify = require("babelify");

var del = require('del');
var browserify = require('browserify');
var through2 = require('through2');
var uglify = require('gulp-uglify');
var path = require('path');

process.env.NODE_ENV = 'production';

var paths = {
	src: './src/index.js',
	dist: 'dist',
};

gulp.task('clean', function (cb) {
    return del(paths.dist, {force: true}, cb);
});

function jsPreProcess(src){
	return gulp.src(src)
	.pipe(through2.obj(function(file, enc, next) {
		  var name = path.parse(file.path).name;
		  browserify(file.path)
		  .transform(babelify)
		  .bundle(function(err, res) {
		      err && console.log(err.stack);
		      file.contents = res;
		      next(null, file);
		  });
	}))
}

gulp.task('js', ['clean'], function() {
	return jsPreProcess(paths.src)
	.pipe(uglify({preserveComments: 'some'}))
	.pipe(gulp.dest(paths.dist));
});

gulp.task('default', ['js'], function() {});
