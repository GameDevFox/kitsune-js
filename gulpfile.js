require('source-map-support').install();

var gulp = require("gulp");

var del = require("del");
var babel = require("gulp-babel");
var jshint = require("gulp-jshint");
var jshintStylish = require("jshint-stylish");
var plumber = require("gulp-plumber");
var symlink = require("gulp-symlink");

var srcPath = "./src/**/*.js";
var testPath = "./test/**/*.js";

gulp.task("default", ["build", "watch"]);

gulp.task("clean", function(done) {
	del(["./app", "./node_modules/katana"], done);
});

gulp.task("lint", function() {
	return gulp.src(srcPath)
		.pipe(jshint({ esnext: true }))
		.pipe(jshint.reporter(jshintStylish));
});

gulp.task("build", ["lint", "clean"], function() {
	return gulp.src(srcPath)
		.pipe(plumber())
		.pipe(babel({ sourceMaps: "inline" }))
		.pipe(gulp.dest("./app"));
});

// gulp.task("prepend-source-map-support", ["build"], function() {
// 	return gulp.src("./app/kitsune.js")
// 		.pipe(insert.prepend("require('source-map-support').install();\n"))
// 		.pipe(gulp.dest("./app"));
// });

gulp.task("link", ["build"], function() {
	return gulp.src("./app/katana")
		.pipe(symlink("./node_modules/katana"));
});

// gulp.task("start", ["prepend-source-map-support", "link"], function() {
gulp.task("start", ["link"], function() {
	var kitsune = require("./app/kitsune");
	kitsune();
});

gulp.task("watch", function() {
	gulp.watch(srcPath, ["build"]);
});
