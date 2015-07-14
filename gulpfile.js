// very simple compiler

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');

gulp.task('css', function() {
  return gulp.src(['src/editor.css'])
    .pipe(minifyCSS())
    .pipe(concat('fioi-editor.min.css'))
    .pipe(gulp.dest('dst'));
});

gulp.task('js', function() {
  return gulp.src(['src/editor.js','src/common.js','src/task.js','src/editor.codemirror.js','src/tester.js','src/evaluator.js'])
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(concat('fioi-editor.min.js'))
    .pipe(gulp.dest('dst'));
});

gulp.task('compile', ['css', 'js']);
