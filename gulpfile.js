/**
 * 组件安装
 * npm install gulp-util gulp-imagemin gulp-less gulp-minify-css gulp-jshint gulp-uglify gulp-rename gulp-concat imagemin-pngquant --save-dev
 */

/**引入 gulp及组件(方法一)
* var gulp    = require('gulp'),                 //基础库
*     imagemin = require('gulp-imagemin'),       //图片压缩
*     sass = require('gulp-less'),          //sass
*     minifycss = require('gulp-minify-css'),    //css压缩
*     jshint = require('gulp-jshint'),           //js检查
*     uglify  = require('gulp-uglify'),          //js压缩
*     rename = require('gulp-rename'),           //重命名
*     concat  = require('gulp-concat'),          //合并文件
**/
/**
 * 引入 gulp及组件(方法二)
 * var gulp=require("gulp");//基础库
 * var $ = require('gulp-load-plugins')();
 * //gulp-load-plugins这个插件能自动帮你加载package.json文件里的gulp插件,也就是原始插件名去掉gulp-前缀，之后再转换为驼峰命名。
 * */
var gulp=require("gulp");
var $ = require('gulp-load-plugins')();
var pngquant=require("imagemin-pngquant");
var con=[];//合并js的存放路径数组
gulp.task('less',function(){
    return gulp.src('static/src/**/*.less',{base:'static/src/'})
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
        .pipe($.minifyCss())
        .pipe($.rename({
            dirname:'css/',
            suffix:'.min',
            extname:'.css'
        }))
        .pipe(gulp.dest('static/dest'))
        .pipe($.connect.reload());
});
gulp.task('js',function(){
    return gulp.src(['static/src/**/*.js','!static/src/**/*.copy.js'],{base:'static/src/'})
        .pipe($.uglify())
        .pipe($.rename({
            dirname:'js/',
            suffix:'.min',
            extname:'.js'
        }))
        .pipe(gulp.dest('static/dest'))
        .pipe($.connect.reload());
});
gulp.task('jshint',function(){
    return gulp.src('static/src/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter())
        .pipe($.connect.reload());
});
gulp.task('html',function(){
    return gulp.src('static/src/**/*.html',{base:'static/src/'})
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
        .pipe($.imagemin({
            progressive: true,//类型：Boolean 默认：false 无损压缩jpg图片
            svgoPlugins: [{removeViewBox: false}],//不要移除svg的viewbox属性
            use: [pngquant()],//使用pngquant深度压缩png图片的imagemin插件
            optimizationLevel: 5 ,//类型：Number  默认：3  取值范围：0-7（优化等级）
            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
        }))
        .pipe($.rename({
            dirname:'imgs/',
            suffix:'.min'
        }))
        .pipe(gulp.dest('static/dest'))
        .pipe($.connect.reload());
});
gulp.task('concat_js',function(){
    //组合对象路径数组
    con=[
        ['static/src/**/js/c.js','static/src/**/jsconcat/a.js','!static/src/**/jsconcat/*.copy.js'],
        ['static/src/**/jsconcat/*.js','!static/src/**/jsconcat/*.copy.js']
    ];
    //对应组合文件的名字
    var cN=[
        "c1",
        "c2"
    ];
    var arry=[];
    for(var i=0;i<con.length;i++){
        arry.push=gulp.src(con[i])
            .pipe($.concat(cN[i]))
            .pipe($.uglify())
            .pipe($.rename({
                dirname:'jsconcat/',
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
    gulp.watch('static/src/**/*.less',['less']);
    gulp.watch('static/src/**/*.css',['css']);
    gulp.watch('static/src/**/*.js',['js']);
    gulp.watch('static/src/**/*.js',['jshint']);
    gulp.watch('static/src/**/*.{jpg,png,gif,svg}',['image']);
    gulp.watch('static/src/**/*.html',['html']);
    for(var i=0;i<con.length;i++){
        gulp.watch(con[i],['concat_js']);
    }
});
gulp.task('default',['less','css','js','image','jshint','html','concat_js','server','watch']);