const { src, dest } = require('gulp');
const eslint = require('gulp-eslint');
const nodemon = require('gulp-nodemon');
const gulp = require('gulp');


gulp.task('lint:fix', function () {
	return src([ '*.js', 'events/*.js' ]).pipe(eslint({ fix:true }))
		.pipe(eslint.format())
		.pipe(dest(file => file.base))
		.pipe(eslint.failAfterError());
});
gulp.task('lint', function () {
	return src([ '*.js', 'events/*.js' ]).pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());

});

gulp.task('develop', function (done) {
	const stream = nodemon({
		script: 'index.js',
		ext: 'js',
		env: { 'NODE_ENV': 'development' },
		tasks: [ 'lint' ],
		done: done });
	stream
		.on('restart', function () {
			console.log('restarted!');
		})
		.on('crash', function() {
			console.error('Application has crashed!\n');
			stream.emit('restart', 10);  // restart the server in 10 seconds
		});
});