var gulp = require('gulp'),
  minifyCSS = require('gulp-minify-css'),
  less = require('gulp-less'),
  sourcemaps = require('gulp-sourcemaps'),
  handleErrors = require('../util/handleErrors'),
  config=require('../config').less;
  var uglifycss = require('gulp-uglifycss');

gulp.task('less', function() {
  return gulp.src(config.src)
    .pipe(sourcemaps.init())
    .pipe(less())
    .on('error', handleErrors)
    .pipe(minifyCSS({keepBreaks:true}))
    .pipe(uglifycss({
      maxLineLen: 80
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.dest));
});
