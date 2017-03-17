var gulp = require('gulp');
var babelify = require("babelify");

var del = require('del');
var browserify = require('browserify');
var through2 = require('through2');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');

var paths = {
    cascade : {
    	src: 'src/cascade.js',
    	dist: 'dist',
    	dist_min: 'dist',
    	cwd: './',
    },
};

gulp.task('clean', function (cb) {
    return del(paths.dist, {force: true}, cb);
});

function jsPreProcess(){
	return gulp.src(paths.cascade.src)
	.pipe(through2.obj(function(file, enc, next) {
		  browserify(file.path, {
		  	standalone : 'Cascade'
		  })
		  .transform(babelify)
		  .bundle(function(err, res) {
		      err && console.log(err.stack);
		      file.contents = res;
		      next(null, file);
		  });
	}))
}

gulp.task('js', ['clean'], function() {
	return jsPreProcess()
	.pipe(rename('cascade.js'))
	.pipe(gulp.dest(paths.cascade.dist_min));
});

gulp.task('js.min', ['clean'], function() {
	return jsPreProcess()
	.pipe(uglify({preserveComments: 'some'}))
	.pipe(rename('cascade.min.js'))
	.pipe(gulp.dest(paths.cascade.dist));
});

gulp.task('default', ['js', 'js.min'], function() {});
