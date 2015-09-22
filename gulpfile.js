require('source-map-support').install();

var gulp = require("gulp");

var _ = require("lodash");
var del = require("del");
var babel = require("gulp-babel");
var istanbul = require("gulp-istanbul");
var jshint = require("gulp-jshint");
var jshintStylish = require("jshint-stylish");
var mocha = require("gulp-mocha");
var plumber = require("gulp-plumber");

var srcPath = "./src/**/*.js";
var testPath = "./test/**/*.spec.js";
var katanaTestPath = "./src/katana/test/**/*.spec.js";

var testBuildPath = ["./build/test/katana/**/*.spec.js", "./build/test/kitsune/**/*.spec.js"];

gulp.task("default", ["build", "watch"]);

gulp.task("clean", function(done) {
	del(["./build",
		 "./coverage"
		], done);
});

gulp.task("lint", function() {
	return gulp.src([srcPath, testPath])
		.pipe(jshint({ esnext: true }))
		.pipe(jshint.reporter(jshintStylish))
		.pipe(jshint.reporter("fail"));
});

gulp.task("build", ["lint"], function() {
	return gulp.src([srcPath, "!"+katanaTestPath])
		.pipe(plumber())
		.pipe(babel({ sourceMaps: "inline", optional: ["runtime"] }))
		.pipe(gulp.dest("./build"));
});

gulp.task("build-test", ["build-test-katana", "build-test-kitsune"]);

gulp.task("build-test-katana", ["lint"], function() {
	return gulp.src(katanaTestPath)
		.pipe(plumber())
		.pipe(babel({ sourceMaps: "inline", optional: ["runtime"] }))
		.pipe(gulp.dest("./build/test/katana"));
});

gulp.task("build-test-kitsune", ["lint"], function() {
	return gulp.src(testPath)
		.pipe(plumber())
		.pipe(babel({ sourceMaps: "inline" , optional: ["runtime"] }))
		.pipe(gulp.dest("./build/test/kitsune"));
});

gulp.task("test", ["build", "build-test"], function() {
	return gulp.src(testBuildPath)
		.pipe(mocha());
});

gulp.task("test-only", ["build-test"], function() {
	return gulp.src(testBuildPath)
		.pipe(mocha());
});

gulp.task("coverage", ["build", "build-test"], function(done) {
	gulp.src(["./build/**/*.js", "!./build/test/**/*.spec.js"])
		.pipe(istanbul({
			includeUntested: true
		}))
		.pipe(istanbul.hookRequire())
		.on("finish", function() {
			gulp.src(testBuildPath)
				.pipe(mocha())
				.pipe(istanbul.writeReports())
				.on("end", done);
		});
});

// gulp.task("prepend-source-map-support", ["build"], function() {
// 	return gulp.src("./app/kitsune.js")
// 		.pipe(insert.prepend("require('source-map-support').install();\n"))
// 		.pipe(gulp.dest("./app"));
// });

// gulp.task("start", ["prepend-source-map-support", "build"], function() {
gulp.task("start", ["link"], function() {
	var kitsune = require("./app/kitsune");
	kitsune();
});

gulp.task("watch", ["watch-src"], function() {
	gulp.watch([testPath, katanaTestPath], ["test"]);
});

gulp.task("watch-src", function() {
	gulp.watch(srcPath, ["test"]);
});

gulp.task("watch-coverage", function() {
	gulp.watch([srcPath, testPath], ["coverage"]);
});
