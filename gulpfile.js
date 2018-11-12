'use strict';
const gulp = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const del = require('del');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');

// ===============
// CONSTS
// ===============

const DIST = ['./docs'],
  DIST_ASSETS = './docs/assets',
  DIST_STYLES = './src/assets/styles',
  SRC_ASSETS = ['./src/assets/'],
  SRC_VIEWS = ['./src/views/**/*.pug'],
  SRC_STYLES = './src/styles/**/*.*',
  MAIN_STYLES = './src/styles/main.scss';

// ===============
// COMMON
// ===============

// Clean dist folder before compile files
gulp.task('clean-dist', function() {
  return del(DIST);
});

// Move content from 'src/assets' to 'dist/assets' folder
gulp.task('assets-to-dist', function() {
  return gulp.src(SRC_ASSETS).pipe(gulp.dest(DIST_ASSETS));
});

// Compile pug to html
gulp.task('views', function() {
  return gulp
    .src(SRC_VIEWS)
    .pipe(pug())
    .pipe(gulp.dest(DIST[0]));
});

// ===============
// DEVELOPMENT
// ===============

// Compile scss to css and add source map
gulp.task('dev-styles', function() {
  return gulp
    .src(MAIN_STYLES)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(DIST_STYLES))
    .pipe(browserSync.stream());
});

// Start local server, live reload and call others dev tasks
gulp.task('dev-server', function() {
  browserSync.init({
    server: DIST[0]
  });

  gulp.watch(SRC_STYLES, gulp.parallel('dev-styles'));
  gulp
    .watch(SRC_VIEWS, gulp.parallel('views'))
    .on('change', browserSync.reload);
});

// Run development tasks
gulp.task(
  'dev',
  gulp.series(
    'clean-dist',
    'assets-to-dist',
    'views',
    'dev-styles',
    'dev-server'
  )
);

// ===============
// PRODUCTION
// ===============

// Compile scss to css, add prefixes and minify
gulp.task('prod-styles', function() {
  return gulp
    .src(MAIN_STYLES)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano({ preset: 'default' })]))
    .pipe(gulp.dest(DIST_STYLES));
});

// Run production tasks
gulp.task(
  'prod',
  gulp.series('clean-dist', 'assets-to-dist', 'views', 'prod-styles')
);
