const {src, dest} = require('gulp');
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const nodemon = require('gulp-nodemon');

gulp.task('lint:fix', function () {
	return src(['*.js', 'events/*.js']).pipe(eslint({fix:true}))
		// eslint.format() outputs the lint results to the console.
		// Alternatively use eslint.formatEach() (see Docs).
		.pipe(eslint.format())
		// if fixed, write the file to dest
		.pipe(dest(file => file.base))
		// To have the process exit with an error code (1) on
		// lint error, return the stream and pipe to failAfterError
		// last.
		.pipe(eslint.failAfterError());
});
gulp.task('lint', function () {
	return src(['*.js', 'events/*.js']).pipe(eslint())
		// eslint.format() outputs the lint results to the console.
		// Alternatively use eslint.formatEach() (see Docs).
		.pipe(eslint.format())
		// To have the process exit with an error code (1) on
		// lint error, return the stream and pipe to failAfterError
		// last.
		.pipe(eslint.failAfterError());
});

gulp.task('develop', function (done) {
	const stream = nodemon({
		script: 'index.js',
		ext: 'js',
		env: { 'NODE_ENV': 'development' },
		tasks: ['lint'],
		done: done});
	stream
		.on('restart', function () {
			console.log('restarted!');
		})
		.on('crash', function() {
			console.error('Application has crashed!\n');
			stream.emit('restart', 10);  // restart the server in 10 seconds
		});
});