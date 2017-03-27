var gulp = require('gulp');

var del = require('del');
var browserify = require('browserify');
var through2 = require('through2');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var path = require('path');

var paths = {
    cascade : {
    	src: 'src/Cascade.js',
    	dist: 'dist',
    },
    types : {
    	src: 'src/types/*.js',
    	dist: 'dist/types',
    },
    dist : 'dist'
};

gulp.task('clean', function (cb) {
    return del(paths.dist, {force: true}, cb);
});

function jsPreProcess(src){
	return gulp.src(src)
	.pipe(through2.obj(function(file, enc, next) {
		  var name = path.parse(file.path).name;
		  browserify(file.path, {
		  	standalone : name.substr(0, 1).toUpperCase() + name.substr(1)
		  })
		  .bundle(function(err, res) {
		      err && console.log(err.stack);
		      file.contents = res;
		      next(null, file);
		  });
	}))
}

gulp.task('js', ['clean'], function() {
	return jsPreProcess(paths.cascade.src)
	.pipe(uglify({preserveComments: 'some'}))
	.pipe(rename('cascade.js'))
	.pipe(gulp.dest(paths.cascade.dist));
});

gulp.task('types', ['clean'], function() {
	return gulp.src(paths.types.src)
	.pipe(uglify({preserveComments: 'some'}))
	.pipe(gulp.dest(paths.types.dist));
});

gulp.task('default', ['js', 'types'], function() {});
