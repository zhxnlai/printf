var gulp = require('gulp'),
  minifyCSS = require('gulp-minify-css'),
  less = require('gulp-less'),
  sourcemaps = require('gulp-sourcemaps'),
  handleErrors = require('../util/handleErrors'),
  config=require('../config').less;
var autoprefixer = require('autoprefixer-core');
var gutil = require('gulp-util');

gulp.task('less', function() {
  return gulp.src(config.src)
    .pipe(config.debug ? sourcemaps.init() : gutil.noop())
    .pipe(less())
    .on('error', handleErrors)
    .pipe(config.debug ? sourcemaps.write() : gutil.noop())
    .pipe(gulp.dest(config.dest));
});
