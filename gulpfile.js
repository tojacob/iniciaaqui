'use strict';
const { src, dest, parallel, series, watch } = require('gulp'),
  pug = require('gulp-pug'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  browserSync = require('browser-sync').create(),
  postcss = require('gulp-postcss'),
  del = require('del'),
  cssnano = require('cssnano'),
  autoprefixer = require('autoprefixer'),
  babel = require('gulp-babel'),
  babelPolyfill = './node_modules/@babel/polyfill/dist/polyfill.min.js',
  babelConfig = require('./babel.config'),
  uglifyjs = require('uglify-js'),
  composer = require('gulp-uglify/composer'),
  pump = require('pump'),
  minify = composer(uglifyjs, console),
  breakFile = require('./scripts/breakFile'),
  formatFile = require('./scripts/formatFile');

// --------------------
// FILES AND FOLDERS TO WORK
// --------------------
const files = {
  dist: {
    folder: './dist',
    images: './dist/assets/images',
    scripts: './dist/assets/scripts',
    views: './dist',
    styles: './dist/assets/styles'
  },
  src: {
    folder: './client/src',
    images: './client/src/images/**/*.*',
    scripts: './client/src/scripts/**/*.js',
    views: './client/src/views/**/*.pug',
    styles: './client/src/styles/**/*.scss',
    favicon: './client/src/favicon/*.*'
  },
  main: {
    views: './client/src/views/pages/**/*.pug',
    styles: './client/src/styles/main.scss'
  },
  data: {
    references: require('./client/src/data/references'),
    chapters: {
      main: './client/src/data/book.txt',
      dist: './client/src/data/chapters',
      src: './client/src/data/chapters/*.html'
    }
  }
};

// ---------------
// COMMON
// ---------------

// Clean dist before compile files
function cleanDist() {
  return del(files.dist.folder);
}

// Move content to dist
function imagesToDist() {
  return src(files.src.images).pipe(dest(files.dist.images));
}

function scriptsToDist() {
  return src(files.src.scripts).pipe(dest(files.dist.scripts));
}

function faviconToDist() {
  return src(files.src.favicon).pipe(dest(files.dist.views));
}

// Compile pug pages
function compileViews() {
  return src(files.main.views)
    .pipe(pug({ locals: { allReferences: files.data.references } }))
    .pipe(dest(files.dist.views));
}

// Common task
function commonTasks() {
  return series(
    cleanDist,
    imagesToDist,
    scriptsToDist,
    faviconToDist,
    compileViews
  );
}

// --------------------
// PRE COMPILE
// --------------------

// Clean chapters
function cleanChapters() {
  return del(files.data.chapters.dist);
}

// Create chapters
function createChapters(cb) {
  return src(files.data.chapters.main)
    .pipe(
      breakFile({
        splitAttribute: {
          exp: '\\r\\n\\r\\n\\r\\n',
          flags: 'gi'
        },
        file: {
          name: 'chapter',
          separator: '_',
          type: 'html'
        },
        showParts: false
      })
    )
    .pipe(dest(files.data.chapters.dist));
}

function formatChapters() {
  return src(files.data.chapters.src)
    .pipe(formatFile())
    .pipe(dest(files.data.chapters.dist));
}

function preCompile() {
  return series(cleanChapters, createChapters, formatChapters);
}

// --------------------
// DEVELOPMENT
// --------------------

// Compile scss to css and add source map
function devCompileStyles() {
  return src(files.main.styles)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(dest(files.dist.styles))
    .pipe(browserSync.stream());
}

// Start local server, live reload and watch files

function devServer(cb) {
  browserSync.init({
    server: files.dist.folder
  });

  watch(files.src.styles, parallel(devCompileStyles));

  watch(files.src.views, parallel(compileViews)).on(
    'change',
    browserSync.reload
  );

  watch(files.src.scripts, parallel(scriptsToDist)).on(
    'change',
    browserSync.reload
  );

  return cb;
}

// Star development tast
function dev() {
  return series(commonTasks(), devCompileStyles, devServer);
}

// --------------------
// PRODUCTION
// --------------------

// Compile scss to css, add prefixes and minify
function prodCompileStyles() {
  return src(files.main.styles)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano({ preset: 'default' })]))
    .pipe(dest(files.dist.styles));
}

// Compile script ES6+ to ES5
function prodCompileScripts(cb) {
  const options = {};

  pump(
    [
      src(files.src.scripts),
      babel(babelConfig),
      minify(options),
      dest(files.dist.scripts)
    ],
    cb
  );
}

// Start production tasks
function prod() {
  return series(
    preCompile(),
    commonTasks(),
    prodCompileStyles,
    prodCompileScripts
  );
}

// --------------------
// Export tasks
// --------------------
exports.pre = preCompile();
exports.dev = dev();
exports.prod = prod();
exports.default = dev();
