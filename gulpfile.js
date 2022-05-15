const { src, dest } = require('gulp');
const eslint = require('gulp-eslint');
const nodemon = require('gulp-nodemon');
const gulp = require('gulp');

gulp.task('lint:fix', () => src([ '*.js', 'events/*.js' ]).pipe(eslint({ fix: true }))
	.pipe(eslint.format())
	.pipe(dest(file => file.base))
	.pipe(eslint.failAfterError()));
gulp.task('lint', () => src([ '*.js', 'events/*.js' ]).pipe(eslint())
	.pipe(eslint.format())
	.pipe(eslint.failAfterError()));

gulp.task('develop', done => {
	const stream = nodemon({
		script: 'index.js',
		ext: 'js',
		env: { NODE_ENV: 'development' },
		tasks: [ 'lint' ],
		done });
	stream
		.on('restart', () => {
			console.log('restarted!');
		})
		.on('crash', () => {
			console.error('Application has crashed!\n');
			stream.emit('restart', 10); // Restart the server in 10 seconds
		});
});
