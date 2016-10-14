var gulp = require('gulp');
var mainBowerFiles = require('gulp-main-bower-files');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var filter = require('gulp-filter');
var cleanCSS = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
 
gulp.task('bower.js', function() {
    var filterJS = filter('**/*.js');
    return gulp.src('./bower.json')
        .pipe(mainBowerFiles())
        .pipe(filterJS)
        .pipe(sourcemaps.init())
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/js/'));
});

gulp.task('bower.css', function() {
    return gulp.src('./bower.json')
        .pipe(mainBowerFiles({
            overrides : {
                bootstrap :{
                    main : [
                        './dist/css/bootstrap.min.css'       
                        ]
                }
            }
        }))
        .pipe(filter("**/*.css"))
        //.pipe(sourcemaps.init())
        .pipe(concat('vendor.css'))
        .pipe(cleanCSS())
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/css/'));
});

gulp.task('default',['bower.js','bower.css']);
