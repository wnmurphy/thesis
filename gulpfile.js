var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var react = require('gulp-react');
var html = require('gulp-html-replace');

var path = {
  all: [
    'client/*.js',
    'client/index.html',
    'client/*.jsx',
    'client/**/*.js',
    'client/**/*.jsx',
    '!client/dist/*.js',
    '!client/dist/*.html',
    '!client/dist/*.jsx',
    '!client/dist/**/*.js',
    '!client/dist/**/*.html',
    '!client/dist/**/*.jsx',
    '!client/lib/**/*.js'
  ],
  js: [
    'client/*.js',
    'client/*.jsx',
    'client/**/*.js',
    'client/**/*.jsx',
    '!client/dist/*.js',
    '!client/dist/*.jsx',
    '!client/dist/**/*.js',
    '!client/dist/**/*.jsx'
  ],
  html: [
    'client/index.html'
  ],
  minified_out: 'min.js',
  dest_src: 'client/dist/src',
  dest_build: 'client/dist/build',
  dest: 'client/dist' 
};

gulp.task('transform', function() {
  gulp.src(path.js)
  .pipe(react())
  .pipe(gulp.dest(path.dest_src));
});

gulp.task('watch', function() {
  gulp.watch(path.all, ['transform']);
});

gulp.task('default', ['watch']);

gulp.task('build', function() {
  gulp.src(path.js)
  .pipe(react())
  .pipe(concat(path.minified_out))
  .pipe(uglify(path.minified_out))
  .pipe(gulp.dest(path.dest_build));
});

gulp.task('replacehtml', function() {
  gulp.src(path.html)
  .pipe(html({'js': 'build/' + path.minified_out}))
  .pipe(gulp.dest(path.dest));
});

gulp.task('production', ['replacehtml', 'build']);



