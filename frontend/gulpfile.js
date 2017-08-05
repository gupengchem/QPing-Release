/**
 * Created by wangshuyi on 2017/2/15.
 */

'use strict';

const gulp = require('gulp'),
    sass = require("gulp-sass");

gulp.task('sass', function () {
    return gulp.src('./sass/*')
        .pipe(sass().on('error', sass.logError))
        // .pipe(concat('main.css'))    //合并所有css到main.css
        // .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
        // .pipe(cssnano())
        .pipe(gulp.dest('../public/custom/css'));
});

gulp.task('watch', function () {
    gulp.watch('./sass/*.scss', ['sass']);
});

gulp.task('default', function() {
    // 将你的默认的任务代码放在这
    gulp.start('sass','watch');
});