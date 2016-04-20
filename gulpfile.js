'use strict';
var b = require('babel-core/register');
const gulp = require('gulp');
const babel = require('gulp-babel');
gulp.task('default', () => {
  return gulp.src('src/*')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('start', function() {
  require('./empower-language-import.js');
});

gulp.task('test', function() {
  const gulpMocha = require('gulp-mocha');
  const gulpUtil = require('gulp-util');
  const options = getOptions({
    reporter: 'spec',
    timeout: undefined
  });
  options.compilers = {
    js: b
  }
  return gulp.src('./test/*.tests.js')
    .pipe(gulpMocha(options))
    .on('error', gulpUtil.log);
});

gulp.task('build', function () {

});

gulp.task('start-watch', function() {
  const gulpNodemon = require('gulp-nodemon');
  gulpNodemon(getOptions({
    script: 'empower-language-import',
    ext: 'html js',
    ignore: []
  }));
});

gulp.task('test-watch', function() {
    gulp.watch(['./test/*.tests.js','./src/*.js'], ['test']);
});

gulp.task('test-coverage', function () {
  const mocha = require('gulp-mocha')
  const cover = require('gulp-coverage');
  return gulp.src(['./test/*.tests.js'],{read: false})
    .pipe(cover.instrument({
        pattern: ['empower-*.js']
    }))
    .pipe(mocha())
    .pipe(cover.gather())
    .pipe(cover.format())
    .pipe(gulp.dest('reports'));
});

function getOptions(defaults) {
  const args = process.argv[0] == 'node' ? process.argv.slice(3) : process.argv.slice(2);
  const minimist = require('minimist');
  return minimist(args, {
    default: defaults
  });
}