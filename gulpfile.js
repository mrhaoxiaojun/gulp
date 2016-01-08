/**
 * 组件安装
 * npm install gulp-util gulp-imagemin gulp-less gulp-minify-css gulp-jshint gulp-uglify gulp-rename gulp-concat gulp-plumber  gulp-cache gulp-util imagemin-pngquant browserify through2 --save-dev
 */

/**引入 gulp及组件(方法一)
* var gulp    = require('gulp'),                 //基础库
*     imagemin = require('gulp-imagemin'),       //图片压缩
*     less = require('gulp-less'),               //less
*     minifycss = require('gulp-minify-css'),    //css压缩
*     jshint = require('gulp-jshint'),           //js检查
*     uglify  = require('gulp-uglify'),          //js压缩
*     rename = require('gulp-rename'),           //重命名
*     plumber  = require('gulp-plumber'),        //处理所有错误的通用方法
*     cache  = require('gulp-cache'),            //只压缩修改的图片
*    gutil = require('gulp-util')               //打印错误日志
*     pngquant  = require('imagemin-pngquant'),  //深度压缩png图片
*     browserify  = require('browserify'),       //模块化工具
*    through2 = require('through2');            // gulp 管道中使用 throuth2 操作 vinyl 文件对象，browserify 处理以后再返回管道中。
**/
/**
 * 引入 gulp及组件(方法二)
 * var gulp=require("gulp");//基础库
 * var $ = require('gulp-load-plugins')();
 * gulp-load-plugins这个插件能自动帮你加载package.json文件里的gulp插件,也就是原始插件名去掉gulp-前缀，之后再转换为驼峰命名。
 * */
var gulp=require("gulp");//基础组件
var $ = require('gulp-load-plugins')();//自动帮你加载gulp插件“gulp-...”
var pngquant=require("imagemin-pngquant");//深度压缩png图片
var browserify=require("browserify");//模块化组件
var through2 = require('through2');// gulp 管道中使用 throuth2 操作 vinyl 文件对象，browserify 处理以后再返回管道中。
var con=[];//合并js的存放路径数组
gulp.task('less',function(){
    return gulp.src('static/src/**/*.less',{base:'static/src/'})
        .pipe($.plumber())
        .pipe($.less())
        .pipe($.minifyCss())
        .pipe($.rename({
        dirname:'less_css/',
        suffix:'.min',
        extname:'.css'
        }))
        .pipe(gulp.dest('static/dest'))
        .pipe($.connect.reload());
});
gulp.task('css',function(){
    return gulp.src('static/src/**/*.css',{base:'static/src/'})
        .pipe($.plumber())
        .pipe($.minifyCss())
        .pipe($.rename({
            dirname:'css/',
            suffix:'.min',
            extname:'.css'
        }))
        .pipe(gulp.dest('static/dest'))
        .pipe($.connect.reload());
});
gulp.task('browserify', function() {
    return gulp.src(['static/src/**/*.js','!static/src/**/*.copy.js','!static/src/core/**/*.*'],{base:'static/src/'})
        .pipe(through2.obj(function(file, enc, next) {
            browserify(file.path)
                .bundle(function(err, res) {
                    err && console.log(err.stack);
                    file.contents = res;
                    next(null, file);
                });
        }))
        // log errors if they happen
        .on('error', $.util.log.bind($.util,'Browserify Error'))
        .pipe($.plumber())
        .pipe($.connect.reload())
        .pipe($.uglify())
        .pipe($.rename({
            dirname:'js/',
            suffix:'.min',
            extname:'.js'
        }))
        .pipe(gulp.dest('static/dest'))
        .pipe($.connect.reload())
});
gulp.task('jshint',function(){
    return gulp.src('static/src/**/*.js')
        .pipe($.plumber())
        .pipe($.jshint())
        .pipe($.jshint.reporter())
        .pipe($.connect.reload());
});
gulp.task('html',function(){
    return gulp.src('static/src/**/*.html',{base:'static/src/'})
        .pipe($.plumber())
        .pipe($.minifyHtml({ empty: true }))
        .pipe($.rename({
            dirname:'html/',
            suffix:'.min',
            extname:'.html'
        }))
        .pipe(gulp.dest('static/dest'))
        .pipe($.connect.reload());
});
gulp.task('image',function(){
    return gulp.src('static/src/**/*.{png,jpg,gif,svg}',{base:'static/src/'})
        .pipe($.cache($.imagemin({
            progressive: true,//渐进式扫描,类型：Boolean 默认：false 无损压缩jpg图片
            svgoPlugins: [{removeViewBox: false}],//不要移除svg的viewbox属性
            use: [pngquant()],//使用pngquant深度压缩png图片的imagemin插件
            optimizationLevel: 5 ,//类型：Number  默认：3  取值范围：0-7（优化等级）
            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
        })))
        .pipe($.rename({
            dirname:'imgs/',
            suffix:'.min'
        }))
        .pipe(gulp.dest('static/dest'))
        .pipe($.connect.reload());
});
//不支持合并模块化文件function，建议使用模块自动加载合并
gulp.task('concat_js',function(){
    //组合对象路径数组
    con=[
        ['static/src/**/js/a.js','static/src/activity/pc_999hello/**/b.js','!static/src/**/*.copy.js'],
        ['static/src/activity/pc_999hello/**/*.js','!static/src/**/*.copy.js']
    ];
    //对应组合文件的名字
    var cN=[
        "c1",
        "c2"
    ],arry=[],i=0;
    for(;i<con.length;i++){
        arry.push=gulp.src(con[i])
            .pipe($.plumber())
            .pipe($.concat(cN[i]))
            .pipe($.uglify())
            .pipe($.rename({
                dirname:'js/',
                suffix:'.min',
                extname:'.js'
            }))
            .pipe(gulp.dest('static/dest'))
            .pipe($.connect.reload());
    }
    return arry;
});
gulp.task('server',function(){
    $.connect.server({
        root:'static/dest/',//服务器的根目录
        port:8080,//服务器的地址，没有此配置项默认也是 8080
        livereload: true//在server配置中增加livereload启用实时刷新的功能
    });
});
gulp.task('watch',function(){
    gulp.watch('static/src/**/*.less',['less']).on('change', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
    gulp.watch('static/src/**/*.css',['css']).on('change', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
    gulp.watch('static/src/**/*.js',['browserify']).on('change', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
    gulp.watch('static/src/**/*.html',['html']).on('change', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
    gulp.watch('static/src/**/*.js',['jshint']);
    gulp.watch('static/src/**/*.{jpg,png,gif,svg}',['image']);
    for(var i=0;i<con.length;i++){
        gulp.watch(con[i],['concat_js']);
    }
});
gulp.task('default',['less','css','image','browserify','jshint','html','concat_js','server','watch'],function(){
    console.log("Waiting...");
});

/*
* 如果项目不模块化开发，可以只单纯压缩js，如下
* */
//gulp.task('js',function(){
//    return gulp.src(['static/src/**/*.js','!static/src/**/*.copy.js'],{base:'static/src/'})
//        .pipe($.plumber())
//        .pipe($.uglify())
//        .pipe($.rename({
//            dirname:'js/',
//            suffix:'.min',
//            extname:'.js'
//        }))
//        .pipe(gulp.dest('static/dest'))
//        .pipe($.connect.reload());
//});