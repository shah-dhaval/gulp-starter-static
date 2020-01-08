const {src, dest, watch, series} = require('gulp');
const gulpConcat = require('gulp-concat');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const inject = require('gulp-inject');

const sass = require('gulp-sass');
 
sass.compiler = require('node-sass');

function defaultJs(cb) {
    src('./src/**/*.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(gulpConcat('app.js'))
    .pipe(dest('./dist/js'));

    cb();
}

function vendorJs(cb) {
  src([
      './node_modules/jquery/dist/jquery.js', 
      './node_modules/popper.js/dist/umd/popper.js',
      './node_modules/bootstrap/dist/js/bootstrap.js',
  ])
  .pipe(gulpConcat('vendor.js'))
  .pipe(dest('./dist/js'));

  cb();
}

function defaultStyle(cb) {
  src([
    './src/style/**/*.scss'
  ])
  .pipe(sass().on('error', sass.logError))
  .pipe(gulpConcat('style.css'))
  .pipe(dest('./dist/css'));

  cb();
}

function build(cb) {
  series(defaultJs, vendorJs, defaultStyle, webfonts, images, htmlInclude);
  cb();
}

function webfonts(cb) {
  src('node_modules/@fortawesome/fontawesome-free/webfonts/**/*')
  .pipe(dest('./dist/assets/webfonts'));

  cb();
}

function images(cb) {
  src('./src/assets/images/**/*')
  .pipe(dest('./dist/assets/images'));

  cb();
}

function htmlInclude(cb) {
  var resourceFiles = src(['./dist/**/*.js', './dist/**/*.css'], {read: false})

  var htmlFiles = src(['./src/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(dest('./dist'));

    htmlFiles.pipe(
      inject(resourceFiles, {relative: true})
    )
    .pipe(dest('./dist'))

    cb();
} 



function watchFiles() {
  browserSync.init({
    server: './dist'
  });

  watch('./src/**/*.js', defaultJs).on('change', browserSync.reload);
  watch('./src/style/**/*.scss', defaultStyle).on('change', browserSync.reload);
  watch('./src/**/*.html', htmlInclude).on('change', browserSync.reload);
}



exports.default = series(series(defaultJs, vendorJs, defaultStyle, webfonts, images, htmlInclude), watchFiles);
exports.build = build;