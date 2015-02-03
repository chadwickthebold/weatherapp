var gulp = require('gulp'),
		changed = require('gulp-changed'),
		clean = require('gulp-clean'),
		concat = require('gulp-concat'),
		jasmine = require('gulp-jasmine'),
		less = require('gulp-less'),
		rename = require('gulp-rename'),
		uglify = require('gulp-uglify'),
		util = require('gulp-util'),
		connect = require('gulp-connect');

var paths = {
	scripts: ['js/*.js'],
	styles: ['less/*.less']
};



gulp.task('serve', function() {
	connect.server({
		port: 4444,
		livereload: true
	});
});


gulp.task('less', function() {
	gulp.src('./less/*.less')
			.pipe(less())
			.pipe(concat('styles.css'))
			.pipe(gulp.dest('./css'))
			.pipe(connect.reload());
});


gulp.task('scripts', function() {
	connect.reload();
})



gulp.task('test', function() {

});


gulp.task('watch', function() {
	gulp.watch(paths.scripts, ['scripts']);
	gulp.watch(paths.styles, ['less']);
});


gulp.task('dist', function() {

});


gulp.task('default', ['less', 'watch', 'serve']);
